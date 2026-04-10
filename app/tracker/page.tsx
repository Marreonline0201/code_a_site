"use client";

import { useTracker } from "@/lib/hooks/use-tracker";
import { ProgressRing } from "@/components/tracker/ProgressRing";
import { WaterLogForm } from "@/components/tracker/WaterLogForm";
import { TrackerEmptyState } from "@/components/tracker/TrackerEmptyState";
import { CountUp } from "@/components/animation/CountUp";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "motion/react";

export default function TrackerPage() {
  const {
    profile,
    todayEntries,
    todayTotal,
    stats,
    loading,
    logEntry,
    deleteEntry,
  } = useTracker();

  const dailyGoal = profile?.daily_goal ?? 2500;
  const progress = Math.min((todayTotal / dailyGoal) * 100, 100);
  const hasEntries = todayEntries.length > 0;
  const goalReached = todayTotal >= dailyGoal;

  if (loading) {
    return <TrackerSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hydration Tracker</h1>
          <p className="text-muted-foreground">
            {goalReached
              ? "Goal reached! Great job staying hydrated."
              : `${Math.round(dailyGoal - todayTotal)}ml to go`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/tracker/history">
            <Button variant="outline" size="sm">History</Button>
          </Link>
          <Link href="/tracker/settings">
            <Button variant="outline" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      {/* Progress Ring + Daily Stats */}
      <ScrollReveal>
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Progress Ring */}
              <div className="flex-shrink-0">
                <ProgressRing progress={progress} size={220} strokeWidth={14}>
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <div className="text-3xl font-bold text-foreground">
                      <CountUp end={todayTotal} duration={1.5} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {dailyGoal}ml
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(progress)}%
                    </div>
                  </motion.div>
                </ProgressRing>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <StatCard
                  label="Today"
                  value={`${todayTotal}ml`}
                  detail={`${todayEntries.length} entries`}
                />
                <StatCard
                  label="Daily Average"
                  value={`${stats?.daily_avg ?? 0}ml`}
                  detail="Last 30 days"
                />
                <StatCard
                  label="Streak"
                  value={`${stats?.streak_days ?? 0}`}
                  detail="consecutive days"
                />
                <StatCard
                  label="Total Entries"
                  value={`${stats?.total_entries ?? 0}`}
                  detail="All time"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Water Log Form */}
      <ScrollReveal delay={0.15}>
        <WaterLogForm onLog={logEntry} />
      </ScrollReveal>

      {/* Today's Entries or Empty State */}
      <ScrollReveal delay={0.3}>
        {hasEntries ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-ocean-surface/20 flex items-center justify-center text-sm font-semibold text-ocean-surface">
                        {entry.amount}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{entry.amount}ml</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.logged_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {entry.note ? ` — ${entry.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEntry(entry.id)}
                      disabled={entry.id.startsWith("temp-")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <TrackerEmptyState />
        )}
      </ScrollReveal>
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function TrackerSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
