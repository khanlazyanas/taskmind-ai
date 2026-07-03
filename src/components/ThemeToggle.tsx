"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Hydration mismatch avoid karne ke liye
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />; 

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full w-10 h-10 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-zinc-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}