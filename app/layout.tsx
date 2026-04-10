import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TapSafe",
  description:
    "Find your local water report, understand the risks, and get clear next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
