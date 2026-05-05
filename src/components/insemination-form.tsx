'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord } from '@/lib/types';
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
import { Loader2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { addDocumentNonBlocking, useFirestore } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export function InseminationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<InseminationRecord>({
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

  const watchPuskeswan = form.watch('puskeswan');
  const watchBreederAddress = form.watch('breederAddress');
  const watchStaffName = form.watch('staffName');
  const watchCowType = form.watch('cowType');
  const watchStrawType = form.watch('strawType');
  const watchStrawProducer = form.watch('strawProducer');


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


  React.useEffect(() => {
    const puskeswanVillageMap: Record<string, string[]> = {
      'Puskeswan Topoyo': topoyoVillages,
      'Puskeswan Tobadak': tobadakVillages,
      'Puskeswan Pangale': pangaleVillages,
      'Puskeswan Budong-Budong': budongBudongVillages,
      'Puskeswan Karossa': karossaVillages,
    };
    const selectedVillages = puskeswanVillageMap[watchPuskeswan];

    const allVillages = [
      ...topoyoVillages, 
      ...tobadakVillages, 
      ...pangaleVillages, 
      ...budongBudongVillages,
      ...karossaVillages
    ];

    if (!selectedVillages && watchBreederAddress) {
      if (allVillages.includes(watchBreederAddress)) {
         form.setValue('breederAddress', '');
      }
    } else if (selectedVillages && watchBreederAddress && !selectedVillages.includes(watchBreederAddress) && watchBreederAddress !== 'Lainnya') {
       form.setValue('breederAddress', '');
    }
  }, [watchPuskeswan, watchBreederAddress, form]);

  React.useEffect(() => {
    const staffMap: Record<string, string[]> = {
        'Puskeswan Budong-Budong': budongBudongStaff,
        'Puskeswan Karossa': karossaStaff,
        'Puskeswan Pangale': pangaleStaff,
        'Puskeswan Tobadak': tobadakStaff,
        'Puskeswan Topoyo': topoyoStaff,
    };
    const allowedStaff = staffMap[watchPuskeswan];
    
    if (!allowedStaff) {
      const allSpecificStaff = [...budongBudongStaff, ...karossaStaff, ...pangaleStaff, ...tobadakStaff, ...topoyoStaff, 'Lainnya'];
      if (allSpecificStaff.includes(watchStaffName)) {
        form.setValue('staffName', '');
      }
    } else {
      if (watchStaffName && !allowedStaff.includes(watchStaffName) && watchStaffName !== 'Lainnya') {
        form.setValue('staffName', '');
      }
    }
  }, [watchPuskeswan, watchStaffName, form]);

  async function onSubmit(data: InseminationRecord) {
    if (!firestore) {
      toast({
        title: 'Error',
        description: 'Koneksi database tidak tersedia.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const collectionRef = collection(firestore, 'inseminationRecords');
      addDocumentNonBlocking(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Sukses',
        description: 'Data berhasil disimpan.',
      });
      form.reset();
      router.push('/records');
    } catch (error) {
      console.error('Error saving record: ', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
  
  const getVillageOptions = () => {
    switch (watchPuskeswan) {
        case 'Puskeswan Topoyo':
            return topoyoVillages;
        case 'Puskeswan Tobadak':
            return tobadakVillages;
        case 'Puskeswan Pangale':
            return pangaleVillages;
        case 'Puskeswan Budong-Budong':
            return budongBudongVillages;
        case 'Puskeswan Karossa':
            return karossaVillages;
        default:
            return [];
    }
  };

  const getStaffOptions = () => {
    switch (watchPuskeswan) {
      case 'Puskeswan Budong-Budong':
        return budongBudongStaff;
      case 'Puskeswan Karossa':
        return karossaStaff;
      case 'Puskeswan Pangale':
        return pangaleStaff;
      case 'Puskeswan Tobadak':
        return tobadakStaff;
      case 'Puskeswan Topoyo':
        return topoyoStaff;
      default:
        return [];
    }
  };
  
  const villageOptions = getVillageOptions();
  const staffOptions = getStaffOptions();

  const showVillageDropdown = [
      'Puskeswan Topoyo', 
      'Puskeswan Tobadak', 
      'Puskeswan Pangale', 
      'Puskeswan Budong-Budong',
      'Puskeswan Karossa'
    ].includes(watchPuskeswan);
  const isOtherAddress = showVillageDropdown && watchBreederAddress === 'Lainnya';
  
  const showStaffDropdown = ['Puskeswan Budong-Budong', 'Puskeswan Karossa', 'Puskeswan Pangale', 'Puskeswan Tobadak', 'Puskeswan Topoyo'].includes(watchPuskeswan);
  const isOtherStaff = showStaffDropdown && watchStaffName === 'Lainnya';
  const isOtherCowType = watchCowType === 'Lainnya';
  const isOtherStrawType = watchStrawType === 'Lainnya';
  const isOtherStrawProducer = watchStrawProducer === 'Lainnya';

  const formFields = [
    { name: 'breederName', label: 'Nama Peternak' },
    { name: 'phoneNumber', label: 'Nomor HP' },
    { name: 'breederId', label: 'ID Peternak (KTP)' },
    { name: 'cowId', label: 'ID Indukan (Eartag)' },
    { name: 'strawId', label: 'ID Pejantan Straw' },
    { name: 'strawBatchId', label: 'ID Batch Straw' },
  ] as const;

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://inseminasibuatan.vercel.app/');
    toast({
      title: 'Tersalin',
      description: 'Link telah disalin ke papan klip.',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader className="relative">
            <CardTitle>Input Data Inseminasi Buatan</CardTitle>
            <CardDescription>
              Input detail pelayanan inseminasi buatan yang telah dilakukan.
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-blue-600 italic text-sm">https://inseminasibuatan.vercel.app/</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4 flex flex-col justify-center">
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
                      onChange={(e) => {
                        field.onChange(e.target.valueAsDate);
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="puskeswan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puskeswan</FormLabel>
                  <Select onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('breederAddress', '');
                      form.setValue('staffName', '');
                    }} defaultValue={field.value}>
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
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="staffName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Petugas</FormLabel>
                  {showStaffDropdown ? (
                     <>
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
                       {isOtherStaff && (
                         <FormControl className="mt-2">
                           <Input 
                             placeholder="Masukkan nama petugas" 
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
          </Card>

          <Card className="p-4 flex flex-col justify-center">
             <FormField
                control={form.control}
                name="breederAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Peternak</FormLabel>
                    {showVillageDropdown ? (
                      <>
                        <Select onValueChange={field.onChange} value={field.value}>
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
          </Card>

          {formFields.slice(0, 3).map((formField) => (
            <Card key={formField.name} className="p-4 flex flex-col justify-center">
              <FormField
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Masukkan ${formField.label.toLowerCase()}`} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}

          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="cowType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Sapi Indukan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="cowId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Indukan (Eartag)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan id indukan (eartag)" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="strawType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Straw Pejantan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          {formFields.slice(4).map((formField) => (
            <Card key={formField.name} className="p-4 flex flex-col justify-center">
              <FormField
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Masukkan ${formField.label.toLowerCase()}`} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}
          
          <Card className="p-4 flex flex-col justify-center">
            <FormField
              control={form.control}
              name="strawProducer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produsen Straw</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
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
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </div>
        <CardFooter className="flex flex-col items-end gap-4 px-0 pt-6">
          <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Data
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
