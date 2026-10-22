import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Balance",
  description: "Dashboard vận hành cho cuộc sống: check-in 30 giây, nhìn rõ cân bằng, điều chỉnh mỗi tuần",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
