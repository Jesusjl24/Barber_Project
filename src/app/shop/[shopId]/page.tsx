import ShopView from "@/components/ShopView";
import { shops } from "@/data/mockData";

export function generateStaticParams() {
  return shops.map((s) => ({ shopId: s.id }));
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  return <ShopView shopId={shopId} />;
}
