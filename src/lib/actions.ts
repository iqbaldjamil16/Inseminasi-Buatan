'use server';

import { revalidatePath } from 'next/cache';
import type { InseminationRecord } from './types';
import { summarizeBreedingProgram } from '@/ai/flows/summarize-breeding-program';

export async function getAiSummary(records: InseminationRecord[]) {
  if (records.length === 0) {
    return {
      summary: 'Tidak ada data.',
      advice: 'Silakan masukkan beberapa catatan inseminasi terlebih dahulu untuk mendapatkan ringkasan dan saran dari AI.',
    };
  }

  const breedingRecordsString = records
    .map(
      (r) =>
        `Tanggal: ${new Date(r.inseminationDate).toLocaleDateString()}, Peternak: ${
          r.breederName
        }, Sapi: ${r.cowId} (${r.cowType}), Pejantan: ${r.strawId} (${
          r.strawType
        }), Petugas: ${r.staffName}`
    )
    .join('\n');

  try {
    const result = await summarizeBreedingProgram({
      breedingRecords: breedingRecordsString,
    });
    return result;
  } catch (error) {
    console.error('Error getting AI summary: ', error);
    return {
      summary: 'Gagal menghasilkan ringkasan.',
      advice: 'Terjadi kesalahan saat berkomunikasi dengan AI. Silakan coba lagi nanti.',
    };
  }
}

export async function revalidateRecords() {
  revalidatePath('/records');
  revalidatePath('/summary');
}
