import AppLayout from '@/components/app-layout';
import { RecordsTable } from '@/components/records-table';
import { getInseminationRecords } from '@/lib/actions';

export default async function RecordsPage() {
  const records = await getInseminationRecords();

  return (
    <AppLayout>
      <RecordsTable initialData={records} />
    </AppLayout>
  );
}
