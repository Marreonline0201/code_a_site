"use client";

import { useState } from "react";
import type { HydrationEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "motion/react";

interface WaterLogFormProps {
  onLog: (
    amount: number,
    opts?: { brand_slug?: string; activity?: string; note?: string }
  ) => Promise<HydrationEntry | null>;
}

const QUICK_AMOUNTS = [
  { label: "250ml", value: 250, icon: "💧" },
  { label: "500ml", value: 500, icon: "🥤" },
  { label: "750ml", value: 750, icon: "🍶" },
  { label: "1L", value: 1000, icon: "🫗" },
];

export function WaterLogForm({ onLog }: WaterLogFormProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [lastLogged, setLastLogged] = useState<number | null>(null);

  async function handleQuickLog(amount: number) {
    if (isLogging) return;
    setIsLogging(true);
    setLastLogged(amount);

    try {
      await onLog(amount);
    } finally {
      setIsLogging(false);
      setTimeout(() => setLastLogged(null), 1500);
    }
  }

  async function handleCustomLog(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseInt(customAmount, 10);
    if (!amount || amount < 1 || amount > 5000) return;
    if (isLogging) return;

    setIsLogging(true);
    setLastLogged(amount);

    try {
      await onLog(amount, { note: note || undefined });
      setCustomAmount("");
      setNote("");
      setShowCustom(false);
    } finally {
      setIsLogging(false);
      setTimeout(() => setLastLogged(null), 1500);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Log Water
          <AnimatePresence>
            {lastLogged !== null && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm font-normal text-ocean-surface"
              >
                +{lastLogged}ml logged
              </motion.span>
            )}
          </AnimatePresence>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick-log buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_AMOUNTS.map((item) => (
            <motion.div key={item.value} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="w-full h-16 flex flex-col items-center gap-1 text-lg font-semibold hover:border-ocean-surface hover:bg-ocean-surface/10 transition-colors"
                onClick={() => handleQuickLog(item.value)}
                disabled={isLogging}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Custom amount toggle */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustom((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showCustom ? "Hide custom amount" : "Custom amount"}
          </Button>
        </div>

        {/* Custom amount form */}
        <AnimatePresence>
          {showCustom && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              onSubmit={handleCustomLog}
            >
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="custom-amount" className="sr-only">
                      Amount (ml)
                    </Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      min={1}
                      max={5000}
                      placeholder="Amount in ml"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="note" className="sr-only">
                      Note (optional)
                    </Label>
                    <Input
                      id="note"
                      type="text"
                      placeholder="Note (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={200}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-ocean-surface hover:bg-ocean-mid text-white"
                  disabled={isLogging || !customAmount}
                >
                  {isLogging ? "Logging..." : "Log Custom Amount"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
