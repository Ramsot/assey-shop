import { prisma } from "@/lib/prisma";
import type { Collection, Product, ColorOption } from "@/types";

export async function getCollections(): Promise<Collection[]> {
  const collections = await prisma.collection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return collections.map((c) => ({
    key: c.key,
    name: c.name,
    caption: c.caption ?? "",
    title: c.title ?? "",
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? undefined,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  }));
}

export async function getProducts(params?: {
  isFeatured?: boolean;
  collection?: string;
  pageSize?: number;
}): Promise<Product[]> {
  const where: Record<string, unknown> = { isActive: true };
  if (params?.isFeatured) where.isFeatured = true;
  if (params?.collection) {
    where.collection = {
      some: { collection: { key: params.collection } },
    };
  }

  const products = await prisma.product.findMany({
    where: where as any,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      category: true,
      tags: { include: { tag: true } },
      collection: { include: { collection: true } },
    },
    orderBy: { createdAt: "desc" },
    take: params?.pageSize ?? 100,
  });

  return products.map(toPublicProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ isFeatured: true, pageSize: 8 });
}

export async function getProduct(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      category: true,
      tags: { include: { tag: true } },
      collection: { include: { collection: true } },
    },
  });
  return product ? toPublicProduct(product) : null;
}

export async function getProductsByCollection(
  collection: string
): Promise<Product[]> {
  return getProducts({ collection, pageSize: 100 });
}

export async function getNavigationMenu(
  location: string = "header"
): Promise<NavMenuItem[]> {
  const menu = await prisma.navigationMenu.findFirst({
    where: { location, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  if (!menu?.items) return [];
  try {
    return JSON.parse(menu.items) as NavMenuItem[];
  } catch {
    return [];
  }
}

export async function getWebsiteSettings(): Promise<Record<string, string>> {
  const settings = await prisma.websiteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value ?? "";
  }
  return map;
}

export async function getHomepageSections(): Promise<HomepageSectionData[]> {
  const sections = await prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return sections.map((s) => ({
    id: s.id,
    type: s.type,
    title: s.title ?? "",
    subtitle: s.subtitle ?? "",
    content: s.content ?? "",
    settings: tryParseJson<Record<string, unknown>>(s.settings) ?? {},
    sortOrder: s.sortOrder,
  }));
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  await prisma.contactMessage.create({ data });
}

export async function subscribeNewsletter(data: {
  email: string;
  name?: string;
  source?: string;
}): Promise<void> {
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: data.email },
  });
  if (existing) return;
  await prisma.newsletterSubscriber.create({ data });
}

interface NavMenuItem {
  label: string;
  href: string;
  children?: NavMenuItem[];
}
interface HomepageSectionData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  content: string;
  settings: Record<string, unknown>;
  sortOrder: number;
}

function toPublicProduct(p: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  material: string | null;
  size: string | null;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  images: { url: string; altText: string | null; isPrimary: boolean }[];
  variants: {
    color: string | null;
    colorHex: string | null;
  }[];
  category: { name: string; slug: string } | null;
  tags: { tag: { name: string } }[];
  collection: {
    collection: { key: string; name: string; caption: string | null; title: string | null; description: string | null; imageUrl: string | null; sortOrder: number; isActive: boolean };
  }[];
}): Product {
  const primaryImage = p.images.find((i) => i.isPrimary) ?? p.images[0];
  const imageUrl = primaryImage?.url ?? "";
  const colors: ColorOption[] = p.variants
    .filter((v) => v.color)
    .map((v) => ({
      name: v.color!,
      hex: v.colorHex ?? "#cccccc",
    }));
  const uniqueColors = colors.filter(
    (c, i, a) => a.findIndex((x) => x.name === c.name) === i
  );
  const tags = p.tags.map((t) => t.tag.name);

  return {
    id: 0,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    subtitle: p.subtitle ?? "",
    description: p.description ?? "",
    price: p.price,
    material: p.material ?? "",
    size: p.size ?? "",
    stockQty: p.stockQty,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    imageUrl,
    displayImageUrl: imageUrl,
    colors: uniqueColors,
    tags,
    collections: p.collection.map((pc) => ({
      key: pc.collection.key,
      name: pc.collection.name,
      caption: pc.collection.caption ?? "",
      title: pc.collection.title ?? "",
      description: pc.collection.description ?? "",
      imageUrl: pc.collection.imageUrl ?? undefined,
      sortOrder: pc.collection.sortOrder,
      isActive: pc.collection.isActive,
    })),
    category: p.category
      ? { name: p.category.name, slug: p.category.slug }
      : null,
    createdAt: p.createdAt.toISOString(),
  };
}

function tryParseJson<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
