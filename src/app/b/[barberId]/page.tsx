import BarberProfile from "@/components/BarberProfile";
import { barbers } from "@/data/mockData";

export function generateStaticParams() {
  return barbers.map((b) => ({ barberId: b.id }));
}

export default async function BarberPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  return <BarberProfile barberId={barberId} />;
}
