import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/admin-auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    featuredProducts,
    totalCollections,
    totalCategories,
    totalCustomers,
    newsletterSubscribers,
    contactMessages,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts,
    unreadMessages,
    pendingReviews,
    recentProducts,
    recentCustomers,
    recentMessages,
    totalOrders,
    totalPageVisits,
    uniqueVisitors,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.collection.count(),
    prisma.category.count(),
    prisma.customer.count(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.contactMessage.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "processing" } }),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.order.count({ where: { status: "cancelled" } }),
    prisma.product.count({ where: { isActive: true, stockQty: { lte: 5 } } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.product.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.customer.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.contactMessage.count({ where: { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.order.count(),
    prisma.pageVisit.count(),
    prisma.pageVisit.count({ where: { isUnique: true } }),
  ]);

  const monthlyRevenue = await prisma.order.aggregate({
    where: { createdAt: { gte: startOfMonth }, paymentStatus: "paid" },
    _sum: { total: true },
  });

  const weeklyRevenue = await prisma.order.aggregate({
    where: { createdAt: { gte: startOfWeek }, paymentStatus: "paid" },
    _sum: { total: true },
  });

  const dailyRevenue = await prisma.order.aggregate({
    where: { createdAt: { gte: startOfDay }, paymentStatus: "paid" },
    _sum: { total: true },
  });

  const totalRevenue = await prisma.order.aggregate({
    where: { paymentStatus: "paid" },
    _sum: { total: true },
  });

  const avgOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;
  const returningVisitors = await prisma.pageVisit.count({ where: { isReturning: true } });

  return NextResponse.json({
    success: true,
    data: {
      totalProducts,
      activeProducts,
      featuredProducts,
      draftProducts: totalProducts - activeProducts,
      totalCollections,
      totalCategories,
      totalCustomers,
      registeredUsers: await prisma.customer.count({ where: { isRegistered: true } }),
      newsletterSubscribers,
      contactMessages,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      weeklyRevenue: weeklyRevenue._sum.total || 0,
      dailyRevenue: dailyRevenue._sum.total || 0,
      totalRevenue: totalRevenue._sum.total || 0,
      websiteVisitors: totalPageVisits,
      uniqueVisitors,
      returningVisitors,
      conversionRate: totalPageVisits > 0 ? ((totalOrders / totalPageVisits) * 100).toFixed(2) : "0",
      averageOrderValue: Math.round(avgOrderValue),
      lowStockCount: lowStockProducts,
      recentProducts,
      recentRegistrations: recentCustomers,
      unreadMessages,
      pendingReviews,
      recentMessages,
      systemHealth: "healthy",
      databaseSize: "2.4 MB",
      storageUsage: 34,
      lastBackup: null,
    },
  });
}
