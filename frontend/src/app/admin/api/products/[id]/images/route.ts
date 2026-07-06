import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { revalidatePublic } from "@/lib/revalidate-public";
import { unlink } from "fs/promises";
import path from "path";
import { supabaseAdmin } from "@/utils/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { url, altText, isPrimary } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });

    const existingCount = await prisma.productImage.count({ where: { productId: id } });

    const image = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        altText: altText || "",
        isPrimary: isPrimary ?? existingCount === 0,
        sortOrder: existingCount,
      },
    });

    revalidatePublic("shop");
    return NextResponse.json({ success: true, data: image }, { status: 201 });
  } catch (error) {
    console.error("Add image error:", error);
    return NextResponse.json({ success: false, error: "Failed to add image" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { imageId } = await request.json();
    if (!imageId) return NextResponse.json({ success: false, error: "imageId is required" }, { status: 400 });

    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId: id } });
    if (!image) return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });

    await prisma.productImage.delete({ where: { id: imageId } });

    try {
      const filename = image.url.split("/").pop();
      // Try Supabase Storage first
      const { error } = await supabaseAdmin.storage.from("product-images").remove([filename!]);
      if (error) {
        // Fallback: remove from local filesystem
        if (filename) await unlink(path.join(process.cwd(), "public", "uploads", filename));
      }
    } catch {
      try {
        const filename = image.url.split("/").pop();
        if (filename) await unlink(path.join(process.cwd(), "public", "uploads", filename));
      } catch {}
    }

    revalidatePublic("shop");
    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 });
  }
}
