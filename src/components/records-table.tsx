'use client';

import React, { useMemo, useState } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

// Master Data Definitions (Synced with InseminationForm)
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
  'Desa Lembah Hopo', 'Desa Salubiro', 'Desa Sanjango', 'Desa Sukamaju', 
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

  // Watch fields for dynamic form logic
  const watchPuskeswan = form.watch('puskeswan');
  const watchStaffName = form.watch('staffName');
  const watchBreederAddress = form.watch('breederAddress');
  const watchCowType = form.watch('cowType');
  const watchStrawType = form.watch('strawType');
  const watchStrawProducer = form.watch('strawProducer');

  React.useEffect(() => {
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

  const allStaff = useMemo(() => {
    if (!parsedRecords) return [];
    const staff = new Set<string>();
    parsedRecords.forEach(record => {
      if (record.staffName) staff.add(record.staffName);
    });
    return Array.from(staff).sort();
  }, [parsedRecords]);

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

    const headers = [
        'Tanggal IB', 'Puskeswan', 'Nama Peternak', 'Alamat Peternak', 'Nomor HP', 'ID Peternak (KTP)', 
        'Jenis Sapi', 'ID Indukan (Eartag)', 'Jenis Straw', 'ID Pejantan', 'ID Batch', 'Produsen'
    ];

    const escapeXml = (unsafe: any) => {
        if (unsafe === null || unsafe === undefined) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };

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

    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>IB-Pro</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
   <Font ss:Bold="1" ss:Size="11"/>
   <Interior ss:Color="#D9EAD3" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataCell">
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
  </Style>
  <Style ss:ID="StaffNameStyle">
   <Font ss:Bold="1" ss:Size="12"/>
  </Style>
 </Styles>`;

    Object.entries(groups).forEach(([staffName, records]) => {
      const sheetName = escapeXml(staffName.substring(0, 31).replace(/[:\\\?\*\[\]\/]/g, ''));
      
      xml += `\n <Worksheet ss:Name="${sheetName}">
  <Table>
   <Column ss:Width="80"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="150"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   
   <Row ss:Height="15"></Row>
   <Row ss:Height="15"></Row>
   <Row ss:Height="20">
    <Cell ss:StyleID="StaffNameStyle"><Data ss:Type="String">${escapeXml(staffName)}</Data></Cell>
   </Row>
   <Row ss:Height="20">
    ${headers.map(h => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}
   </Row>`;

      records.forEach(record => {
        const rowData = [
          record.inseminationDate ? format(new Date(record.inseminationDate), 'yyyy-MM-dd') : '',
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
        ];

        xml += `\n   <Row ss:Height="15">
    ${rowData.map(val => `<Cell ss:StyleID="DataCell"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`).join('')}
   </Row>`;
      });

      xml += `\n  </Table>
 </Worksheet>`;
    });

    xml += `\n</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_IB_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const RecordDetailRow = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || '-'}</span>
    </div>
  );
  
  const TableSkeleton = () => (
     <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
  
  const StatsSkeleton = () => (
    <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        ))}
    </div>
  );

  const getVillageOptions = (puskeswan: string) => {
    switch (puskeswan) {
        case 'Puskeswan Topoyo': return topoyoVillages;
        case 'Puskeswan Tobadak': return tobadakVillages;
        case 'Puskeswan Pangale': return pangaleVillages;
        case 'Puskeswan Budong-Budong': return budongBudongVillages;
        case 'Puskeswan Karossa': return karossaVillages;
        default: return [];
    }
  };

  const getStaffOptions = (puskeswan: string) => {
    switch (puskeswan) {
      case 'Puskeswan Budong-Budong': return budongBudongStaff;
      case 'Puskeswan Karossa': return karossaStaff;
      case 'Puskeswan Pangale': return pangaleStaff;
      case 'Puskeswan Tobadak': return tobadakStaff;
      case 'Puskeswan Topoyo': return topoyoStaff;
      default: return [];
    }
  };

  const villageOptions = getVillageOptions(watchPuskeswan);
  const staffOptions = getStaffOptions(watchPuskeswan);

  const showVillageDropdown = !!watchPuskeswan;
  const isOtherAddress = showVillageDropdown && (watchBreederAddress === 'Lainnya' || (!villageOptions.includes(watchBreederAddress) && watchBreederAddress !== ''));
  
  const showStaffDropdown = !!watchPuskeswan;
  const isOtherStaff = showStaffDropdown && (watchStaffName === 'Lainnya' || (!staffOptions.includes(watchStaffName) && watchStaffName !== ''));
  
  const isOtherCowType = watchCowType === 'Lainnya' || (!commonSapiOptions.includes(watchCowType) && watchCowType !== '');
  const isOtherStrawType = watchStrawType === 'Lainnya' || (!commonSapiOptions.includes(watchStrawType) && watchStrawType !== '');
  const isOtherStrawProducer = watchStrawProducer === 'Lainnya' || (!producerOptions.includes(watchStrawProducer) && watchStrawProducer !== '');

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
                        {allStaff.map(staff => (
                            <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={exportToExcel} disabled={isLoading || filteredData.length === 0} className="w-full mt-4">
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

            <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
              <div className="flex items-center bg-muted p-1 rounded-lg w-full sm:w-auto">
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
            </div>

            {view === 'table' ? (
              isLoading ? <TableSkeleton /> : (
                <div className="w-full">
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
                                    <Button variant="outline" size="icon" onClick={() => setEditingRecord(record)}><FilePenLine className="h-4 w-4" /></Button>
                                    <Button variant="destructive" size="icon" onClick={() => setDeletingRecord(record)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-12">
                          {(recordsData && recordsData.length > 0) ? 'Tidak ada data yang cocok.' : 'Belum ada data tercatat.'}
                        </div>
                      )}
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
                                              <Button variant="ghost" size="icon" onClick={() => setEditingRecord(record)}>
                                                  <FilePenLine className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeletingRecord(record)}>
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      </TableCell>
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center">
                                  {(recordsData && recordsData.length > 0) ? 'Tidak ada data yang cocok.' : 'Belum ada data tercatat.'}
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                      </Table>
                  </div>
                </div>
              )
            ) : (
              isLoading ? <StatsSkeleton /> : <StatisticsView records={parsedRecords} />
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Catatan Inseminasi</DialogTitle>
              <DialogDescription>
                Lakukan perubahan pada data yang sudah ada. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="inseminationDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal IB</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
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
                                <Select onValueChange={(val) => {
                                  field.onChange(val);
                                  form.setValue('staffName', '');
                                  form.setValue('breederAddress', '');
                                }} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger aria-label="Pilih Puskeswan">
                                            <SelectValue placeholder="Pilih Puskeswan" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {puskeswanOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
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
                          {showStaffDropdown ? (
                            <>
                              <Select onValueChange={field.onChange} value={staffOptions.includes(field.value) ? field.value : (field.value === '' ? '' : 'Lainnya')}>
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
                              {isOtherStaff && (
                                <FormControl className="mt-2">
                                  <Input 
                                    placeholder="Masukkan nama petugas" 
                                    value={field.value === 'Lainnya' ? '' : field.value}
                                    onChange={(e) => field.onChange(e.target.value)} 
                                  />
                                </FormControl>
                              )}
                            </>
                          ) : (
                            <FormControl>
                              <Input placeholder="Masukkan nama petugas" {...field} />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breederAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat Peternak</FormLabel>
                          {showVillageDropdown ? (
                            <>
                              <Select onValueChange={field.onChange} value={villageOptions.includes(field.value) ? field.value : (field.value === '' ? '' : 'Lainnya')}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih Desa" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {villageOptions.map((village) => (
                                    <SelectItem key={village} value={village}>{village}</SelectItem>
                                  ))}
                                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                                </SelectContent>
                              </Select>
                              {isOtherAddress && (
                                <FormControl className="mt-2">
                                  <Input 
                                    placeholder="Masukkan alamat lengkap" 
                                    value={field.value === 'Lainnya' ? '' : field.value}
                                    onChange={(e) => field.onChange(e.target.value)} 
                                  />
                                </FormControl>
                              )}
                            </>
                          ) : (
                            <FormControl>
                              <Input placeholder="Masukkan alamat lengkap" {...field} />
                            </FormControl>
                          )}
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
                          <FormControl>
                            <Input placeholder="Masukkan nama peternak" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor HP</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nomor HP" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breederId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Peternak (KTP)</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan ID peternak (16 digit)" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cowType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Sapi Indukan</FormLabel>
                          <Select onValueChange={field.onChange} value={commonSapiOptions.includes(field.value) ? field.value : (field.value === '' ? '' : 'Lainnya')}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Sapi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonSapiOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          {isOtherCowType && (
                            <FormControl className="mt-2">
                              <Input
                                placeholder="Masukkan jenis sapi"
                                value={field.value === 'Lainnya' ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          )}
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
                          <FormControl>
                            <Input placeholder="Masukkan ID eartag" {...field} value={field.value || ''} />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} value={commonSapiOptions.includes(field.value) ? field.value : (field.value === '' ? '' : 'Lainnya')}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Straw" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonSapiOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          {isOtherStrawType && (
                            <FormControl className="mt-2">
                              <Input
                                placeholder="Masukkan jenis straw"
                                value={field.value === 'Lainnya' ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          )}
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
                          <FormControl>
                            <Input placeholder="Masukkan ID pejantan" {...field} value={field.value || ''} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="Masukkan ID batch" {...field} value={field.value || ''} />
                          </FormControl>
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
                          <Select onValueChange={field.onChange} value={producerOptions.includes(field.value) ? field.value : (field.value === '' ? '' : 'Lainnya')}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Produsen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {producerOptions.map((producer) => (
                                <SelectItem key={producer} value={producer}>{producer}</SelectItem>
                              ))}
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
                          {isOtherStrawProducer && (
                            <FormControl className="mt-2">
                              <Input
                                placeholder="Masukkan produsen straw"
                                value={field.value === 'Lainnya' ? '' : field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Batal</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari server.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
