import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getCurrentUser } from "@/lib/admin-auth";

const SUPABASE_BUCKET = "product-images";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl = "";

    // Try Supabase Storage first
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .upload(filename, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(filename);

      publicUrl = urlData.publicUrl;
    } catch (storageError) {
      console.warn("Supabase Storage upload failed, falling back to local:", storageError);

      // Fallback to local filesystem
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      publicUrl = `/uploads/${filename}`;
    }

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, filename, size: buffer.length },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
  }
}
