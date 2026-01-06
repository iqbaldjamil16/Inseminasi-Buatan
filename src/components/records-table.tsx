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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { format } from 'date-fns';

export function RecordsTable({ initialData }: { initialData: InseminationRecord[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!searchTerm) return initialData;
    return initialData.filter(
      (record) =>
        record.breederName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.breederId.includes(searchTerm) ||
        record.phoneNumber.includes(searchTerm) ||
        record.cowId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, initialData]);
  
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
        `'${record.breederId}`, // Prepend with ' to ensure it's treated as text
        record.cowType,
        record.cowId,
        record.strawType,
        record.strawId,
        record.strawBatchId,
        record.strawProducer,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `IB-Pro_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Inseminasi Buatan</CardTitle>
        <CardDescription>
          Lihat, cari, dan ekspor semua data inseminasi yang telah tercatat.
        </CardDescription>
        <div className="flex items-center justify-between pt-4">
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari (nama, KTP, HP, eartag)..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Tanggal IB</TableHead>
                <TableHead>Peternak</TableHead>
                <TableHead>ID Sapi</TableHead>
                <TableHead>Pejantan</TableHead>
                <TableHead>Petugas</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredData.length > 0 ? (
                    filteredData.map((record) => (
                        <TableRow key={record.id}>
                        <TableCell>{record.inseminationDate ? format(new Date(record.inseminationDate), 'dd MMM yyyy') : 'N/A'}</TableCell>
                        <TableCell>
                            <div className="font-medium">{record.breederName}</div>
                            <div className="text-sm text-muted-foreground">{record.breederId}</div>
                        </TableCell>
                        <TableCell>{record.cowId}</TableCell>
                        <TableCell>
                            <div className="font-medium">{record.strawType}</div>
                            <div className="text-sm text-muted-foreground">{record.strawId}</div>
                        </TableCell>
                        <TableCell>{record.staffName}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        Tidak ada data yang cocok.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
