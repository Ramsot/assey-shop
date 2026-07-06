import type {
  AdminUser, AdminProfile, Role, Permission,
  Product, ProductImage, ProductVariant, Category, Collection,
  Order, OrderItem, Customer, Review, ContactMessage,
  NewsletterSubscriber, BlogPost, BlogCategory,
  MediaItem, MediaFolder, HomepageSection, NavigationMenu,
  Coupon, WebsiteSetting, Backup, SystemLog, PageVisit,
  Notification, ActivityLog, LoginHistory, AdminSession,
  ShippingAddress, OrderTimeline, Invoice, Payment,
  CustomerAddress, WishlistItem, Tag,
} from "@prisma/client";

export type {
  AdminUser, AdminProfile, Role, Permission,
  Product, ProductImage, ProductVariant, Category, Collection,
  Order, OrderItem, Customer, Review, ContactMessage,
  NewsletterSubscriber, BlogPost, BlogCategory,
  MediaItem, MediaFolder, HomepageSection, NavigationMenu,
  Coupon, WebsiteSetting, Backup, SystemLog, PageVisit,
  Notification, ActivityLog, LoginHistory, AdminSession,
  ShippingAddress, OrderTimeline, Invoice, Payment,
  CustomerAddress, WishlistItem, Tag,
};

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  draftProducts: number;
  totalCollections: number;
  totalCategories: number;
  totalCustomers: number;
  registeredUsers: number;
  newsletterSubscribers: number;
  contactMessages: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  websiteVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  conversionRate: number;
  averageOrderValue: number;
  lowStockCount: number;
  recentProducts: number;
  recentRegistrations: number;
  unreadMessages: number;
  pendingReviews: number;
  systemHealth: "healthy" | "warning" | "error";
  databaseSize: string;
  storageUsage: number;
  lastBackup: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  customer?: Customer | null;
  shippingAddress?: ShippingAddress | null;
  timeline?: OrderTimeline[];
}

export interface ProductWithRelations extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category | null;
  tags: { tag: Tag }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}
