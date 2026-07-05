import BookingForm from "@/components/BookingForm";
import { barbers } from "@/data/mockData";

export function generateStaticParams() {
  return barbers.map((b) => ({ barberId: b.id }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  return <BookingForm barberId={barberId} />;
}
