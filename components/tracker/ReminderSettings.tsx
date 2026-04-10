"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReminderSettingsProps {
  wakeTime: string;
  reminderInterval: number;
  onWakeTimeChange: (value: string) => void;
  onIntervalChange: (value: number) => void;
}

const INTERVAL_OPTIONS = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export function ReminderSettings({
  wakeTime,
  reminderInterval,
  onWakeTimeChange,
  onIntervalChange,
}: ReminderSettingsProps) {
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [permissionState, setPermissionState] = useState<
    "default" | "granted" | "denied"
  >("default");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsSupported(true);
      setPermissionState(Notification.permission);
    }
  }, []);

  async function requestPermission() {
    if (!notificationsSupported) return;
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      if (permission === "granted") {
        setReminderEnabled(true);
        // Show a test notification
        new Notification("Hydration Reminder", {
          body: "Reminders are now enabled. Stay hydrated!",
          icon: "/favicon.ico",
        });
      }
    } catch {
      // Permission request failed silently
    }
  }

  function toggleReminders() {
    if (permissionState !== "granted") {
      requestPermission();
      return;
    }
    setReminderEnabled((prev) => !prev);
  }

  // Generate schedule preview
  function getSchedulePreview(): string[] {
    const times: string[] = [];
    const [hours, minutes] = wakeTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = 22 * 60; // 10 PM end time

    let current = startMinutes;
    while (current <= endMinutes && times.length < 12) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      times.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
      current += reminderInterval;
    }
    return times;
  }

  const schedule = getSchedulePreview();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Reminders
          <Button
            variant={reminderEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleReminders}
            className={
              reminderEnabled
                ? "bg-ocean-surface hover:bg-ocean-mid text-white"
                : ""
            }
          >
            {reminderEnabled ? "On" : "Off"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Permission Status */}
        {!notificationsSupported && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            Browser notifications are not supported in your browser. Reminders
            will only show when the app is open.
          </div>
        )}

        {notificationsSupported && permissionState === "denied" && (
          <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
            Notification permission was denied. Please enable notifications in
            your browser settings to receive reminders.
          </div>
        )}

        {/* Wake Time */}
        <div className="space-y-2">
          <Label htmlFor="wake-time">Wake Time</Label>
          <Input
            id="wake-time"
            type="time"
            value={wakeTime}
            onChange={(e) => onWakeTimeChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Reminders start at your wake time and end at 10:00 PM
          </p>
        </div>

        {/* Interval */}
        <div className="space-y-2">
          <Label>Reminder Interval</Label>
          <div className="flex flex-wrap gap-2">
            {INTERVAL_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={
                  reminderInterval === option.value ? "default" : "outline"
                }
                size="sm"
                onClick={() => onIntervalChange(option.value)}
                className={
                  reminderInterval === option.value
                    ? "bg-ocean-surface hover:bg-ocean-mid text-white"
                    : ""
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="space-y-2">
          <Label>Schedule Preview</Label>
          <div className="flex flex-wrap gap-2">
            {schedule.map((time) => (
              <span
                key={time}
                className="px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground"
              >
                {time}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {schedule.length} reminder{schedule.length !== 1 ? "s" : ""} per day
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
