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
import { Loader2 } from 'lucide-react';
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

  const formFields = [
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
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Data Inseminasi Buatan</CardTitle>
            <CardDescription>
              Masukkan detail pelayanan inseminasi buatan yang telah dilakukan.
            </CardDescription>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          {formFields.map((formField) => (
            <Card key={formField.name} className="p-4 flex flex-col justify-center">
              <FormField
                control={form.control}
                name={formField.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formField.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Masukkan ${formField.label.toLowerCase()}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}
        </div>
        <CardFooter className="flex justify-end px-0">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Data
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
