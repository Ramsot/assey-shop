"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button variant="ghost" onClick={() => window.print()}>
      <Printer className="h-4 w-4" strokeWidth={1.5} />
      Print order
    </Button>
  );
}
