import { revalidatePath } from "next/cache";

export const PUBLIC_PATHS = {
  home: "/",
  shop: "/shop",
  collections: "/collections",
  all: "/",
};

export function revalidatePublic(type: keyof typeof PUBLIC_PATHS) {
  const path = PUBLIC_PATHS[type];
  revalidatePath(path, "layout");
  revalidatePath("/", "layout");
}
