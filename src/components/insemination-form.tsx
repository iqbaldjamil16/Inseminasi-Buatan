'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InseminationRecordSchema, type InseminationRecord } from '@/lib/types';
import { saveInseminationRecord } from '@/lib/actions';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export function InseminationForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
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
    setIsSubmitting(true);
    const result = await saveInseminationRecord(data);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Sukses',
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
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
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal IB</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy')
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
