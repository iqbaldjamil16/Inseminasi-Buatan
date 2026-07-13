'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Copy, Baby, Beef, CalendarIcon, Plus, Trash2 } from 'lucide-react';
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
      cowType: '',
      cowEartag: '',
      bullType: '',
      bullEartag: '',
      children: [{ gender: '', count: '1' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: formKelahiran.control,
    name: "children",
  });

  const watchMatingType = formKelahiran.watch('matingType');

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

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-primary" />
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
