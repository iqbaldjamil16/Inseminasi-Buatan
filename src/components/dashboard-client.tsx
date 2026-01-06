'use client';

import type { InseminationRecord } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InseminationForm } from '@/components/insemination-form';
import { RecordsTable } from '@/components/records-table';
import { AiSummary } from '@/components/ai-summary';
import { PenSquare, BookCopy, Sparkles } from 'lucide-react';

export default function DashboardClient({ initialRecords }: { initialRecords: InseminationRecord[] }) {
  return (
    <Tabs defaultValue="input" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
        <TabsTrigger value="input">
          <PenSquare className="mr-2 h-4 w-4" />
          Input Data
        </TabsTrigger>
        <TabsTrigger value="records">
          <BookCopy className="mr-2 h-4 w-4" />
          Catatan IB
        </TabsTrigger>
        <TabsTrigger value="ai_summary">
          <Sparkles className="mr-2 h-4 w-4" />
          Ringkasan AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="input">
        <InseminationForm />
      </TabsContent>
      <TabsContent value="records">
        <RecordsTable initialData={initialRecords} />
      </TabsContent>
      <TabsContent value="ai_summary">
        <AiSummary initialData={initialRecords} />
      </TabsContent>
    </Tabs>
  );
}
