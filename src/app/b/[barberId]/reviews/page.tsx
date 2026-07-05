import ReviewsScreen from "@/components/ReviewsScreen";
import { barbers } from "@/data/mockData";

export function generateStaticParams() {
  return barbers.map((b) => ({ barberId: b.id }));
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  return <ReviewsScreen barberId={barberId} />;
}
