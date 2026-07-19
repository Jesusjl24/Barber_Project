import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MiBarbero — Live queue & bookings for community barbers",
  description:
    "See if your barber is working, how long the wait is, and join the line — no app download required.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MiBarbero",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0f1e",
};

// Chrome (header/nav/footer) lives in nested layouts, not here:
// - (app)/layout.tsx is the MiBarbero app shell (home, dashboard, admin, my visits).
// - shop/layout.tsx and b/[barberId]/layout.tsx are the "front door" shell, where
//   the barber's/shop's own identity is the dominant brand, not MiBarbero's.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
