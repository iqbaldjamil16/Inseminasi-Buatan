'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord, BirthRecordSchema, type BirthRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2, Copy, Baby, Beef, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function InseminationForm() {
  const [isSubmittingInseminasi, setIsSubmittingInseminasi] = React.useState(false);
  const [isSubmittingKelahiran, setIsSubmittingKelahiran] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  // Form for Inseminasi
  const formInseminasi = useForm<InseminationRecord>({
    resolver: zodResolver(InseminationRecordSchema),
    defaultValues: {
      staffName: '',
      puskeswan: '',
      breederName: '',
      breederAddress: '',
      phoneNumber: '',
      breederId: '',
      cowType: '',
      cowId: '',
      strawType: '',
      strawId: '',
      strawBatchId: '',
      strawProducer: '',
    },
  });

  // Form for Kelahiran
  const formKelahiran = useForm<BirthRecord>({
    resolver: zodResolver(BirthRecordSchema),
    defaultValues: {
      staffName: '',
      puskeswan: '',
      breederName: '',
      breederAddress: '',
      phoneNumber: '',
      breederId: '',
      matingType: '',
    },
  });

  const watchPuskeswanInseminasi = formInseminasi.watch('puskeswan');
  const watchPuskeswanKelahiran = formKelahiran.watch('puskeswan');

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

  async function onSubmitInseminasi(data: InseminationRecord) {
    if (!firestore) return;
    setIsSubmittingInseminasi(true);
    try {
      const collectionRef = collection(firestore, 'inseminationRecords');
      addDocumentNonBlocking(collectionRef, { ...data, createdAt: serverTimestamp() });
      toast({ title: 'Sukses', description: 'Data Inseminasi berhasil disimpan.' });
      formInseminasi.reset();
      router.push('/records');
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data.', variant: 'destructive' });
    } finally {
      setIsSubmittingInseminasi(false);
    }
  }

  async function onSubmitKelahiran(data: BirthRecord) {
    if (!firestore) return;
    setIsSubmittingKelahiran(true);
    try {
      const collectionRef = collection(firestore, 'birthRecords');
      addDocumentNonBlocking(collectionRef, { ...data, createdAt: serverTimestamp() });
      toast({ title: 'Sukses', description: 'Data Kelahiran berhasil disimpan.' });
      formKelahiran.reset();
      router.push('/records');
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data.', variant: 'destructive' });
    } finally {
      setIsSubmittingKelahiran(false);
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://inseminasibuatan.vercel.app/');
    toast({ title: 'Tersalin', description: 'Link telah disalin ke papan klip.' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <CardTitle>Aplikasi IB-Pro</CardTitle>
          <CardDescription>
            Input detail pelayanan inseminasi buatan dan kelahiran ternak.
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-blue-600 italic text-sm">https://inseminasibuatan.vercel.app/</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-black hover:bg-black/10"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="inseminasi" className="w-full">
        <Card className="p-1">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50">
            <TabsTrigger 
              value="inseminasi" 
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Beef className="h-4 w-4" />
              Inseminasi
            </TabsTrigger>
            <TabsTrigger 
              value="kelahiran" 
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Baby className="h-4 w-4" />
              Kelahiran
            </TabsTrigger>
          </TabsList>
        </Card>

        {/* TAB INSEMINASI - STRUKTUR ASLI TETAP TERJAGA */}
        <TabsContent value="inseminasi" className="mt-6">
          <Form {...formInseminasi}>
            <form onSubmit={formInseminasi.handleSubmit(onSubmitInseminasi)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
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
                </Card>
                
                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="puskeswan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puskeswan</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Puskeswan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['Puskeswan Budong-Budong', 'Puskeswan Karossa', 'Puskeswan Pangale', 'Puskeswan Tobadak', 'Puskeswan Topoyo'].map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="staffName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Petugas</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama petugas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                   <FormField
                      control={formInseminasi.control}
                      name="breederAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat Peternak</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan alamat lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="breederName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Peternak</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama peternak" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor HP</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nomor HP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="breederId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Peternak (KTP)</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan 16 digit KTP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="cowType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Sapi Indukan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan jenis sapi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
                
                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="cowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Indukan (Eartag)</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan id eartag" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="strawType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Straw Pejantan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan jenis straw" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="strawId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Pejantan Straw</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan id straw" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="strawBatchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Batch Straw</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan batch id" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>

                <Card className="p-4 flex flex-col justify-center">
                  <FormField
                    control={formInseminasi.control}
                    name="strawProducer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Produsen Straw</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan produsen" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </div>
              <CardFooter className="px-0 pt-2 flex justify-end">
                <Button type="submit" disabled={isSubmittingInseminasi}>
                    {isSubmittingInseminasi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data Inseminasi
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>

        {/* TAB KELAHIRAN - DIKEMBANGKAN KHUSUS DENGAN CARD PER KOLOM */}
        <TabsContent value="kelahiran" className="mt-6">
          <Form {...formKelahiran}>
            <form onSubmit={formKelahiran.handleSubmit(onSubmitKelahiran)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Tanggal Laporan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      Tanggal Laporan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="reportDate"
                      render={({ field }) => (
                        <FormItem>
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
                  </CardContent>
                </Card>

                {/* 2. Puskeswan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Puskeswan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="puskeswan"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Puskeswan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {['Puskeswan Budong-Budong', 'Puskeswan Karossa', 'Puskeswan Pangale', 'Puskeswan Tobadak', 'Puskeswan Topoyo'].map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 3. Nama Petugas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nama Petugas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="staffName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Masukkan nama petugas" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 4. Nama Peternak */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nama Peternak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="breederName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Masukkan nama peternak" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 5. Identitas Peternak (KTP/No.HP) */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Identitas Peternak</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <FormField
                      control={formKelahiran.control}
                      name="breederId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Nomor KTP (16 Digit)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formKelahiran.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Nomor HP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 6. Alamat */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alamat Peternak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="breederAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Masukkan alamat lengkap / Desa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* 7. Jenis Perkawinan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Jenis Perkawinan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="matingType"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Perkawinan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Kawin Alam">Kawin Alam</SelectItem>
                              <SelectItem value="Inseminasi Buatan">Inseminasi Buatan (IB)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

              </div>
              <CardFooter className="px-0 flex justify-end">
                <Button type="submit" disabled={isSubmittingKelahiran} className="w-full md:w-auto">
                    {isSubmittingKelahiran && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data Kelahiran
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
