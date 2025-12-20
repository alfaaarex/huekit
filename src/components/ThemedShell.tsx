"use client";

import { useTheme } from "@/components/themeprovider";

export default function ThemedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "bg-black text-white min-h-screen transition-colors"
          : "bg-gray-50 text-gray-900 min-h-screen transition-colors"
      }
    >
      {children}
    </div>
  );
}
