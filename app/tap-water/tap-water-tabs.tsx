"use client";

import { Droplets, FlaskConical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EpaSearchClient } from "./epa-search-client";
import { TapWaterPageClient } from "./tap-water-page-client";

export function TapWaterTabs() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Tap Water Quality Lookup</h1>
        <p className="max-w-3xl text-muted-foreground">
          Check your local water quality using EPA data for any U.S. water system,
          or look up NYC-specific lead testing results.
        </p>
      </header>

      <Tabs defaultValue="epa">
        <TabsList>
          <TabsTrigger value="epa" className="gap-1.5">
            <Droplets className="size-4" />
            Nationwide (EPA)
          </TabsTrigger>
          <TabsTrigger value="nyc" className="gap-1.5">
            <FlaskConical className="size-4" />
            NYC Lead Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epa" className="mt-4">
          <EpaSearchClient />
        </TabsContent>

        <TabsContent value="nyc" className="mt-4">
          <NycLeadSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Wraps the original NYC tap-water client.
 * The component has its own header and padding. We collapse the outer spacing
 * and hide the duplicate header since the parent tab layout already provides context.
 */
function NycLeadSection() {
  return (
    <div className="[&>div]:max-w-none [&>div]:px-0 [&>div]:py-0 [&>div>header]:sr-only">
      <TapWaterPageClient />
    </div>
  );
}
