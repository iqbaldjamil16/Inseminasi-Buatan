'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord, type BirthRecord } from '@/lib/types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, BarChart, Table as TableIcon, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StatisticsView } from './statistics-view';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Master Data Definitions
const budongBudongStaff = ['Anshari Saleh', 'Hadi', 'Nur Fauzi', 'Rahman', 'Suprapto', 'Tadi Sole', 'Lainnya'].sort();
const karossaStaff = ['Asri Rasyid', 'Basuki', 'drh. Stephani', 'Hasaruddin', 'Nasaruddin', 'Adiatman', 'Surianca', 'Lainnya'].sort();
const pangaleStaff = ['Andri', 'drh. Ketut Elok', 'Jarwo', 'Jawaril', 'Kamarudin', 'Kamaruddin', 'Mansyur', 'Sugeng', 'Lainnya'].sort();
const tobadakStaff = ['Aser M', 'drh. Ishak', 'Endang', 'Feliks S', 'Jupry', 'Madalena', 'Lainnya'].sort();
const topoyoStaff = ['Alfons B', 'drh. Iqbal Djamil', 'Fitriani', 'Haslim', 'Rizky A', 'Lainnya'].sort();

const puskeswanOptions = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

export function RecordsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPuskeswan, setSelectedPuskeswan] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [view, setView] = useState<'table' | 'stats'>('table');

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Insemination Records
  const recordsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'inseminationRecords') : null),
    [firestore, user]
  );
  const { data: recordsData, isLoading: isLoadingInsemination } = useCollection<InseminationRecord>(recordsQuery);

  // Birth Records
  const birthRecordsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'birthRecords') : null),
    [firestore, user]
  );
  const { data: birthRecordsData, isLoading: isLoadingBirth } = useCollection<BirthRecord>(birthRecordsQuery);

  const parsedRecords = useMemo(() => {
    if (!recordsData) return [];
    return recordsData.map(record => ({
      ...record,
      inseminationDate: (record.inseminationDate as any)?.toDate ? (record.inseminationDate as any).toDate() : new Date(record.inseminationDate)
    })).filter(r => r.inseminationDate && !isNaN(r.inseminationDate.getTime()));
  }, [recordsData]);

  const parsedBirthRecords = useMemo(() => {
    if (!birthRecordsData) return [];
    return birthRecordsData.map(record => ({
      ...record,
      reportDate: (record.reportDate as any)?.toDate ? (record.reportDate as any).toDate() : new Date(record.reportDate),
      birthDate: record.birthDate ? ((record.birthDate as any)?.toDate ? (record.birthDate as any).toDate() : new Date(record.birthDate)) : undefined
    })).filter(r => r.reportDate && !isNaN(r.reportDate.getTime()));
  }, [birthRecordsData]);

  const staffFilterOptions = useMemo(() => {
    const staffMap: Record<string, string[]> = {
      'Puskeswan Budong-Budong': budongBudongStaff,
      'Puskeswan Karossa': karossaStaff,
      'Puskeswan Pangale': pangaleStaff,
      'Puskeswan Tobadak': tobadakStaff,
      'Puskeswan Topoyo': topoyoStaff,
    };

    if (selectedPuskeswan === 'all') {
      const allUniqueStaff = new Set<string>();
      parsedRecords.forEach(record => {
        if (record.staffName) allUniqueStaff.add(record.staffName);
      });
      parsedBirthRecords.forEach(record => {
        if (record.staffName) allUniqueStaff.add(record.staffName);
      });
      return Array.from(allUniqueStaff).sort();
    }
    
    return staffMap[selectedPuskeswan] || [];
  }, [selectedPuskeswan, parsedRecords, parsedBirthRecords]);

  const filteredInseminationData = useMemo(() => {
    if (!parsedRecords) return [];
    let records = parsedRecords.sort((a, b) => b.inseminationDate.getTime() - a.inseminationDate.getTime());
    return records.filter(record => {
      const recordDate = record.inseminationDate;
      const isMonthMatch = selectedMonth === 'all' || recordDate.getMonth().toString() === selectedMonth;
      const isYearMatch = selectedYear === 'all' || recordDate.getFullYear().toString() === selectedYear;
      const isPuskeswanMatch = selectedPuskeswan === 'all' || record.puskeswan === selectedPuskeswan;
      const isStaffMatch = selectedStaff === 'all' || record.staffName === selectedStaff;
      const searchTermLower = searchTerm.toLowerCase();
      const isSearchMatch = searchTerm === '' ||
        (record.breederName && record.breederName.toLowerCase().includes(searchTermLower)) ||
        (record.breederId && record.breederId.includes(searchTerm)) ||
        (record.cowId && record.cowId.toLowerCase().includes(searchTermLower)) ||
        (format(recordDate, 'dd/MM/yyyy').includes(searchTermLower));
      return isMonthMatch && isYearMatch && isPuskeswanMatch && isStaffMatch && isSearchMatch;
    });
  }, [searchTerm, parsedRecords, selectedMonth, selectedYear, selectedPuskeswan, selectedStaff]);

  const filteredBirthData = useMemo(() => {
    if (!parsedBirthRecords) return [];
    let records = parsedBirthRecords.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
    return records.filter(record => {
      const recordDate = record.reportDate;
      const isMonthMatch = selectedMonth === 'all' || recordDate.getMonth().toString() === selectedMonth;
      const isYearMatch = selectedYear === 'all' || recordDate.getFullYear().toString() === selectedYear;
      const isPuskeswanMatch = selectedPuskeswan === 'all' || record.puskeswan === selectedPuskeswan;
      const isStaffMatch = selectedStaff === 'all' || record.staffName === selectedStaff;
      const searchTermLower = searchTerm.toLowerCase();
      const isSearchMatch = searchTerm === '' ||
        (record.breederName && record.breederName.toLowerCase().includes(searchTermLower)) ||
        (record.breederId && record.breederId.includes(searchTerm)) ||
        (record.cowEartag && record.cowEartag.toLowerCase().includes(searchTermLower)) ||
        (format(recordDate, 'dd/MM/yyyy').includes(searchTermLower));
      return isMonthMatch && isYearMatch && isPuskeswanMatch && isStaffMatch && isSearchMatch;
    });
  }, [searchTerm, parsedBirthRecords, selectedMonth, selectedYear, selectedPuskeswan, selectedStaff]);
  
  const combinedRecords = useMemo(() => {
    const inseminasi = filteredInseminationData.map(r => ({
      id: r.id,
      date: r.inseminationDate,
      type: 'Inseminasi' as const,
      breeder: r.breederName,
      breederId: r.breederId,
      staff: r.staffName,
      puskeswan: r.puskeswan,
      mainInfo: `Eartag: ${r.cowId}`,
      subInfo: `Straw: ${r.strawType}`
    }));

    const kelahiran = filteredBirthData.map(r => ({
      id: r.id,
      date: r.reportDate,
      type: 'Kelahiran' as const,
      breeder: r.breederName,
      breederId: r.breederId,
      staff: r.staffName,
      puskeswan: r.puskeswan,
      mainInfo: r.matingType,
      subInfo: r.children.map(c => `${c.gender}(${c.count})`).join(', ')
    }));

    return [...inseminasi, ...kelahiran].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredInseminationData, filteredBirthData]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    parsedRecords.forEach(r => years.add(r.inseminationDate.getFullYear().toString()));
    parsedBirthRecords.forEach(r => years.add(r.reportDate.getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [parsedRecords, parsedBirthRecords]);

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const exportInseminationToExcel = () => {
    if (filteredInseminationData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data inseminasi untuk diekspor.' });
        return;
    }
    const wb = XLSX.utils.book_new();
    const headers = [
        'No.', 'Tanggal IB', 'Puskeswan', 'Nama Peternak', 'Alamat Peternak', 'Nomor HP', 'ID Peternak (KTP)', 
        'Jenis Sapi', 'ID Indukan (Eartag)', 'Jenis Straw', 'ID Pejantan', 'ID Batch', 'Produsen'
    ];
    const dataRows = filteredInseminationData.map((record, index) => [
      index + 1,
      format(record.inseminationDate, 'dd-MM-yyyy'),
      record.puskeswan,
      record.breederName,
      record.breederAddress,
      record.phoneNumber,
      record.breederId,
      record.cowType,
      record.cowId,
      record.strawType,
      record.strawId,
      record.strawBatchId,
      record.strawProducer,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, ws, "Inseminasi");
    XLSX.writeFile(wb, `Laporan_IB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportBirthToExcel = () => {
    if (filteredBirthData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data kelahiran untuk diekspor.' });
        return;
    }
    const wb = XLSX.utils.book_new();
    const headers = [
        'No.', 'Tgl Laporan', 'Puskeswan', 'Nama Peternak', 'Identitas Peternak', 'Alamat', 
        'Jenis Perkawinan', 'Jenis Indukan', 'Eartag Indukan', 'Jenis Pejantan', 'Eartag Pejantan',
        'Tgl Lahir Anak', 'Data Anakan'
    ];
    const dataRows = filteredBirthData.map((record, index) => [
      index + 1,
      format(record.reportDate, 'dd-MM-yyyy'),
      record.puskeswan,
      record.breederName,
      record.breederId,
      record.breederAddress,
      record.matingType,
      record.cowType || '-',
      record.cowEartag || '-',
      record.bullType || '-',
      record.bullEartag || '-',
      record.birthDate ? format(record.birthDate, 'dd-MM-yyyy') : '-',
      record.children.map(c => `${c.gender}(${c.count})`).join(', ')
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, ws, "Kelahiran");
    XLSX.writeFile(wb, `Laporan_Kelahiran_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const RecordDetailRow = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catatan Inseminasi & Kelahiran</CardTitle>
          <CardDescription>
            Lihat, cari, ekspor, dan analisis semua data pelayanan ternak yang telah tercatat.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Filter & Ekspor Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="filter-puskeswan">Puskeswan</Label>
                    <Select onValueChange={setSelectedPuskeswan} value={selectedPuskeswan}>
                        <SelectTrigger id="filter-puskeswan">
                            <SelectValue placeholder="Semua Puskeswan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Puskeswan</SelectItem>
                            {puskeswanOptions.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="filter-staff">Nama Petugas</Label>
                    <Select onValueChange={setSelectedStaff} value={selectedStaff}>
                        <SelectTrigger id="filter-staff">
                            <SelectValue placeholder="Semua Petugas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Petugas</SelectItem>
                            {staffFilterOptions.map(staff => (
                                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Button onClick={exportInseminationToExcel} disabled={isLoadingInsemination || filteredInseminationData.length === 0} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Unduh Data Inseminasi
                </Button>
                <Button variant="outline" onClick={exportBirthToExcel} disabled={isLoadingBirth || filteredBirthData.length === 0} className="w-full border-accent text-accent-foreground hover:bg-accent/10">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Unduh Laporan Kelahiran
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="grid grid-cols-2 gap-2 w-full sm:flex-1">
                <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                  <SelectTrigger aria-label="Pilih Bulan">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bulan</SelectItem>
                    {months.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={setSelectedYear} value={selectedYear}>
                  <SelectTrigger aria-label="Pilih Tahun">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Cari nama, eartag, KTP, atau tanggal..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center bg-muted p-1 rounded-lg w-full sm:w-auto self-start">
              <Button 
                variant={view === 'table' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setView('table')} 
                className="flex-1 sm:flex-none"
              >
                <TableIcon className="mr-2 h-4 w-4" />
                Tabel
              </Button>
              <Button 
                variant={view === 'stats' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setView('stats')}
                className="flex-1 sm:flex-none"
              >
                <BarChart className="mr-2 h-4 w-4" />
                Statistik
              </Button>
            </div>

            {view === 'table' ? (
              (isLoadingInsemination || isLoadingBirth) ? <Skeleton className="h-48 w-full" /> : (
                <div className="w-full">
                  <div className="md:hidden">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {combinedRecords.map((record) => (
                        <AccordionItem value={record.id!} key={record.id!} className="border rounded-lg bg-card">
                          <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                          variant={record.type === 'Inseminasi' ? 'default' : 'secondary'} 
                                          className={cn(
                                            "text-[10px] h-4 px-1 border-transparent",
                                            record.type === 'Kelahiran' && "bg-accent text-accent-foreground hover:bg-accent/80"
                                          )}
                                        >
                                            {record.type}
                                        </Badge>
                                        <div className="font-bold">{record.staff}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{record.puskeswan}</div>
                                    <div className="text-xs text-muted-foreground pt-1">{format(record.date, 'dd/MM/yyyy')}</div>
                                </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 pt-0">
                            <div className="space-y-2 border-t pt-4">
                              <RecordDetailRow label="Nama Peternak" value={record.breeder} />
                              <RecordDetailRow label="Info Utama" value={record.mainInfo} />
                              <RecordDetailRow label="Detail" value={record.subInfo} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
        
                  <div className="hidden md:block">
                      <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Tipe</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Peternak</TableHead>
                              <TableHead>Info Utama</TableHead>
                              <TableHead>Detail</TableHead>
                              <TableHead>Petugas</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {combinedRecords.map((record) => (
                              <TableRow key={record.id}>
                                  <TableCell>
                                    <Badge 
                                      variant={record.type === 'Inseminasi' ? 'default' : 'secondary'}
                                      className={cn(
                                        record.type === 'Kelahiran' && "bg-accent text-accent-foreground hover:bg-accent/80 border-transparent"
                                      )}
                                    >
                                        {record.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{format(record.date, 'dd/MM/yyyy')}</TableCell>
                                  <TableCell>
                                      <div className="font-medium">{record.breeder}</div>
                                      <div className="text-sm text-muted-foreground">{record.breederId}</div>
                                  </TableCell>
                                  <TableCell>{record.mainInfo}</TableCell>
                                  <TableCell>{record.subInfo}</TableCell>
                                  <TableCell>{record.staff}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                      </Table>
                  </div>
                </div>
              )
            ) : (
              <StatisticsView records={parsedRecords} birthRecords={parsedBirthRecords} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
