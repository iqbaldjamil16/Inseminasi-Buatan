import { z } from 'zod';

export const InseminationRecordSchema = z.object({
  id: z.string().optional(),
  inseminationDate: z.date({
    required_error: 'Tanggal IB harus diisi.',
  }),
  staffName: z.string().min(2, {
    message: 'Nama petugas harus diisi.',
  }),
  staffNameOther: z.string().optional(),
  puskeswan: z.string().min(2, {
    message: 'Puskeswan harus diisi.',
  }),
  breederName: z.string().min(2, {
    message: 'Nama peternak harus diisi.',
  }),
  breederAddress: z.string().min(2, {
    message: 'Alamat peternak harus diisi.',
  }),
  breederAddressOther: z.string().optional(),
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
  cowTypeOther: z.string().optional(),
  cowId: z.string().min(1, { message: 'ID Indukan (Eartag) harus diisi.' }),
  strawType: z.string().min(1, { message: 'Jenis straw harus diisi.' }),
  strawTypeOther: z.string().optional(),
  strawId: z.string().min(1, { message: 'ID pejantan straw harus diisi.' }),
  strawBatchId: z.string().min(1, { message: 'ID batch straw harus diisi.' }),
  strawProducer: z.string().min(1, { message: 'Produsen straw harus diisi.' }),
  servicePhoto: z.string().optional(),
  googleDriveLink: z.string().optional(),
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
  staffNameOther: z.string().optional(),
  puskeswan: z.string().min(2, {
    message: 'Puskeswan harus diisi.',
  }),
  breederName: z.string().min(2, {
    message: 'Nama peternak harus diisi.',
  }),
  breederAddress: z.string().min(2, {
    message: 'Alamat peternak harus diisi.',
  }),
  breederAddressOther: z.string().optional(),
  phoneNumber: z.string().optional(),
  breederId: z.string().min(2, {
    message: 'Identitas peternak (KTP/HP) harus diisi.',
  }),
  matingType: z.string().min(1, { message: 'Jenis perkawinan harus dipilih.' }),
  cowType: z.string().optional(),
  cowTypeOther: z.string().optional(),
  cowEartag: z.string().optional(),
  bullType: z.string().optional(),
  bullTypeOther: z.string().optional(),
  bullEartag: z.string().optional(),
  strawId: z.string().optional(),
  strawBatchId: z.string().optional(),
  strawProducer: z.string().optional(),
  birthDate: z.date().optional(),
  children: z.array(z.object({
    gender: z.string().min(1, "Pilih jenis kelamin"),
    count: z.string().min(1, "Jumlah harus diisi"),
  })).min(1),
  servicePhoto: z.string().optional(),
  googleDriveLink: z.string().optional(),
  createdAt: z.any().optional(),
});

export type BirthRecord = z.infer<typeof BirthRecordSchema>;
