import AppLayout from '@/components/app-layout';
import { AiSummary } from '@/components/ai-summary';
import { getInseminationRecords } from '@/lib/actions';

export default async function SummaryPage() {
  const records = await getInseminationRecords();

  return (
    <AppLayout>
      <AiSummary initialData={records} />
    </AppLayout>
  );
}
