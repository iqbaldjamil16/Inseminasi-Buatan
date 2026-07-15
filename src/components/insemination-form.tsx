'use client';

import React, { useRef, useMemo } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
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
import { Loader2, Copy, Baby, Beef, CalendarIcon, Plus, Trash2, Image as ImageIcon, Upload, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Master Data
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

const staffMap: Record<string, string[]> = {
  'Puskeswan Budong-Budong': budongBudongStaff,
  'Puskeswan Karossa': karossaStaff,
  'Puskeswan Pangale': pangaleStaff,
  'Puskeswan Tobadak': tobadakStaff,
  'Puskeswan Topoyo': topoyoStaff,
};

const villageMap: Record<string, string[]> = {
  'Puskeswan Budong-Budong': budongBudongVillages,
  'Puskeswan Karossa': karossaVillages,
  'Puskeswan Pangale': pangaleVillages,
  'Puskeswan Tobadak': tobadakVillages,
  'Puskeswan Topoyo': topoyoVillages,
};

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
      servicePhoto: '',
      googleDriveLink: '',
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
      cowType: '',
      cowEartag: '',
      bullType: '',
      bullEartag: '',
      strawId: '',
      strawBatchId: '',
      strawProducer: '',
      children: [{ gender: '', count: '1' }],
      servicePhoto: '',
      googleDriveLink: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: formKelahiran.control,
    name: "children",
  });

  const watchPuskeswanInseminasi = formInseminasi.watch('puskeswan');
  const watchPuskeswanKelahiran = formKelahiran.watch('puskeswan');
  const watchMatingType = formKelahiran.watch('matingType');

  const staffOptionsInseminasi = useMemo(() => staffMap[watchPuskeswanInseminasi] || [], [watchPuskeswanInseminasi]);
  const villageOptionsInseminasi = useMemo(() => villageMap[watchPuskeswanInseminasi] || [], [watchPuskeswanInseminasi]);
  
  const staffOptionsKelahiran = useMemo(() => staffMap[watchPuskeswanKelahiran] || [], [watchPuskeswanKelahiran]);
  const villageOptionsKelahiran = useMemo(() => villageMap[watchPuskeswanKelahiran] || [], [watchPuskeswanKelahiran]);

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
          <CardTitle>Input Data Inseminasi Dan Kelahiran Ternak</CardTitle>
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
              className="flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm flex items-center gap-2"
            >
              <Beef className="h-4 w-4" />
              Inseminasi
            </TabsTrigger>
            <TabsTrigger 
              value="kelahiran" 
              className="flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all duration-300"
            >
              <Baby className="h-4 w-4" />
              Kelahiran
            </TabsTrigger>
          </TabsList>
        </Card>

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
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          formInseminasi.setValue('staffName', '');
                          formInseminasi.setValue('breederAddress', '');
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Puskeswan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {puskeswanOptions.map((option) => (
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchPuskeswanInseminasi}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Petugas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staffOptionsInseminasi.map((staff) => (
                              <SelectItem key={staff} value={staff}>{staff}</SelectItem>
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
                      name="breederAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat Peternak (Desa)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchPuskeswanInseminasi}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Desa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {villageOptionsInseminasi.map((village) => (
                                <SelectItem key={village} value={village}>{village}</SelectItem>
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

              <PhotoUploadCard form={formInseminasi} />

              <CardFooter className="px-0 pt-2 flex justify-end">
                <Button type="submit" disabled={isSubmittingInseminasi} className="w-full md:w-auto">
                    {isSubmittingInseminasi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Data Inseminasi
                </Button>
              </CardFooter>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="kelahiran" className="mt-6">
          <Form {...formKelahiran}>
            <form onSubmit={formKelahiran.handleSubmit(onSubmitKelahiran)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
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
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            formKelahiran.setValue('staffName', '');
                            formKelahiran.setValue('breederAddress', '');
                          }} value={field.value}>
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
                  </CardContent>
                </Card>

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
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchPuskeswanKelahiran}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Petugas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staffOptionsKelahiran.map((staff) => (
                                <SelectItem key={staff} value={staff}>{staff}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

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

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Identitas Peternak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="breederId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="KTP / No. HP / Keduanya" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alamat Peternak (Desa)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={formKelahiran.control}
                      name="breederAddress"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchPuskeswanKelahiran}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Desa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {villageOptionsKelahiran.map((village) => (
                                <SelectItem key={village} value={village}>{village}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

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

                {watchMatingType && (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Data Indukan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={formKelahiran.control}
                          name="cowType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Jenis Indukan</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan jenis sapi indukan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formKelahiran.control}
                          name="cowEartag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">No. Eartag Indukan</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nomor eartag indukan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Data Pejantan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={formKelahiran.control}
                          name="bullType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Jenis Pejantan</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan jenis sapi pejantan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formKelahiran.control}
                          name="bullEartag"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">No. Eartag Pejantan</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nomor eartag pejantan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {watchMatingType === 'Inseminasi Buatan' && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Detail Straw IB</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={formKelahiran.control}
                            name="strawId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Id Straw Pejantan</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan ID straw" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={formKelahiran.control}
                            name="strawBatchId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Id Batch Straw</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan batch ID" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={formKelahiran.control}
                            name="strawProducer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Produsen Straw</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan produsen" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm font-medium">
                          Tanggal Lahir Anak
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={formKelahiran.control}
                          name="birthDate"
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

                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium">Data Anakan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 relative">
                        {fields.map((field, index) => (
                           <div key={field.id} className="space-y-4 pt-4 first:pt-0 border-t first:border-t-0 relative">
                               <div className="flex justify-end items-center mb-2">
                                   {fields.length > 1 && (
                                       <Button 
                                           type="button" 
                                           variant="ghost" 
                                           size="icon" 
                                           className="h-6 w-6 text-destructive"
                                           onClick={() => remove(index)}
                                       >
                                           <Trash2 className="h-4 w-4" />
                                       </Button>
                                   )}
                               </div>
                               <FormField
                                  control={formKelahiran.control}
                                  name={`children.${index}.gender`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Jenis Kelamin</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Kelamin" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Jantan">Jantan</SelectItem>
                                          <SelectItem value="Betina">Betina</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={formKelahiran.control}
                                  name={`children.${index}.count`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">Jumlah Anakan</FormLabel>
                                      <FormControl>
                                        <Input type="number" placeholder="1" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                           </div>
                        ))}
                        <div className="flex justify-end pt-2">
                             <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="rounded-full h-8 w-8 shadow-sm hover:bg-accent"
                                onClick={() => append({ gender: '', count: '1' })}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

              </div>

              <PhotoUploadCard form={formKelahiran} />

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

function PhotoUploadCard({ form }: { form: UseFormReturn<any> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const photo = form.watch('servicePhoto');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast({
        title: 'File Terlalu Besar',
        description: 'Ukuran foto maksimal adalah 500KB.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue('servicePhoto', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-4 md:p-6 overflow-hidden">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold">Upload Foto Pelayanan</span>
            <span className="text-xs text-muted-foreground italic">(Opsional, Maks 500KB)</span>
          </div>
          <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/20 space-y-4">
            {photo ? (
               <div className="relative group">
                 <img src={photo} className="max-h-48 rounded shadow-sm border" alt="Pratinjau Foto" />
                 <Button 
                    type="button"
                    variant="destructive" 
                    size="icon" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => form.setValue('servicePhoto', '')}
                 >
                    <Trash2 className="h-3 w-3" />
                 </Button>
               </div>
            ) : (
               <div className="flex flex-col items-center space-y-2 text-center">
                 <ImageIcon className="h-14 w-14 text-muted-foreground/50" />
                 <p className="text-sm text-muted-foreground">Belum ada foto yang diunggah</p>
               </div>
            )}
            <Button 
                variant="secondary" 
                size="sm" 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-muted shadow-sm border"
            >
              <Upload className="h-4 w-4 mr-2" />
              Pilih Foto
            </Button>
            <input 
                type="file" 
                ref={fileInputRef} 
                hidden 
                accept="image/*" 
                onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Link Google Drive</span>
            <span className="text-xs text-muted-foreground italic">(Opsional)</span>
          </div>
          <FormField
            control={form.control}
            name="googleDriveLink"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormControl>
                  <Input 
                    placeholder="https://drive.google.com/..." 
                    className="bg-muted/30 border-muted-foreground/20 italic text-muted-foreground placeholder:text-muted-foreground/50"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
}
