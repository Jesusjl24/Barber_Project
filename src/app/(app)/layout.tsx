import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

// The MiBarbero app shell: full branding + bottom tab nav. Used for surfaces
// that are inherently "the MiBarbero app" (home/marketing, a customer's own
// cross-barber visit history, barber dashboard, pilot metrics) — as opposed
// to a specific barber's or shop's public front door, which uses its own
// minimal-branding layout (see shop/layout.tsx and b/[barberId]/layout.tsx).
export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg min-h-dvh flex flex-col md:max-w-2xl">
      <AppHeader />
      {/* pb-28 leaves room for the fixed bottom nav */}
      <main className="flex-1 px-4 pb-28 pt-2">{children}</main>
      <BottomNav />
    </div>
  );
}
