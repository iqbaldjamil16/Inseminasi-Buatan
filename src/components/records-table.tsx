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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search, Trash2, FilePenLine, ChevronDown, Loader2, CornerUpLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';


export function RecordsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<InseminationRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<InseminationRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const recordsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'inseminationRecords') : null),
    [firestore, user]
  );
  
  const { data: recordsData, isLoading } = useCollection<InseminationRecord>(recordsQuery);

  const form = useForm<InseminationRecord>({
    resolver: zodResolver(InseminationRecordSchema),
  });

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
  
  const displayData = useMemo(() => {
    if (!recordsData) return [];

    if (recordsData.length === 0) {
      return [
          { id: '1', inseminationDate: new Date('2024-05-20'), staffName: 'Dr. Budi', puskeswan: 'Puskeswan Topoyo', breederName: 'Pak Eko', breederAddress: 'Jl. Merdeka No. 10', phoneNumber: '081234567890', breederId: '1234567890123456', cowType: 'Simental', cowId: 'SIM-001', strawType: 'Simental', strawId: 'ST-001', strawBatchId: 'B-001', strawProducer: 'BBIB Singosari' },
          { id: '2', inseminationDate: new Date('2024-05-22'), staffName: 'Dr. Ani', puskeswan: 'Puskeswan Budong-Budong', breederName: 'Bu Siti', breederAddress: 'Jl. Pahlawan No. 5', phoneNumber: '081234567891', breederId: '1234567890123457', cowType: 'Limosin', cowId: 'LIM-002', strawType: 'Limosin', strawId: 'LT-002', strawBatchId: 'B-002', strawProducer: 'BBIB Lembang' },
      ]
    }
    return recordsData;
  }, [recordsData])


  const availableYears = useMemo(() => {
    if (!displayData) return [];
    const years = new Set<string>();
    displayData.forEach(record => {
      const date = (record.inseminationDate as any)?.toDate ? (record.inseminationDate as any).toDate() : new Date(record.inseminationDate);
      if (date && !isNaN(date.getFullYear())) {
         years.add(date.getFullYear().toString());
      }
    });
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [displayData]);

  const months = [
    { value: '0', label: 'Januari' }, { value: '1', label: 'Februari' }, { value: '2', label: 'Maret' },
    { value: '3', label: 'April' }, { value: '4', label: 'Mei' }, { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' }, { value: '7', label: 'Agustus' }, { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' }, { value: '10', label: 'November' }, { value: '11', label: 'Desember' }
  ];

  const filteredData = useMemo(() => {
    if (!displayData) return [];

    let records = displayData.map(record => ({
      ...record,
      inseminationDate: (record.inseminationDate as any)?.toDate ? (record.inseminationDate as any).toDate() : new Date(record.inseminationDate)
    })).sort((a, b) => b.inseminationDate.getTime() - a.inseminationDate.getTime());


    return records.filter(record => {
      if (!record.inseminationDate || isNaN(record.inseminationDate.getTime())) {
          return false;
      }
      const recordDate = record.inseminationDate;
      const isMonthMatch = selectedMonth === 'all' || recordDate.getMonth().toString() === selectedMonth;
      const isYearMatch = selectedYear === 'all' || recordDate.getFullYear().toString() === selectedYear;

      const searchTermLower = searchTerm.toLowerCase();
      const isSearchMatch =
        searchTerm === '' ||
        (record.breederName && record.breederName.toLowerCase().includes(searchTermLower)) ||
        (record.breederId && record.breederId.includes(searchTerm)) ||
        (record.cowId && record.cowId.toLowerCase().includes(searchTermLower)) ||
        (format(recordDate, 'dd/MM/yyyy').includes(searchTermLower));

      return isMonthMatch && isYearMatch && isSearchMatch;
    });
  }, [searchTerm, displayData, selectedMonth, selectedYear]);
  
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
  
  const puskeswanOptions = [
    'Puskeswan Budong-Budong',
    'Puskeswan Karossa',
    'Puskeswan Pangale',
    'Puskeswan Tobadak',
    'Puskeswan Topoyo',
  ];

  const formFields: { name: keyof InseminationRecord; label: string }[] = [
    { name: 'staffName', label: 'Nama Petugas' },
    { name: 'breederName', label: 'Nama Peternak' },
    { name: 'breederAddress', label: 'Alamat Peternak' },
    { name: 'phoneNumber', label: 'Nomor HP' },
    { name: 'breederId', label: 'ID Peternak (KTP)' },
    { name: 'cowType', label: 'Jenis Sapi Indukan' },
    { name: 'cowId', label: 'ID Indukan (Eartag)' },
    { name: 'strawType', label: 'Jenis Straw Pejantan' },
    { name: 'strawId', label: 'ID Pejantan Straw' },
    { name: 'strawBatchId', label: 'ID Batch Straw' },
    { name: 'strawProducer', label: 'Produsen Straw' },
  ];

  return (
    <div className="space-y-6">
      <Button
        variant="default"
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50"
        aria-label="Kembali ke halaman utama"
        onClick={() => router.back()}
      >
        <CornerUpLeft className="h-7 w-7" />
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Catatan Inseminasi Buatan</CardTitle>
          <CardDescription>
            Lihat, cari, dan ekspor semua data inseminasi yang telah tercatat.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-end pt-0">
          <Button onClick={exportToCSV} disabled={isLoading || filteredData.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Unduh Laporan
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
           <div className="flex flex-col sm:flex-row items-center gap-2 pb-4">
              <div className="grid grid-cols-2 gap-2 w-full sm:flex-1">
                  <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
          {isLoading ? <TableSkeleton /> : (
          <ScrollArea className="h-[calc(100vh-480px)] md:h-[calc(100vh-460px)]">
          {/* Mobile View */}
          <div className="md:hidden pr-4">
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

          {/* Desktop View */}
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
          </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Catatan Inseminasi</DialogTitle>
              <DialogDescription>
                Lakukan perubahan pada data yang sudah ada. Klik simpan jika sudah selesai.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4 max-h-[60vh] overflow-y-auto p-1 pr-4">
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
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
                    {formFields.map((formField) => (
                      <FormField
                        key={formField.name}
                        control={form.control}
                        name={formField.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{formField.label}</FormLabel>
                            <FormControl>
                              <Input 
                                  placeholder={`Masukkan ${formField.label.toLowerCase()}`} 
                                  {...field} 
                                  value={field.value || ''}
                                />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
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


      {/* Delete Confirmation Dialog */}
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
