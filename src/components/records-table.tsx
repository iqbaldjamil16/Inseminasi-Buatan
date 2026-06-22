
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { Download, Search, Trash2, FilePenLine, ChevronDown, Loader2, BarChart, Table as TableIcon } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCollection, useFirestore, useMemoFirebase, useUser, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StatisticsView } from './statistics-view';
import * as XLSX from 'xlsx';

// Master Data Definitions
const topoyoVillages = [
  'Desa Bambamanurug', 'Desa Budong-Budong', 'Desa Kabubu', 'Desa Pangalloang', 
  'Desa Paraili', 'Desa Salule\'bo', 'Desa Salupangkang', 'Desa Salupangkang IV', 
  'Desa Sinabatta', 'Desa Tabolang', 'Desa Tangkau', 'Desa Tappilina', 
  'Desa Topoyo', 'Desa Tumbu', 'Desa Waeputeh'
].sort();

const tobadakVillages = [
  'Desa Bambadaru', 'Desa Batu Parigi', 'Desa Mahahe', 'Desa Polongaan', 
  'Desa Saluadak', 'Desa Sejati', 'Desa Sulobaja', 'Desa Tobadak'
].sort();

const pangaleVillages = [
    'Desa Kombiling', 'Desa Kuo', 'Desa Lamba-lamba', 'Desa Lemo-Lemo', 
    'Desa Pangale', 'Desa Polo Camba', 'Desa Polo Lereng', 'Desa Polo Pangale', 
    'Desa Sartanamaju'
].sort();

const budongBudongVillages = [
  'Desa Babana', 'Desa Barakkang', 'Desa Bojo', 'Desa Kire', 'Desa Lembah Hada', 
  'Desa Lumu', 'Desa Pasapa', 'Desa Potantanakayyang', 'Desa Salogatta', 
  'Desa Salumanurung', 'Desa Tinali'
].sort();

const karossaVillages = [
  'Desa Benggaulu', 'Desa Kadaila', 'Desa Karossa', 'Desa Kayucalla', 'Desa Lara',
  'Desah Lembah Hopo', 'Desa Salubiro', 'Desa Sanjango', 'Desa Sukamaju', 
  'Desa Tasoskko', 'Desa Kambunong', 'Mora IV', 'UPT Lara III'
].sort();

const budongBudongStaff = ['Anshari Saleh', 'Hadi', 'Rahman'].sort();
const karossaStaff = ['Asari Rasyid', 'drh. Stephani', 'Basuki', 'Hasaruddin'].sort();
const pangaleStaff = ['drh. Ketut Elok', 'Mansyur', 'Jawaril', 'Sugeng'].sort();
const tobadakStaff = ['Endang', 'drh. Ishak'].sort();
const topoyoStaff = ['drh. Iqbal Djamil', 'Alfons B', 'Haslim'].sort();

const puskeswanOptions = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

const commonSapiOptions = [
  'Sapi Angus', 'Sapi Bali', 'Sapi Brahman', 'Sapi Donggala', 
  'Sapi Limosin', 'Sapi Madura', 'Sapi Simental'
].sort();

const producerOptions = [
  'BIB Lembang', 'BIB Maros', 'BIB Singosari'
].sort();

export function RecordsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPuskeswan, setSelectedPuskeswan] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<InseminationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<InseminationRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'table' | 'stats'>('table');

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const recordsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'inseminationRecords') : null),
    [firestore, user]
  );
  
  const { data: recordsData, isLoading } = useCollection<InseminationRecord>(recordsQuery);

  const parsedRecords = useMemo(() => {
    if (!recordsData) return [];
    return recordsData.map(record => ({
      ...record,
      inseminationDate: (record.inseminationDate as any)?.toDate ? (record.inseminationDate as any).toDate() : new Date(record.inseminationDate)
    })).filter(r => r.inseminationDate && !isNaN(r.inseminationDate.getTime()));
  }, [recordsData]);

  const form = useForm<InseminationRecord>({
    resolver: zodResolver(InseminationRecordSchema),
  });

  const staffFilterOptions = useMemo(() => {
    const staffMap: Record<string, string[]> = {
      'Puskeswan Budong-Budong': budongBudongStaff,
      'Puskeswan Karossa': karossaStaff,
      'Puskeswan Pangale': pangaleStaff,
      'Puskeswan Tobadak': ['Endang', 'drh. Ishak'],
      'Puskeswan Topoyo': topoyoStaff,
    };

    if (selectedPuskeswan === 'all') {
      const allUniqueStaff = new Set<string>();
      parsedRecords.forEach(record => {
        if (record.staffName) allUniqueStaff.add(record.staffName);
      });
      return Array.from(allUniqueStaff).sort();
    }
    
    return staffMap[selectedPuskeswan] || [];
  }, [selectedPuskeswan, parsedRecords]);

  useEffect(() => {
    if (selectedPuskeswan !== 'all' && selectedStaff !== 'all') {
      if (!staffFilterOptions.includes(selectedStaff)) {
        setSelectedStaff('all');
      }
    }
  }, [selectedPuskeswan, staffFilterOptions, selectedStaff]);

  const watchPuskeswan = form.watch('puskeswan');
  const watchStaffName = form.watch('staffName');
  const watchBreederAddress = form.watch('breederAddress');
  const watchCowType = form.watch('cowType');
  const watchStrawType = form.watch('strawType');
  const watchStrawProducer = form.watch('strawProducer');

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        ...editingRecord,
        inseminationDate: editingRecord.inseminationDate ? (editingRecord.inseminationDate as any).toDate ? (editingRecord.inseminationDate as any).toDate() : new Date(editingRecord.inseminationDate) : new Date(),
      });
    }
  }, [editingRecord, form]);

  const handleUpdate = async (data: InseminationRecord) => {
    if (!firestore || !editingRecord?.id) return;
    setIsSaving(true);
    
    const docRef = doc(firestore, 'inseminationRecords', editingRecord.id);
    updateDocumentNonBlocking(docRef, data);
    
    toast({
      title: 'Sukses',
      description: 'Data berhasil diperbarui.',
    });

    setIsSaving(false);
    setEditingRecord(null);
  };

  const handleDelete = async () => {
    if (!firestore || !deletingRecord?.id) return;
    
    const docRef = doc(firestore, 'inseminationRecords', deletingRecord.id);
    deleteDocumentNonBlocking(docRef);

    toast({
      title: 'Sukses',
      description: 'Data berhasil dihapus.',
      variant: 'destructive'
    });
    
    setDeletingRecord(null);
  };
  
  const availableYears = useMemo(() => {
    if (!parsedRecords) return [];
    const years = new Set<string>();
    parsedRecords.forEach(record => {
      const date = record.inseminationDate;
      if (date && !isNaN(date.getFullYear())) {
         years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [parsedRecords]);

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const filteredData = useMemo(() => {
    if (!parsedRecords) return [];

    let records = parsedRecords.sort((a, b) => b.inseminationDate.getTime() - a.inseminationDate.getTime());

    return records.filter(record => {
      const recordDate = record.inseminationDate;
      const isMonthMatch = selectedMonth === 'all' || recordDate.getMonth().toString() === selectedMonth;
      const isYearMatch = selectedYear === 'all' || recordDate.getFullYear().toString() === selectedYear;
      const isPuskeswanMatch = selectedPuskeswan === 'all' || record.puskeswan === selectedPuskeswan;
      const isStaffMatch = selectedStaff === 'all' || record.staffName === selectedStaff;

      const searchTermLower = searchTerm.toLowerCase();
      const isSearchMatch =
        searchTerm === '' ||
        (record.breederName && record.breederName.toLowerCase().includes(searchTermLower)) ||
        (record.breederId && record.breederId.includes(searchTerm)) ||
        (record.cowId && record.cowId.toLowerCase().includes(searchTermLower)) ||
        (format(recordDate, 'dd/MM/yyyy').includes(searchTermLower));

      return isMonthMatch && isYearMatch && isPuskeswanMatch && isStaffMatch && isSearchMatch;
    });
  }, [searchTerm, parsedRecords, selectedMonth, selectedYear, selectedPuskeswan, selectedStaff]);
  
  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    const wb = XLSX.utils.book_new();

    const groups: Record<string, InseminationRecord[]> = {};
    if (selectedStaff !== 'all') {
      const name = filteredData[0]?.staffName || 'Laporan';
      groups[name] = filteredData;
    } else {
      filteredData.forEach(r => {
        const name = r.staffName || 'Lainnya';
        if (!groups[name]) groups[name] = [];
        groups[name].push(r);
      });
    }

    Object.entries(groups).forEach(([staffName, records]) => {
      const headers = [
          'No.', 'Tanggal', 'Puskeswan', 'Nama Peternak', 'Alamat Peternak', 'Nomor HP', 'ID Peternak (KTP)', 
          'Jenis Sapi', 'ID Indukan (Eartag)', 'Jenis Straw', 'ID Pejantan', 'ID Batch', 'Produsen'
      ];

      const dataRows = records.map((record, index) => [
        index + 1,
        record.inseminationDate ? format(new Date(record.inseminationDate), 'dd-MM-yyyy') : '',
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

      const wsData = [
        [], // Row 1
        [], // Row 2
        [staffName], // Row 3
        ['', ...headers], // Row 4
        ...dataRows.map(row => ['', ...row]) // Row 5+
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wscols = [
        { wch: 20 }, // Kolom A
        { wch: 5 },  // Kolom B (No.)
        ...headers.slice(1).map(() => ({ wch: 15 })) 
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, staffName.substring(0, 31));
    });

    XLSX.writeFile(wb, `Laporan_IB_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <CardTitle>Catatan Inseminasi Buatan</CardTitle>
          <CardDescription>
            Lihat, cari, ekspor, dan analisis semua data inseminasi yang telah tercatat.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Data Laporan IB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <Button onClick={exportToExcel} disabled={isLoading || filteredData.length === 0} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Unduh Laporan
            </Button>
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
              isLoading ? <Skeleton className="h-48 w-full" /> : (
                <div className="w-full">
                  <div className="md:hidden">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                      {filteredData.map((record) => (
                        <AccordionItem value={record.id!} key={record.id!} className="border rounded-lg bg-card">
                          <AccordionTrigger className="p-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex-1 text-left">
                                    <div className="font-bold">{record.staffName}</div>
                                    <div className="text-sm text-muted-foreground">{record.puskeswan}</div>
                                    <div className="text-xs text-muted-foreground pt-1">{record.inseminationDate ? format(new Date(record.inseminationDate), 'dd/MM/yyyy') : 'N/A'}</div>
                                </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 pt-0">
                            <div className="space-y-2 border-t pt-4">
                              <RecordDetailRow label="Nama Peternak" value={record.breederName} />
                              <RecordDetailRow label="ID Sapi" value={record.cowId} />
                              <RecordDetailRow label="Pejantan" value={record.strawId} />
                              <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline" size="icon" onClick={() => setEditingRecord(record)}><FilePenLine className="h-4 w-4" /></Button>
                                  <Button variant="destructive" size="icon" onClick={() => setDeletingRecord(record)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
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
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Peternak</TableHead>
                              <TableHead>ID Sapi</TableHead>
                              <TableHead>Pejantan</TableHead>
                              <TableHead>Petugas</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {filteredData.map((record) => (
                              <TableRow key={record.id}>
                                  <TableCell>{record.inseminationDate ? format(new Date(record.inseminationDate), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                                  <TableCell>
                                      <div className="font-medium">{record.breederName}</div>
                                      <div className="text-sm text-muted-foreground">{record.breederId}</div>
                                  </TableCell>
                                  <TableCell>{record.cowId}</TableCell>
                                  <TableCell>{record.strawType}</TableCell>
                                  <TableCell>{record.staffName}</TableCell>
                                  <TableCell className="text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                                              <FilePenLine className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingRecord(record)}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                      </Table>
                  </div>
                </div>
              )
            ) : (
              <StatisticsView records={parsedRecords} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

