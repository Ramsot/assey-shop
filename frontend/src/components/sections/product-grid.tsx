"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { type Product, type Collection } from "@/types";

interface ProductGridProps {
  products: Product[];
  collections: Collection[];
}

const materials = ["Leather", "Satin", "Patent leather"];
const sizes = ["Mini", "Small", "Medium", "Large", "Tote", "Clutch"];
const colorOptions = ["Champagne", "Cream", "Blush", "Ink", "Pearl", "Ivory", "Gold"];

export function ProductGrid({ products, collections }: ProductGridProps): JSX.Element {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    const result = products.filter((p) => {
      if (query) {
        const haystack = [
          p.name,
          p.subtitle,
          p.description,
          p.sku,
          ...p.colors.map((c) => c.name),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (selectedCollections.length) {
        const keys = p.collections.map((c) => c.key);
        if (!selectedCollections.some((c) => keys.includes(c))) return false;
      }

      if (selectedMaterials.length) {
        if (!selectedMaterials.some((m) => p.material.toLowerCase().includes(m.toLowerCase()))) {
          return false;
        }
      }

      if (selectedSizes.length) {
        if (!selectedSizes.some((s) => p.size.toLowerCase() === s.toLowerCase())) {
          return false;
        }
      }

      if (selectedColors.length) {
        const names = p.colors.map((c) => c.name.toLowerCase());
        if (!selectedColors.some((c) => names.includes(c.toLowerCase()))) return false;
      }

      return true;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        default:
          return Number(b.isFeatured) - Number(a.isFeatured);
      }
    });
  }, [products, selectedCollections, selectedMaterials, selectedSizes, selectedColors, search, sort]);

  const clear = () => {
    setSelectedCollections([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSearch("");
    setSort("featured");
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="sticky top-24 space-y-8 rounded-2xl border border-border bg-paper p-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink">
              Refine
            </h3>
          </div>

          <FilterGroup
            title="Collection"
            options={collections.map((c) => ({ label: c.name, value: c.key }))}
            selected={selectedCollections}
            onToggle={(v) => toggle(v, selectedCollections, setSelectedCollections)}
          />
          <FilterGroup
            title="Material"
            options={materials.map((m) => ({ label: m, value: m }))}
            selected={selectedMaterials}
            onToggle={(v) => toggle(v, selectedMaterials, setSelectedMaterials)}
          />
          <FilterGroup
            title="Size"
            options={sizes.map((s) => ({ label: s, value: s }))}
            selected={selectedSizes}
            onToggle={(v) => toggle(v, selectedSizes, setSelectedSizes)}
          />
          <FilterGroup
            title="Color"
            options={colorOptions.map((c) => ({ label: c, value: c }))}
            selected={selectedColors}
            onToggle={(v) => toggle(v, selectedColors, setSelectedColors)}
          />

          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        </div>
      </aside>

      <section className="flex-1">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handbags..."
              className="w-full rounded-md border border-border bg-paper px-4 py-2 text-sm outline-none ring-offset-background focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="rounded-md border border-border bg-paper px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="featured">Featured</option>
              <option value="new">New arrivals</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-paper p-12 text-center">
            <h3 className="font-serif text-xl text-ink">No products match</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting or clearing your filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface FilterGroupProps {
  title: string;
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps): JSX.Element {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h4>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center justify-between text-sm text-muted-foreground hover:text-ink"
          >
            <span>{option.label}</span>
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="h-4 w-4 rounded border-border text-ink focus:ring-ring"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
