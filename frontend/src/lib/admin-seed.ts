import { prisma } from "./prisma";
import { hashPassword } from "./admin-auth";
import { createClient } from "@supabase/supabase-js";

const defaultPermissions = [
  { name: "View Dashboard", slug: "dashboard.view", group: "Dashboard" },
  { name: "Manage Products", slug: "products.manage", group: "Products" },
  { name: "Create Products", slug: "products.create", group: "Products" },
  { name: "Edit Products", slug: "products.edit", group: "Products" },
  { name: "Delete Products", slug: "products.delete", group: "Products" },
  { name: "Manage Orders", slug: "orders.manage", group: "Orders" },
  { name: "Edit Orders", slug: "orders.edit", group: "Orders" },
  { name: "Delete Orders", slug: "orders.delete", group: "Orders" },
  { name: "Manage Customers", slug: "customers.manage", group: "Customers" },
  { name: "Manage Reviews", slug: "reviews.manage", group: "Reviews" },
  { name: "Manage Messages", slug: "messages.manage", group: "Messages" },
  { name: "Manage Media", slug: "media.manage", group: "Media" },
  { name: "Manage Blog", slug: "blog.manage", group: "Blog" },
  { name: "Manage Collections", slug: "collections.manage", group: "Collections" },
  { name: "Manage Categories", slug: "categories.manage", group: "Categories" },
  { name: "Manage Homepage", slug: "homepage.manage", group: "Homepage" },
  { name: "Manage Navigation", slug: "navigation.manage", group: "Navigation" },
  { name: "Manage Coupons", slug: "coupons.manage", group: "Marketing" },
  { name: "Manage Newsletter", slug: "newsletter.manage", group: "Marketing" },
  { name: "Manage Analytics", slug: "analytics.view", group: "Analytics" },
  { name: "Manage Users", slug: "users.manage", group: "Users" },
  { name: "Manage Roles", slug: "roles.manage", group: "Users" },
  { name: "Manage Settings", slug: "settings.manage", group: "Settings" },
  { name: "Manage Security", slug: "security.manage", group: "Security" },
  { name: "View Logs", slug: "logs.view", group: "System" },
  { name: "Manage Backup", slug: "backup.manage", group: "System" },
  { name: "Manage API Settings", slug: "api.manage", group: "System" },
];

export async function seedAdmin() {
  // Create admin role
  const adminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: { description: "Full system access" },
    create: {
      name: "Super Admin",
      description: "Full system access",
      isSystem: true,
    },
  });

  // Create permissions
  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, group: perm.group },
      create: perm,
    });
  }

  // Assign all permissions to admin role
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Create admin user
  const passwordHash = await hashPassword("admin123");
  const adminUser = await prisma.adminUser.upsert({
    where: { email: "admin@asseyatelier.com" },
    update: { roleId: adminRole.id },
    create: {
      email: "admin@asseyatelier.com",
      passwordHash,
      name: "Super Admin",
      roleId: adminRole.id,
    },
  });

  // Create Supabase Auth user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  const { error: signUpError } = await supabase.auth.signUp({
    email: "admin@asseyatelier.com",
    password: "admin123",
    options: { emailRedirectTo: undefined },
  });

  if (signUpError && !signUpError.message.includes("already registered")) {
    console.error("Supabase seed signup error:", signUpError);
  }

  // Create admin profile
  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id },
  });

  // Create default website settings
  const defaultSettings = [
    { key: "site_name", value: "ASSEY Atelier", group: "general" },
    { key: "site_description", value: "Premium handbags & luxury accessories", group: "general" },
    { key: "site_email", value: "concierge@asseyatelier.com", group: "contact" },
    { key: "site_phone", value: "+255 787 820 865", group: "contact" },
    { key: "site_address", value: "Dar es Salaam, Tanzania", group: "contact" },
    { key: "site_currency", value: "TZS", group: "general" },
    { key: "site_timezone", value: "Africa/Dar_es_Salaam", group: "general" },
    { key: "site_language", value: "en", group: "general" },
    { key: "maintenance_mode", value: "false", group: "general" },
    { key: "social_instagram", value: "https://instagram.com/asseyatelier", group: "social" },
    { key: "social_whatsapp", value: "https://wa.me/255787820865", group: "social" },
  ];

  for (const setting of defaultSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, group: setting.group },
      create: setting,
    });
  }

  return { adminUser, adminRole };
}
