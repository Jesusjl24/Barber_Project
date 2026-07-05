import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <div className="mx-auto max-w-lg min-h-dvh flex flex-col md:max-w-2xl">
            <AppHeader />
            {/* pb-28 leaves room for the fixed bottom nav */}
            <main className="flex-1 px-4 pb-28 pt-2">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
