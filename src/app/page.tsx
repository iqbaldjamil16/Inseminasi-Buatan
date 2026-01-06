import AppLayout from '@/components/app-layout';
import DashboardClient from '@/components/dashboard-client';
import { getInseminationRecords } from '@/lib/actions';

export default async function Home() {
  const initialRecords = await getInseminationRecords();

  return (
    <AppLayout>
      <DashboardClient initialRecords={initialRecords} />
    </AppLayout>
  );
}
