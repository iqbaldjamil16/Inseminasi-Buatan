'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord, BirthRecordSchema, type BirthRecord } from '@/lib/types';
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
import { Search, BarChart, Table as TableIcon, FileSpreadsheet, ExternalLink, Image as ImageIcon, Pencil, Trash2, Lock, Unlock, Plus } from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCollection, useFirestore, useMemoFirebase, useUser, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { StatisticsView } from './statistics-view';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Master Data Definitions
const budongBudongStaff = ['Anshari Saleh', 'Hadi', 'Nur Fauzi', 'Rahman', 'Suprapto', 'Tadi Sole'].sort();
const karossaStaff = ['Asri Rasyid', 'Basuki', 'drh. Stephani', 'Hasaruddin', 'Nasaruddin', 'Adiatman', 'Surianca'].sort();
const pangaleStaff = ['Andri', 'drh. Ketut Elok', 'Jarwo', 'Jawaril', 'Kamarudin', 'Kamaruddin', 'Mansyur', 'Sugeng'].sort();
const tobadakStaff = ['Aser M', 'drh. Ishak', 'Endang', 'Feliks S', 'Jupry', 'Madalena'].sort();
const topoyoStaff = ['Alfons B', 'drh. Iqbal Djamil', 'Fitriani', 'Haslim', 'Rizky A'].sort();

const puskeswanOptions = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

const livestockTypes = [
  'Sapi Bali',
  'Sapi Madura',
  'Sapi Simental',
  'Sapi Limosin',
  'Sapi Brahman',
  'Sapi Angus',
  'Kambing Kacang',
  'Kambing Etawa',
  'Kambing PE',
  'Babi',
  'Lainnya'
];

const strawProducerOptions = [
  'BIB Lembang',
  'BIB Singosari',
  'BIB Pucak Maros',
  'Lainnya'
];

const staffMap: Record<string, string[]> = {
  'Puskeswan Budong-Budong': budongBudongStaff,
  'Puskeswan Karossa': karossaStaff,
  'Puskeswan Pangale': pangaleStaff,
  'Puskeswan Tobadak': tobadakStaff,
  'Puskeswan Topoyo': topoyoStaff,
};

export function RecordsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [hasHydrated, setHasHydrated] = useState(false);
  const [selectedPuskeswan, setSelectedPuskeswan] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [view, setView] = useState<'table' | 'stats'>('table');

  // Admin / Lock State
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  // Set current month and year on mount
  useEffect(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth().toString());
    setSelectedYear(now.getFullYear().toString());
    setHasHydrated(true);
  }, []);

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
      subInfo: r.strawType,
      cowInfo: `${r.cowType || '-'}-${r.cowId || '-'}`,
      gdLink: r.googleDriveLink,
      photo: r.servicePhoto,
      rawData: r
    }));

    const kelahiran = filteredBirthData.map(r => ({
      id: r.id,
      date: r.reportDate,
      type: 'Kelahiran' as const,
      breeder: r.breederName,
      breederId: r.breederId,
      staff: r.staffName,
      puskeswan: r.puskeswan,
      subInfo: r.matingType === 'Inseminasi Buatan' 
        ? (r.bullType || '-') 
        : r.children.map(c => `${c.gender}(${c.count})`).join(', '),
      cowInfo: `${r.cowType || '-'}-${r.cowEartag || '-'}`,
      gdLink: r.googleDriveLink,
      photo: r.servicePhoto,
      rawData: r
    }));

    return [...inseminasi, ...kelahiran].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filteredInseminationData, filteredBirthData]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    if (hasHydrated) {
      years.add(new Date().getFullYear().toString());
    }
    parsedRecords.forEach(r => years.add(r.inseminationDate.getFullYear().toString()));
    parsedBirthRecords.forEach(r => years.add(r.reportDate.getFullYear().toString()));
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [parsedRecords, parsedBirthRecords, hasHydrated]);

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const handleAuth = () => {
    if (passwordInput === 'pkh36') {
      setIsAdmin(true);
      setIsPasswordDialogOpen(false);
      setPasswordInput('');
      toast({ title: 'Akses Diberikan', description: 'Mode admin aktif.' });
    } else {
      toast({ title: 'Akses Ditolak', description: 'Password salah.', variant: 'destructive' });
    }
  };

  const handleDelete = (id: string, type: 'Inseminasi' | 'Kelahiran') => {
    if (!firestore) return;
    const collectionName = type === 'Inseminasi' ? 'inseminationRecords' : 'birthRecords';
    const docRef = doc(firestore, collectionName, id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: 'Dihapus', description: 'Data berhasil dihapus.' });
  };

  const sanitizeSheetName = (name: string) => {
    return name.substring(0, 31).replace(/[\[\]\*\?\/\\]/g, '');
  };

  const exportInseminationToExcel = () => {
    if (filteredInseminationData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data inseminasi untuk diekspor.' });
        return;
    }
    const wb = XLSX.utils.book_new();
    const headers = [
        'No.', 'Tanggal IB', 'Petugas', 'Puskeswan', 'Nama Peternak', 'Alamat Peternak', 'Nomor HP', 'ID Peternak (KTP)', 
        'Jenis Ternak Indukan', 'ID Indukan (Eartag)', 'Jenis Straw Pejantan', 'ID Pejantan Straw', 'ID Batch Straw', 'Produsen Straw', 'Link Google Drive'
    ];

    if (selectedStaff === 'all') {
      const groupedData: Record<string, InseminationRecord[]> = {};
      filteredInseminationData.forEach(r => {
        if (!groupedData[r.staffName]) groupedData[r.staffName] = [];
        groupedData[r.staffName].push(r);
      });

      Object.entries(groupedData).forEach(([staffName, records]) => {
        const dataRows = records.map((record, index) => [
          index + 1,
          format(record.inseminationDate, 'dd-MM-yyyy'),
          record.staffName,
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
          record.googleDriveLink || '-',
        ]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(staffName));
      });
    } else {
      const dataRows = filteredInseminationData.map((record, index) => [
        index + 1,
        format(record.inseminationDate, 'dd-MM-yyyy'),
        record.staffName,
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
        record.googleDriveLink || '-',
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
      XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(selectedStaff));
    }
    
    XLSX.writeFile(wb, `Laporan_IB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportBirthToExcel = () => {
    if (filteredBirthData.length === 0) {
        toast({ title: 'Info', description: 'Tidak ada data kelahiran untuk diekspor.' });
        return;
    }
    const wb = XLSX.utils.book_new();
    const headers = [
        'No.', 'Tgl Laporan', 'Petugas', 'Puskeswan', 'Nama Peternak', 'Identitas Peternak', 'Alamat', 
        'Jenis Perkawinan', 'Jenis Indukan', 'Eartag Indukan', 'Jenis Pejantan', 'Eartag Pejantan',
        'Tgl Lahir Anak', 'Jenis Kelamin Anak', 'Jumlah Anak', 'Link Google Drive'
    ];
    
    if (selectedStaff === 'all') {
        const groupedData: Record<string, BirthRecord[]> = {};
        filteredBirthData.forEach(r => {
          if (!groupedData[r.staffName]) groupedData[r.staffName] = [];
          groupedData[r.staffName].push(r);
        });

        Object.entries(groupedData).forEach(([staffName, records]) => {
            const dataRows: any[][] = [];
            let displayIndex = 1;
            records.forEach((record) => {
              record.children.forEach((child) => {
                dataRows.push([
                  displayIndex++,
                  format(record.reportDate, 'dd-MM-yyyy'),
                  record.staffName,
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
                  child.gender || '-',
                  child.count || '0',
                  record.googleDriveLink || '-',
                ]);
              });
            });
            const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
            XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(staffName));
        });
    } else {
        const dataRows: any[][] = [];
        let displayIndex = 1;
        filteredBirthData.forEach((record) => {
          record.children.forEach((child) => {
            dataRows.push([
              displayIndex++,
              format(record.reportDate, 'dd-MM-yyyy'),
              record.staffName,
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
              child.gender || '-',
              child.count || '0',
              record.googleDriveLink || '-',
            ]);
          });
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
        XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(selectedStaff));
    }

    XLSX.writeFile(wb, `Laporan_Kelahiran_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const RecordDetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? '-'}</span>
    </div>
  );

  const PhotoViewer = ({ photoUrl, className }: { photoUrl: string, className?: string }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className={cn("relative group cursor-pointer rounded overflow-hidden border", className)}>
          <img src={photoUrl} alt="Thumbnail" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Search className="h-4 w-4 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Foto Pelayanan</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-2">
           <img src={photoUrl} alt="Pelayanan" className="max-w-full max-h-[70vh] rounded shadow-lg object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Catatan Inseminasi & Kelahiran</CardTitle>
            <CardDescription>
              Lihat, cari, ekspor, dan analisis semua data pelayanan ternak yang telah tercatat.
            </CardDescription>
          </div>
          <Button 
            variant={isAdmin ? "secondary" : "ghost"} 
            size="icon" 
            onClick={() => isAdmin ? setIsAdmin(false) : setIsPasswordDialogOpen(true)}
            title={isAdmin ? "Kunci Admin" : "Buka Admin"}
          >
            {isAdmin ? <Unlock className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </CardHeader>
      </Card>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Akses Admin</DialogTitle>
            <DialogDescription>Masukkan password untuk mengaktifkan aksi edit dan hapus.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Masukkan password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAuth}>Konfirmasi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Button onClick={exportBirthToExcel} disabled={isLoadingBirth || filteredBirthData.length === 0} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Unduh Data Kelahiran
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
                        <AccordionItem value={record.id!} key={record.id!} className="border rounded-lg bg-card overflow-hidden">
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
                              <RecordDetailRow label="Jenis Straw" value={record.subInfo} />
                              <RecordDetailRow label="Jenis Indukan" value={record.cowInfo} />
                              <RecordDetailRow label="Link GD" value={
                                record.gdLink ? (
                                  <a href={record.gdLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline justify-end">
                                    Buka <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : '-'
                              } />
                              {isAdmin && (
                                <div className="flex gap-2 justify-end pt-4">
                                  <EditRecordDialog record={record.rawData} type={record.type} isAdmin={isAdmin} />
                                  <DeleteConfirmDialog 
                                    onConfirm={() => handleDelete(record.id!, record.type)}
                                    title={`Hapus Data ${record.type}`}
                                    description={`Apakah Anda yakin ingin menghapus data peternak ${record.breeder}?`}
                                  />
                                </div>
                              )}
                            </div>
                            {record.photo && (
                              <div className="mt-4 w-full">
                                <PhotoViewer photoUrl={record.photo} className="w-full h-auto max-h-64" />
                              </div>
                            )}
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
                              <TableHead>Jenis Straw</TableHead>
                              <TableHead>Jenis Indukan</TableHead>
                              <TableHead>Link GD</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                              <TableHead>Petugas</TableHead>
                              {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
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
                                  <TableCell>{record.subInfo}</TableCell>
                                  <TableCell>{record.cowInfo}</TableCell>
                                  <TableCell>
                                    {record.gdLink ? (
                                      <a href={record.gdLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                        Buka <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell>
                                    {record.photo ? (
                                      <PhotoViewer photoUrl={record.photo} className="w-12 h-12" />
                                    ) : (
                                      <div className="text-muted-foreground/30"><ImageIcon className="h-6 w-6" /></div>
                                    )}
                                  </TableCell>
                                  <TableCell>{record.staff}</TableCell>
                                  {isAdmin && (
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <EditRecordDialog record={record.rawData} type={record.type} isAdmin={isAdmin} />
                                        <DeleteConfirmDialog 
                                          onConfirm={() => handleDelete(record.id!, record.type)}
                                          title={`Hapus Data ${record.type}`}
                                          description={`Hapus data peternak ${record.breeder}?`}
                                        />
                                      </div>
                                    </TableCell>
                                  )}
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

function DeleteConfirmDialog({ onConfirm, title, description }: { onConfirm: () => void, title: string, description: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline">Batal</Button>
          <Button variant="destructive" onClick={onConfirm}>Hapus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditRecordDialog({ record, type, isAdmin }: { record: any, type: 'Inseminasi' | 'Kelahiran', isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(type === 'Inseminasi' ? InseminationRecordSchema : BirthRecordSchema),
    defaultValues: {
      ...record,
      inseminationDate: record.inseminationDate ? new Date(record.inseminationDate) : undefined,
      reportDate: record.reportDate ? new Date(record.reportDate) : undefined,
      birthDate: record.birthDate ? new Date(record.birthDate) : undefined,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });

  const watchPuskeswan = form.watch('puskeswan');
  const watchMatingType = form.watch('matingType');

  const staffOptions = useMemo(() => staffMap[watchPuskeswan] || [], [watchPuskeswan]);

  const onSubmit = (data: any) => {
    if (!firestore || !record.id) return;
    const collectionName = type === 'Inseminasi' ? 'inseminationRecords' : 'birthRecords';
    const docRef = doc(firestore, collectionName, record.id);
    updateDocumentNonBlocking(docRef, data);
    toast({ title: 'Diperbarui', description: 'Data berhasil diperbarui.' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data {type}</DialogTitle>
          <DialogDescription>Perbarui semua bidang informasi catatan pelayanan.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Common Fields */}
              <FormField
                control={form.control}
                name={type === 'Inseminasi' ? 'inseminationDate' : 'reportDate'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal {type === 'Inseminasi' ? 'IB' : 'Laporan'}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="puskeswan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puskeswan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Puskeswan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {puskeswanOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="staffName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Petugas</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Petugas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staffOptions.map((staff) => (
                          <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                        ))}
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breederName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Peternak</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breederId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identitas Peternak (KTP/HP)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breederAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat (Desa)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'Inseminasi' && (
                <>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. HP</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cowType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Ternak Indukan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {livestockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Indukan (Eartag)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strawType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Straw Pejantan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {livestockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strawId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Pejantan Straw</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strawBatchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Batch Straw</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strawProducer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produsen Straw</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {strawProducerOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {type === 'Kelahiran' && (
                <>
                  <FormField
                    control={form.control}
                    name="matingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Perkawinan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kawin Alam">Kawin Alam</SelectItem>
                            <SelectItem value="Inseminasi Buatan">Inseminasi Buatan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cowType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Indukan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {livestockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cowEartag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. Eartag Indukan</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bullType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{watchMatingType === 'Inseminasi Buatan' ? 'Jenis Straw Pejantan' : 'Jenis Pejantan'}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {livestockTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchMatingType !== 'Inseminasi Buatan' && (
                    <FormField
                      control={form.control}
                      name="bullEartag"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Eartag Pejantan</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {watchMatingType === 'Inseminasi Buatan' && (
                    <>
                      <FormField
                        control={form.control}
                        name="strawId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Straw</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="strawBatchId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Batch</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="strawProducer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produsen Straw</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {strawProducerOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Lahir Anak</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                            onChange={(e) => field.onChange(e.target.valueAsDate)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="googleDriveLink"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Link Google Drive</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {type === 'Kelahiran' && (
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Data Anakan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 first:pt-0 first:border-t-0 relative">
                      <FormField
                        control={form.control}
                        name={`children.${index}.gender`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Jenis Kelamin</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Jantan">Jantan</SelectItem>
                                <SelectItem value="Betina">Betina</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <div className="flex items-end gap-2">
                        <FormField
                          control={form.control}
                          name={`children.${index}.count`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">Jumlah</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive mb-0.5"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => append({ gender: '', count: '1' })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Tambah Anakan
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}