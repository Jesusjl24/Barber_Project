import { FrontDoorHeader, FrontDoorFooter } from "@/components/FrontDoorChrome";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg min-h-dvh flex flex-col md:max-w-2xl">
      <FrontDoorHeader />
      <main className="flex-1 px-4 pt-2">{children}</main>
      <FrontDoorFooter />
    </div>
  );
}
