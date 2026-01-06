'use client';

import React, { useMemo, useState } from 'react';
import type { InseminationRecord } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, Trash2, FilePenLine, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export function RecordsTable({ initialData }: { initialData: InseminationRecord[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [selectedYear, setSelectedYear] = useState<string | undefined>();

  const availableYears = useMemo(() => {
    const years = [];
    for (let year = 2026; year >= 2021; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const filteredData = useMemo(() => {
    return initialData.filter(record => {
      const recordDate = new Date(record.inseminationDate);
      const isMonthMatch = !selectedMonth || recordDate.getMonth().toString() === selectedMonth;
      const isYearMatch = !selectedYear || recordDate.getFullYear().toString() === selectedYear;

      const isSearchMatch =
        searchTerm === '' ||
        record.breederName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.breederId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.phoneNumber && record.phoneNumber.includes(searchTerm)) ||
        record.cowId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.staffName.toLowerCase().includes(searchTerm.toLowerCase());

      return isMonthMatch && isYearMatch && isSearchMatch;
    });
  }, [searchTerm, initialData, selectedMonth, selectedYear]);
  
  const exportToCSV = () => {
    const headers = [
      'Tanggal IB', 'Nama Petugas', 'Puskeswan', 'Nama Peternak', 'Alamat Peternak', 'Nomor HP', 'ID Peternak (KTP)', 
      'Jenis Sapi', 'ID Indukan (Eartag)', 'Jenis Straw', 'ID Pejantan', 'ID Batch', 'Produsen'
    ];
    const rows = filteredData.map(record => [
        record.inseminationDate ? format(new Date(record.inseminationDate), 'yyyy-MM-dd') : '',
        record.staffName,
        record.puskeswan,
        record.breederName,
        `"${record.breederAddress}"`,
        record.phoneNumber,
        `'${record.breederId}`,
        record.cowType,
        record.cowId,
        record.strawType,
        record.strawId,
        record.strawBatchId,
        record.strawProducer,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IB-Pro_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RecordDetailRow = ({ label, value }: { label: string, value: string | undefined }) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || '-'}</span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Inseminasi Buatan</CardTitle>
        <CardDescription>
          Lihat, cari, dan ekspor semua data inseminasi yang telah tercatat.
        </CardDescription>
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex-1">
                 <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(month => (
                            <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select onValueChange={setSelectedYear} value={selectedYear}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="relative w-full sm:w-auto sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari data..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((record) => (
                <AccordionItem value={record.id!} key={record.id!} className="border rounded-lg">
                  <AccordionTrigger className="p-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex-1 text-left">
                            <div className="font-bold">{record.staffName}</div>
                            <div className="text-sm text-muted-foreground">{record.puskeswan}</div>
                            <div className="text-xs text-muted-foreground pt-1">{record.inseminationDate ? format(new Date(record.inseminationDate), 'dd/MM/yyyy') : 'N/A'}</div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0">
                    <div className="space-y-2 border-t pt-4">
                      <RecordDetailRow label="Nama Peternak" value={record.breederName} />
                      <RecordDetailRow label="Alamat" value={record.breederAddress} />
                      <RecordDetailRow label="No. HP" value={record.phoneNumber} />
                      <RecordDetailRow label="ID Peternak (KTP)" value={record.breederId} />
                      <RecordDetailRow label="Jenis Sapi" value={record.cowType} />
                      <RecordDetailRow label="ID Sapi (Eartag)" value={record.cowId} />
                      <RecordDetailRow label="Jenis Straw" value={record.strawType} />
                      <RecordDetailRow label="ID Pejantan" value={record.strawId} />
                      <RecordDetailRow label="ID Batch" value={record.strawBatchId} />
                      <RecordDetailRow label="Produsen Straw" value={record.strawProducer} />
                      <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" size="icon"><FilePenLine className="h-4 w-4" /></Button>
                          <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Tidak ada data yang cocok.
              </div>
            )}
          </Accordion>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Peternak</TableHead>
                    <TableHead>ID Sapi</TableHead>
                    <TableHead>Pejantan</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.inseminationDate ? format(new Date(record.inseminationDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                            <TableCell>
                                <div className="font-medium">{record.breederName}</div>
                                <div className="text-sm text-muted-foreground">{record.breederId}</div>
                            </TableCell>
                            <TableCell>{record.cowId}</TableCell>
                            <TableCell>
                                <div className="font-medium">{record.strawType}</div>
                                <div className="text-sm text-muted-foreground">{record.strawId}</div>
                            </TableCell>
                            <TableCell>
                               <div className="font-medium">{record.staffName}</div>
                               <div className="text-sm text-muted-foreground">{record.puskeswan}</div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="icon">
                                        <FilePenLine className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data yang cocok.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Unduh Laporan
        </Button>
      </CardFooter>
    </Card>
  );
}
