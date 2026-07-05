import QueueForm from "@/components/QueueForm";
import { barbers } from "@/data/mockData";

export function generateStaticParams() {
  return barbers.map((b) => ({ barberId: b.id }));
}

export default async function QueuePage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  return <QueueForm barberId={barberId} />;
}
