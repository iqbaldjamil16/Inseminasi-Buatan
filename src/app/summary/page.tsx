
import AppLayout from '@/components/app-layout';
import { AiSummary } from '@/components/ai-summary';
import { FloatingBackButton } from '@/components/floating-back-button';

export default function SummaryPage() {
  return (
    <AppLayout>
      <AiSummary />
      <FloatingBackButton href="/" />
    </AppLayout>
  );
}
