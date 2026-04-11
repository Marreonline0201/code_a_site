"use client";

import { useCallback, useState } from "react";
import {
  Search,
  Droplets,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ExternalLink,
  Shield,
  MapPin,
  Activity,
} from "lucide-react";
import { useWaterQualitySearch } from "@/lib/epa/use-water-quality-search";
import type { WaterSystem, Violation, ViolationSeverity } from "@/lib/epa/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------- Helpers ---------- */

function formatPopulation(pop: number | null): string {
  if (pop == null) return "Unknown";
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)}K`;
  return String(pop);
}

function sourceLabel(src: string): string {
  const map: Record<string, string> = {
    groundwater: "Groundwater",
    surface: "Surface Water",
    purchased: "Purchased",
    unknown: "Unknown",
  };
  return map[src] ?? src;
}

function systemTypeLabel(t: string): string {
  const map: Record<string, string> = {
    community: "Community",
    "non-transient": "Non-Transient",
    transient: "Transient",
    unknown: "Unknown",
  };
  return map[t] ?? t;
}

function severityColor(s: ViolationSeverity): string {
  switch (s) {
    case "serious":
      return "text-red-600 dark:text-red-400";
    case "minor":
      return "text-amber-600 dark:text-amber-400";
    case "informational":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-muted-foreground";
  }
}

function severityBadgeVariant(
  s: ViolationSeverity,
): "destructive" | "secondary" | "outline" | "default" {
  switch (s) {
    case "serious":
      return "destructive";
    case "minor":
      return "secondary";
    default:
      return "outline";
  }
}

function healthBadge(system: WaterSystem) {
  if (system.healthBasedViolationCount === 0 && system.violationCount === 0) {
    return (
      <Badge variant="default" className="bg-emerald-600 text-white dark:bg-emerald-500">
        <CheckCircle className="mr-1 size-3" />
        No Violations
      </Badge>
    );
  }
  if (system.healthBasedViolationCount > 0) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 size-3" />
        {system.healthBasedViolationCount} Health-Based
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <Activity className="mr-1 size-3" />
      {system.violationCount} Violation{system.violationCount !== 1 ? "s" : ""}
    </Badge>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/* ---------- Sub-components ---------- */

function SearchLoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="glass-card">
          <CardHeader>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DetailLoadingState() {
  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function StatField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function SystemCard({
  system,
  onSelect,
}: {
  system: WaterSystem;
  onSelect: (pwsid: string) => void;
}) {
  return (
    <Card
      className="glass-card cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-ocean-surface/40"
      onClick={() => onSelect(system.pwsid)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(system.pwsid);
        }
      }}
    >
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{system.name}</CardTitle>
            <CardDescription>
              {system.city ? `${system.city}, ` : ""}
              {system.stateCode}
              {system.county ? ` — ${system.county} County` : ""}
              {" "}
              <span className="font-mono text-xs text-muted-foreground/60">
                ({system.pwsid})
              </span>
            </CardDescription>
          </div>
          {healthBadge(system)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatField
            label="Population"
            value={formatPopulation(system.populationServed)}
            icon={<Users className="size-3" />}
          />
          <StatField
            label="Source"
            value={sourceLabel(system.sourceType)}
            icon={<Droplets className="size-3" />}
          />
          <StatField
            label="Type"
            value={systemTypeLabel(system.systemType)}
            icon={<Shield className="size-3" />}
          />
          <StatField
            label="Violations"
            value={String(system.violationCount)}
            icon={<AlertTriangle className="size-3" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ViolationRow({ violation }: { violation: Violation }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <p className={`text-sm font-medium ${severityColor(violation.severity)}`}>
          {violation.contaminantName}
        </p>
        <p className="text-xs text-muted-foreground">{violation.violationType}</p>
        {violation.ruleName && (
          <p className="text-xs text-muted-foreground/70">{violation.ruleName}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severityBadgeVariant(violation.severity)}>
          {violation.severity}
        </Badge>
        {violation.isHealthBased && (
          <Badge variant="destructive">
            Health-Based
          </Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDate(violation.compliancePeriodBegin)}
          {violation.compliancePeriodEnd
            ? ` — ${formatDate(violation.compliancePeriodEnd)}`
            : ""}
        </span>
      </div>
    </div>
  );
}

function SystemDetailView({
  system,
  violations,
  recentViolations,
  searchQuery,
  onBack,
}: {
  system: WaterSystem;
  violations: Violation[];
  recentViolations: Violation[];
  searchQuery: string;
  onBack: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayViolations = showAll ? violations : recentViolations;

  // Determine overall health color
  const overallColor =
    system.healthBasedViolationCount > 0
      ? "border-red-500/30 bg-red-50/30 dark:bg-red-950/10"
      : system.violationCount > 0
        ? "border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10"
        : "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10";

  // Build EWG link
  const zip = system.zipCode ?? searchQuery;
  const ewgUrl = zip && /^\d{5}$/.test(zip)
    ? `https://www.ewg.org/tapwater/search-results.php?zip5=${zip}`
    : "https://www.ewg.org/tapwater/";

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-ocean-surface hover:text-ocean-foam transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to results
      </button>

      {/* System overview */}
      <Card className={`glass-card ${overallColor}`}>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{system.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="size-3" />
                {system.city ? `${system.city}, ` : ""}
                {system.stateCode}
                {system.county ? ` — ${system.county} County` : ""}
              </CardDescription>
            </div>
            {healthBadge(system)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatField
              label="PWSID"
              value={system.pwsid}
              icon={<Shield className="size-3" />}
            />
            <StatField
              label="Population Served"
              value={formatPopulation(system.populationServed)}
              icon={<Users className="size-3" />}
            />
            <StatField
              label="Water Source"
              value={sourceLabel(system.sourceType)}
              icon={<Droplets className="size-3" />}
            />
            <StatField
              label="System Type"
              value={systemTypeLabel(system.systemType)}
            />
            <StatField
              label="Total Violations"
              value={String(violations.length)}
              icon={<AlertTriangle className="size-3" />}
            />
            <StatField
              label="Health-Based"
              value={String(system.healthBasedViolationCount)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={ewgUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1">
                <ExternalLink className="size-3" />
                View on EWG Tap Water
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Violations list */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                {showAll ? "All Violations" : "Recent Violations (Last 5 Years)"}
              </CardTitle>
              <CardDescription>
                {displayViolations.length} violation
                {displayViolations.length !== 1 ? "s" : ""} found
                {!showAll && violations.length > recentViolations.length
                  ? ` (${violations.length} total)`
                  : ""}
              </CardDescription>
            </div>
            {violations.length > recentViolations.length && (
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Recent Only" : "Show All Violations"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displayViolations.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50/50 px-4 py-6 text-center dark:bg-emerald-950/20">
              <CheckCircle className="mx-auto size-8 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-muted-foreground">
                {showAll
                  ? "No violations on record for this water system."
                  : "No violations in the last 5 years. Great news!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayViolations.map((v) => (
                <ViolationRow key={v.id} violation={v} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Main component ---------- */

export function EpaSearchClient() {
  const {
    search,
    detail,
    setQuery,
    executeSearch,
    fetchSystemDetail,
    clearDetail,
  } = useWaterQualitySearch();

  const isSearching = search.phase === "loading";
  const isDetailLoading = detail.phase === "loading";
  const showDetail = detail.phase === "success" && detail.system;

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await executeSearch();
    },
    [executeSearch],
  );

  const onSelectSystem = useCallback(
    (pwsid: string) => {
      fetchSystemDetail(pwsid);
    },
    [fetchSystemDetail],
  );

  // If we're showing the detail view, render that
  if (showDetail) {
    return (
      <SystemDetailView
        system={detail.system!}
        violations={detail.violations}
        recentViolations={detail.recentViolations}
        searchQuery={search.query}
        onBack={clearDetail}
      />
    );
  }

  if (isDetailLoading) {
    return <DetailLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Search Water Systems</CardTitle>
          <CardDescription>
            Enter a 5-digit ZIP code (e.g. <span className="font-medium">10001</span>) or
            2-letter state code (e.g. <span className="font-medium">NY</span>) to find
            public water systems and their violations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <Input
              value={search.query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="ZIP code or state (e.g. 10001 or NY)"
              aria-invalid={search.phase === "validation_error"}
              disabled={isSearching}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              <Search className="mr-1 size-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          {search.errorMessage && (
            <p
              className={`mt-2 text-sm ${
                search.phase === "validation_error"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {search.errorMessage}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Detail error */}
      {detail.phase === "error" && (
        <Card className="glass-card border-destructive/30">
          <CardContent className="py-6">
            <p className="text-sm text-destructive">{detail.errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Idle state */}
      {search.phase === "idle" && (
        <Card className="glass-card">
          <CardContent className="py-8 text-center">
            <Droplets className="mx-auto mb-3 size-10 text-ocean-surface/60" />
            <p className="text-sm text-muted-foreground">
              Search the EPA Safe Drinking Water Information System (SDWIS) to find
              your local water system and any drinking water violations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isSearching && <SearchLoadingState />}

      {/* Error */}
      {search.phase === "error" && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Search Failed</CardTitle>
            <CardDescription>
              {search.errorMessage ?? "Could not reach the EPA database. Please try again."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => executeSearch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {search.phase === "empty" && (
        <Card className="glass-card">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No water systems were found for{" "}
              <span className="font-medium">{search.query}</span>. Try a different ZIP
              code or state.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {search.phase === "success" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Water Systems
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({search.totalSystems} found)
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            {search.systems.map((system) => (
              <SystemCard
                key={system.pwsid}
                system={system}
                onSelect={onSelectSystem}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
