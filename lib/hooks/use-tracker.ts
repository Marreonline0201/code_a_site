"use client";

import { useState, useEffect, useCallback } from "react";
import type { HydrationEntry, Profile } from "@/lib/types";

interface TrackerStats {
  daily_avg: number;
  total_entries: number;
  streak_days: number;
  daily_totals: { date: string; total: number }[];
}

interface TrackerData {
  profile: Profile | null;
  todayEntries: HydrationEntry[];
  todayTotal: number;
  stats: TrackerStats | null;
  loading: boolean;
  error: string | null;
  logEntry: (amount: number, opts?: { brand_slug?: string; activity?: string; note?: string }) => Promise<HydrationEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useTracker(): TrackerData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayEntries, setTodayEntries] = useState<HydrationEntry[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [stats, setStats] = useState<TrackerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const [profileRes, statsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/tracker/stats?days=30"),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setTodayEntries(statsData.today.entries);
        setTodayTotal(statsData.today.total);
      }
    } catch {
      setError("Failed to load tracker data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const logEntry = useCallback(
    async (
      amount: number,
      opts?: { brand_slug?: string; activity?: string; note?: string }
    ): Promise<HydrationEntry | null> => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempEntry: HydrationEntry = {
        id: tempId,
        user_id: "",
        amount,
        brand_slug: opts?.brand_slug ?? null,
        activity: opts?.activity ?? null,
        note: opts?.note ?? "",
        logged_at: new Date().toISOString(),
        date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
      };

      setTodayEntries((prev) => [tempEntry, ...prev]);
      setTodayTotal((prev) => prev + amount);

      try {
        const res = await fetch("/api/tracker/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            brand_slug: opts?.brand_slug ?? null,
            activity: opts?.activity ?? null,
            note: opts?.note ?? "",
          }),
        });

        if (!res.ok) {
          // Rollback optimistic update
          setTodayEntries((prev) => prev.filter((e) => e.id !== tempId));
          setTodayTotal((prev) => prev - amount);
          return null;
        }

        const entry: HydrationEntry = await res.json();

        // Replace temp entry with real one
        setTodayEntries((prev) =>
          prev.map((e) => (e.id === tempId ? entry : e))
        );

        return entry;
      } catch {
        // Rollback
        setTodayEntries((prev) => prev.filter((e) => e.id !== tempId));
        setTodayTotal((prev) => prev - amount);
        return null;
      }
    },
    []
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      const entry = todayEntries.find((e) => e.id === id);
      if (!entry) return false;

      // Optimistic removal
      setTodayEntries((prev) => prev.filter((e) => e.id !== id));
      setTodayTotal((prev) => prev - entry.amount);

      try {
        const res = await fetch(`/api/tracker/logs?id=${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          // Rollback
          setTodayEntries((prev) => [...prev, entry].sort(
            (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
          ));
          setTodayTotal((prev) => prev + entry.amount);
          return false;
        }

        return true;
      } catch {
        // Rollback
        setTodayEntries((prev) => [...prev, entry].sort(
          (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        ));
        setTodayTotal((prev) => prev + entry.amount);
        return false;
      }
    },
    [todayEntries]
  );

  return {
    profile,
    todayEntries,
    todayTotal,
    stats,
    loading,
    error,
    logEntry,
    deleteEntry,
    refreshData: fetchData,
  };
}
