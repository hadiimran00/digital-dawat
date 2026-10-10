import { Suspense } from "react";
import type { Metadata } from "next";
import { Editor } from "@/components/Editor";

export const metadata: Metadata = { title: "Customise your invitation" };

export default function CreatePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <Editor />
    </Suspense>
  );
}
