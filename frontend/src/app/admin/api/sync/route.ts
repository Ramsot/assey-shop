import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";
import { getDjangoProducts, getDjangoOrders } from "@/lib/django-client";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const results: Record<string, number> = {};

  try {
    const djangoProducts = await getDjangoProducts({ page_size: "100" });
    if (djangoProducts?.results) {
      let count = 0;
      for (const dp of djangoProducts.results) {
        const slug = dp.slug || dp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const product = await prisma.product.upsert({
          where: { sku: dp.sku },
          update: {
            name: dp.name, slug, subtitle: dp.subtitle || "",
            price: parseFloat(dp.price || "0"), description: dp.description || "",
            material: dp.material || "", size: dp.size || "",
            stockQty: dp.stock_qty ?? 0,
            isActive: dp.is_active ?? true, isFeatured: dp.is_featured ?? false,
          },
          create: {
            sku: dp.sku, name: dp.name, slug, subtitle: dp.subtitle || "",
            price: parseFloat(dp.price || "0"), description: dp.description || "",
            material: dp.material || "", size: dp.size || "",
            stockQty: dp.stock_qty ?? 0,
            isActive: dp.is_active ?? true, isFeatured: dp.is_featured ?? false,
          },
        });

        const imgUrl = dp.display_image_url || dp.image_url || "";
        if (imgUrl) {
          const existingImages = await prisma.productImage.findMany({ where: { productId: product.id } });
          if (existingImages.length === 0) {
            await prisma.productImage.create({
              data: { productId: product.id, url: imgUrl, isPrimary: true, sortOrder: 0 },
            });
          }
        }

        count++;
      }
      results.products = count;
    }

    const djangoOrders = await getDjangoOrders({ page_size: "100" });
    if (djangoOrders?.results) {
      let orderCount = 0;
      for (const dor of djangoOrders.results) {
        const addr = dor.shipping_address;

        if (dor.email) {
          await prisma.customer.upsert({
            where: { email: dor.email },
            update: { firstName: addr?.first_name || "", lastName: addr?.last_name || "", phone: addr?.phone || "" },
            create: { email: dor.email, firstName: addr?.first_name || "", lastName: addr?.last_name || "", phone: addr?.phone || "" },
          });
        }

        let shippingAddressId: string | undefined;
        if (addr) {
          const sa = await prisma.shippingAddress.create({
            data: {
              firstName: addr.first_name, lastName: addr.last_name,
              email: addr.email || "", phone: addr.phone || "",
              address1: addr.address1, address2: addr.address2 || "",
              city: addr.city, postalCode: addr.postal_code,
              country: addr.country, state: "",
            },
          });
          shippingAddressId = sa.id;
        }

        const orderId = `django-${dor.order_number}`;
        await prisma.order.upsert({
          where: { orderNumber: dor.order_number },
          update: {
            email: dor.email || "",
            subtotal: parseFloat(dor.subtotal || "0"),
            shippingCost: parseFloat(dor.shipping_cost || "0"),
            tax: parseFloat(dor.tax || "0"),
            total: parseFloat(dor.total || "0"),
            status: dor.status || "pending",
            paymentStatus: dor.payment_status || "pending",
            shippingMethod: dor.shipping_method || "standard",
            trackingNumber: dor.tracking_number || "",
            trackingUrl: dor.tracking_url || "",
            notes: dor.notes || "",
            shippingAddressId: shippingAddressId || null,
          },
          create: {
            id: orderId, orderNumber: dor.order_number, email: dor.email || "",
            subtotal: parseFloat(dor.subtotal || "0"),
            shippingCost: parseFloat(dor.shipping_cost || "0"),
            tax: parseFloat(dor.tax || "0"),
            total: parseFloat(dor.total || "0"),
            status: dor.status || "pending",
            paymentStatus: dor.payment_status || "pending",
            shippingMethod: dor.shipping_method || "standard",
            trackingNumber: dor.tracking_number || "",
            trackingUrl: dor.tracking_url || "",
            notes: dor.notes || "",
            shippingAddressId: shippingAddressId || null,
          },
        });

        await prisma.orderItem.deleteMany({ where: { orderId } });
        for (const item of dor.items) {
          await prisma.orderItem.create({
            data: {
              orderId, productSku: item.product_sku, productName: item.product_name,
              productPrice: parseFloat(item.product_price || "0"),
              color: item.color || "", quantity: item.quantity || 1,
            },
          });
        }

        orderCount++;
      }
      results.orders = orderCount;
      results.customers = await prisma.customer.count();
    }

    return NextResponse.json({ success: true, data: results, message: "Sync complete" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Sync failed - is Django running?" }, { status: 502 });
  }
}
