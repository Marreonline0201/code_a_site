"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/animation/ScrollReveal";
import { ReminderSettings } from "@/components/tracker/ReminderSettings";
import Link from "next/link";
import type { Profile } from "@/lib/types";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "light", label: "Light", description: "1-2 days/week" },
  { value: "moderate", label: "Moderate", description: "3-5 days/week" },
  { value: "active", label: "Active", description: "6-7 days/week" },
  { value: "very-active", label: "Very Active", description: "Intense daily" },
] as const;

const CLIMATES = [
  { value: "cold", label: "Cold", description: "Below 10C / 50F" },
  { value: "temperate", label: "Temperate", description: "10-25C / 50-77F" },
  { value: "hot", label: "Hot", description: "25-35C / 77-95F" },
  { value: "humid", label: "Humid", description: "Hot and humid" },
] as const;

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function updateField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function handleSave() {
    if (!profile || saving) return;
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          weight: profile.weight,
          unit: profile.unit,
          activity_level: profile.activity_level,
          climate: profile.climate,
          daily_goal: profile.daily_goal,
          wake_time: profile.wake_time,
          reminder_interval: profile.reminder_interval,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save profile");
        return;
      }

      const updated = await res.json();
      setProfile(updated);
      setSaved(true);
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  // Calculate recommended goal based on weight, activity, climate
  function calculateRecommendedGoal(): number {
    const weight = profile?.weight ?? 70;
    const unit = profile?.unit ?? "kg";
    const weightKg = unit === "lbs" ? weight * 0.453592 : weight;

    let base = weightKg * 35; // 35ml per kg baseline

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.0,
      light: 1.1,
      moderate: 1.2,
      active: 1.35,
      "very-active": 1.5,
    };

    const climateMultipliers: Record<string, number> = {
      cold: 0.9,
      temperate: 1.0,
      hot: 1.15,
      humid: 1.25,
    };

    base *= activityMultipliers[profile?.activity_level ?? "moderate"] ?? 1.0;
    base *= climateMultipliers[profile?.climate ?? "temperate"] ?? 1.0;

    return Math.round(base / 50) * 50; // Round to nearest 50ml
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  const recommendedGoal = calculateRecommendedGoal();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your hydration profile
          </p>
        </div>
        <Link href="/tracker">
          <Button variant="outline" size="sm">
            Back to Tracker
          </Button>
        </Link>
      </div>

      {/* Profile Section */}
      <ScrollReveal>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                value={profile?.name ?? ""}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your name"
                maxLength={100}
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-3">
                <Input
                  id="weight"
                  type="number"
                  min={20}
                  max={500}
                  value={profile?.weight ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField("weight", val === "" ? 0 : parseFloat(val));
                  }}
                  onBlur={() => {
                    if (!profile?.weight || profile.weight < 20) updateField("weight", 70);
                  }}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  <Button
                    variant={profile?.unit === "kg" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField("unit", "kg")}
                  >
                    kg
                  </Button>
                  <Button
                    variant={profile?.unit === "lbs" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField("unit", "lbs")}
                  >
                    lbs
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Activity Level */}
      <ScrollReveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateField("activity_level", level.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    profile?.activity_level === level.value
                      ? "border-ocean-surface bg-ocean-surface/10"
                      : "border-border hover:border-ocean-surface/50 hover:bg-muted/30"
                  }`}
                >
                  <p className="text-sm font-medium">{level.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Climate */}
      <ScrollReveal delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Climate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {CLIMATES.map((climate) => (
                <button
                  key={climate.value}
                  onClick={() => updateField("climate", climate.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    profile?.climate === climate.value
                      ? "border-ocean-surface bg-ocean-surface/10"
                      : "border-border hover:border-ocean-surface/50 hover:bg-muted/30"
                  }`}
                >
                  <p className="text-sm font-medium">{climate.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {climate.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Daily Goal */}
      <ScrollReveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily_goal">Target (ml)</Label>
              <Input
                id="daily_goal"
                type="number"
                min={500}
                max={10000}
                step={50}
                value={profile?.daily_goal ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  updateField("daily_goal", val === "" ? 0 : parseInt(val, 10));
                }}
                onBlur={() => {
                  if (!profile?.daily_goal || profile.daily_goal < 500) updateField("daily_goal", 2500);
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Recommended based on your profile:</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-ocean-surface font-semibold"
                onClick={() => updateField("daily_goal", recommendedGoal)}
              >
                {recommendedGoal}ml
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollReveal>

      {/* Reminder Settings */}
      <ScrollReveal delay={0.25}>
        <ReminderSettings
          wakeTime={profile?.wake_time ?? "07:00"}
          reminderInterval={profile?.reminder_interval ?? 60}
          onWakeTimeChange={(value) => updateField("wake_time", value)}
          onIntervalChange={(value) =>
            updateField("reminder_interval", value)
          }
        />
      </ScrollReveal>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10">
        <Card className="shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {saved && (
                  <p className="text-sm text-ocean-surface font-medium">
                    Settings saved successfully
                  </p>
                )}
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-ocean-surface hover:bg-ocean-mid text-white min-w-[120px]"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
