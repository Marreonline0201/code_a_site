"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";

export function TrackerEmptyState() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated water drop illustration */}
          <motion.div
            className="relative w-24 h-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Water drop shape */}
              <motion.path
                d="M50 10C50 10 20 50 20 65C20 82 33.43 95 50 95C66.57 95 80 82 80 65C80 50 50 10 50 10Z"
                fill="var(--ocean-surface)"
                fillOpacity={0.15}
                stroke="var(--ocean-surface)"
                strokeWidth={2}
                initial={{ pathLength: 0, fillOpacity: 0 }}
                animate={{ pathLength: 1, fillOpacity: 0.15 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {/* Shine highlight */}
              <motion.ellipse
                cx={40}
                cy={55}
                rx={6}
                ry={12}
                fill="var(--ocean-foam)"
                fillOpacity={0.3}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              />
            </svg>

            {/* Animated ripple rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full border border-ocean-surface/30"
                initial={{ opacity: 0, scaleX: 0.5, scaleY: 0.5 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  scaleX: [0.5, 1.5 + i * 0.3, 2 + i * 0.3],
                  scaleY: [0.5, 0.8, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 0.8 + i * 0.4,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            ))}
          </motion.div>

          {/* Text content */}
          <motion.div
            className="space-y-2 max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-foreground">
              No entries yet today
            </h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your hydration by logging your first glass of
              water. Use the quick-log buttons above to get started.
            </p>
          </motion.div>

          {/* Animated sample data preview */}
          <motion.div
            className="w-full max-w-sm space-y-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Your log will look like this
            </p>
            <div className="space-y-2">
              {[
                { amount: 500, time: "8:00 AM", delay: 0.8 },
                { amount: 250, time: "10:30 AM", delay: 1.0 },
                { amount: 750, time: "1:00 PM", delay: 1.2 },
              ].map((sample) => (
                <motion.div
                  key={sample.time}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-dashed border-border/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.6, x: 0 }}
                  transition={{ delay: sample.delay, duration: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-full bg-ocean-surface/10 flex items-center justify-center text-xs font-semibold text-ocean-surface/60">
                    {sample.amount}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {sample.amount}ml
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {sample.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
