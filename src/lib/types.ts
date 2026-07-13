import { z } from 'zod';

export const InseminationRecordSchema = z.object({
  id: z.string().optional(),
  inseminationDate: z.date({
    required_error: 'Tanggal IB harus diisi.',
  }),
  staffName: z.string().min(2, {
    message: 'Nama petugas harus diisi.',
  }),
  puskeswan: z.string().min(2, {
    message: 'Puskeswan harus diisi.',
  }),
  breederName: z.string().min(2, {
    message: 'Nama peternak harus diisi.',
  }),
  breederAddress: z.string().min(5, {
    message: 'Alamat peternak harus diisi.',
  }),
  phoneNumber: z.string().min(10, {
    message: 'Nomor HP harus valid.',
  }),
  breederId: z
    .string()
    .min(16, {
      message: 'ID Peternak (KTP) harus 16 digit.',
    })
    .max(16, {
      message: 'ID Peternak (KTP) harus 16 digit.',
    }),
  cowType: z.string().min(1, { message: 'Jenis sapi harus diisi.' }),
  cowId: z.string().min(1, { message: 'ID Indukan (Eartag) harus diisi.' }),
  strawType: z.string().min(1, { message: 'Jenis straw harus diisi.' }),
  strawId: z.string().min(1, { message: 'ID pejantan straw harus diisi.' }),
  strawBatchId: z.string().min(1, { message: 'ID batch straw harus diisi.' }),
  strawProducer: z.string().min(1, { message: 'Produsen straw harus diisi.' }),
  createdAt: z.any().optional(),
});

export type InseminationRecord = z.infer<typeof InseminationRecordSchema>;

export const BirthRecordSchema = z.object({
  id: z.string().optional(),
  reportDate: z.date({
    required_error: 'Tanggal laporan harus diisi.',
  }),
  staffName: z.string().min(2, {
    message: 'Nama petugas harus diisi.',
  }),
  puskeswan: z.string().min(2, {
    message: 'Puskeswan harus diisi.',
  }),
  breederName: z.string().min(2, {
    message: 'Nama peternak harus diisi.',
  }),
  breederAddress: z.string().min(2, {
    message: 'Alamat peternak harus diisi.',
  }),
  phoneNumber: z.string().min(10, {
    message: 'Nomor HP harus valid.',
  }),
  breederId: z.string().min(16, {
    message: 'ID Peternak (KTP) harus 16 digit.',
  }).max(16),
  matingType: z.string().min(1, { message: 'Jenis perkawinan harus dipilih.' }),
  createdAt: z.any().optional(),
});

export type BirthRecord = z.infer<typeof BirthRecordSchema>;
