'use client';

import React, { useMemo } from 'react';
import type { InseminationRecord } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LabelList } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface StatisticsViewProps {
  records: InseminationRecord[];
}

const chartConfig = {
  count: {
    label: 'Jumlah',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const CustomBarChart = ({ data, title, description, total }: { data: any[], title: string, description: string, total: number }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50 }}>
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={120}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => `${value} (${((value / total) * 100).toFixed(0)}%)`}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );


export function StatisticsView({ records }: StatisticsViewProps) {
  const totalRecords = records.length;

  const sortedMonthlyStats = useMemo(() => {
    if (!records || records.length === 0) return [];
    const stats: { [key: string]: { count: number, date: Date } } = {};
    records.forEach((record) => {
        const recordDate = record.inseminationDate;
        if (recordDate && !isNaN(recordDate.getTime())) {
            const monthKey = format(recordDate, 'yyyy-MM');
            if (!stats[monthKey]) {
                stats[monthKey] = { count: 0, date: new Date(recordDate.getFullYear(), recordDate.getMonth(), 1) };
            }
            stats[monthKey].count++;
        }
    });

    return Object.values(stats)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map(item => ({
            name: format(item.date, 'MMMM yyyy', { locale: id }),
            count: item.count,
        }));
  }, [records]);


  const staffStats = useMemo(() => {
    if (!records || records.length === 0) return [];
    const stats: { [key: string]: number } = {};
    records.forEach((record) => {
      if (record.staffName) {
        stats[record.staffName] = (stats[record.staffName] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const puskeswanStats = useMemo(() => {
    if (!records || records.length === 0) return [];
    const stats: { [key: string]: number } = {};
    records.forEach((record) => {
        if (record.puskeswan) {
            stats[record.puskeswan] = (stats[record.puskeswan] || 0) + 1;
        }
    });
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  if (records.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Tidak ada data untuk ditampilkan.</p>
            </CardContent>
        </Card>
    );
  }
  
  return (
    <div className="grid gap-6">
        <CustomBarChart data={sortedMonthlyStats} total={totalRecords} title="Statistik Bulanan" description="Total data inseminasi yang diinput setiap bulan." />
        <CustomBarChart data={staffStats} total={totalRecords} title="Statistik per Petugas" description="Total data yang diinput oleh masing-masing petugas." />
        <CustomBarChart data={puskeswanStats} total={totalRecords} title="Statistik per Puskeswan" description="Total data yang berasal dari masing-masing puskeswan." />
    </div>
  );
}
