'use client';

import React, { useMemo } from 'react';
import type { InseminationRecord, BirthRecord } from '@/lib/types';
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
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LabelList, PieChart, Pie } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MamujuTengahMap } from './mamuju-tengah-map';

interface StatisticsViewProps {
  records: InseminationRecord[];
  birthRecords: BirthRecord[];
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
                    formatter={(value: number) => `${value} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );


export function StatisticsView({ records, birthRecords }: StatisticsViewProps) {
  const totalInsemination = records.length;
  const totalBirths = birthRecords.length;

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

  const sortedBirthMonthlyStats = useMemo(() => {
    if (!birthRecords || birthRecords.length === 0) return [];
    const stats: { [key: string]: { count: number, date: Date } } = {};
    birthRecords.forEach((record) => {
        const recordDate = record.reportDate;
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
  }, [birthRecords]);


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

  const strawTypeStats = useMemo(() => {
    if (!records || records.length === 0) return [];
    const stats: { [key: string]: number } = {};
    records.forEach((record) => {
      if (record.strawType) {
        stats[record.strawType] = (stats[record.strawType] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const strawByPuskeswanStats = useMemo(() => {
    if (!records || records.length === 0) return {};
    const stats: Record<string, Record<string, number>> = {};
    records.forEach((record) => {
      if (record.puskeswan && record.strawType) {
        if (!stats[record.puskeswan]) stats[record.puskeswan] = {};
        stats[record.puskeswan][record.strawType] = (stats[record.puskeswan][record.strawType] || 0) + 1;
      }
    });
    return stats;
  }, [records]);
  
  const puskeswanChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    puskeswanStats.forEach((stat, index) => {
        const key = stat.name.replace(/[\s-]/g, '_');
        config[key] = {
            label: stat.name,
            color: `hsl(var(--chart-${index + 1}))`,
        };
    });
    return config;
  }, [puskeswanStats]);

  const puskeswanPieData = useMemo(() => {
    if (totalInsemination === 0) return [];
    return puskeswanStats.map(stat => {
        const key = stat.name.replace(/[\s-]/g, '_');
        return {
            ...stat,
            name: key,
            originalName: stat.name,
            fill: `var(--color-${key})`,
        };
    });
  }, [puskeswanStats, totalInsemination]);

  if (records.length === 0 && birthRecords.length === 0) {
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
        <Card>
          <CardHeader>
            <CardTitle>Peta Sebaran Inseminasi</CardTitle>
            <CardDescription>
              Visualisasi jumlah inseminasi buatan per kecamatan di Mamuju Tengah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MamujuTengahMap data={puskeswanStats} total={totalInsemination} />
          </CardContent>
        </Card>

        <CustomBarChart data={sortedMonthlyStats} total={totalInsemination} title="Statistik Bulanan" description="Total data inseminasi yang diinput setiap bulan." />
        
        <CustomBarChart data={sortedBirthMonthlyStats} total={totalBirths} title="Statistik Bulanan Kelahiran" description="Total data laporan kelahiran yang diinput setiap bulan." />

        <CustomBarChart data={strawTypeStats} total={totalInsemination} title="Statistik Jenis Straw Pejantan" description="Distribusi penggunaan jenis straw pejantan secara keseluruhan." />

        <CustomBarChart data={staffStats} total={totalInsemination} title="Statistik per Petugas" description="Total data yang diinput oleh masing-masing petugas." />
        
        <Card>
            <CardHeader>
                <CardTitle>Statistik per Puskeswan</CardTitle>
                <CardDescription>Distribusi persentase data dari masing-masing puskeswan.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                 <ChartContainer
                    config={puskeswanChartConfig}
                    className="mx-auto aspect-square h-[350px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel nameKey="originalName" />}
                        />
                        <Pie
                            data={puskeswanPieData}
                            dataKey="count"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={120}
                            strokeWidth={2}
                            labelLine={false}
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        />
                        <ChartLegend
                            content={<ChartLegendContent nameKey="originalName" />}
                            className="-mt-4"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jenis Straw per Puskeswan</CardTitle>
            <CardDescription>Detail penggunaan jenis straw di tiap-tiap Puskeswan.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(strawByPuskeswanStats).map(([puskeswan, types]) => (
              <Card key={puskeswan} className="bg-muted/30">
                <CardHeader className="p-4">
                  <CardTitle className="text-base font-bold text-primary">{puskeswan}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {Object.entries(types).sort((a,b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center text-sm border-b border-muted last:border-0 pb-1">
                      <span className="text-muted-foreground">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
    </div>
  );
}
