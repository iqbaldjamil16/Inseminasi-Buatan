
import AppLayout from '@/components/app-layout';
import { RecordsTable } from '@/components/records-table';
import { FloatingBackButton } from '@/components/floating-back-button';

export default function RecordsPage() {
  return (
    <AppLayout>
      <RecordsTable />
      <FloatingBackButton href="/" />
    </AppLayout>
  );
}
