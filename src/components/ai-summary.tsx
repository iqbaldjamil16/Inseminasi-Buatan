'use client';

import React, { useState, useTransition } from 'react';
import type { InseminationRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getAiSummary } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type Summary = {
  summary: string;
  advice: string;
};

export function AiSummary({ initialData }: { initialData: InseminationRecord[] }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGetSummary = () => {
    startTransition(async () => {
      const result = await getAiSummary(initialData);
      setSummary(result);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan & Saran Berbasis AI</CardTitle>
        <CardDescription>
          Dapatkan analisis mendalam dan saran untuk mengoptimalkan program
          pembibitan Anda berdasarkan data yang telah tercatat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-start">
          <Button onClick={handleGetSummary} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Dapatkan Ringkasan AI
          </Button>
        </div>

        {isPending && (
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <p className="text-muted-foreground">AI sedang menganalisis data Anda, mohon tunggu sebentar...</p>
                </div>
            </div>
        )}

        {summary && !isPending && (
          <div className="space-y-4">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Ringkasan Program</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{summary.summary}</p>
              </AlertDescription>
            </Alert>
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Saran Optimisasi</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{summary.advice}</p>
              </AlertDescription>
            </Alert>
          </div>
        )}
        {!summary && !isPending && initialData.length === 0 && (
            <Alert variant="default">
                <AlertTitle>Data Kosong</AlertTitle>
                <AlertDescription>
                Belum ada data inseminasi yang tercatat. Silakan input data terlebih dahulu pada tab "Input Data" untuk bisa mendapatkan ringkasan dari AI.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
