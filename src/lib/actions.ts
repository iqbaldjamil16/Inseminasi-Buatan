'use server';

import { revalidatePath } from 'next/cache';
import { addDoc, collection, getDocs, query, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { InseminationRecord } from './types';
import { summarizeBreedingProgram } from '@/ai/flows/summarize-breeding-program';

export async function saveInseminationRecord(record: InseminationRecord) {
  try {
    await addDoc(collection(db, 'inseminationRecords'), {
      ...record,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/');
    return { success: true, message: 'Data berhasil disimpan.' };
  } catch (error) {
    console.error('Error saving record: ', error);
    return { success: false, message: 'Gagal menyimpan data.' };
  }
}

export async function getInseminationRecords(): Promise<InseminationRecord[]> {
  try {
    const q = query(collection(db, 'inseminationRecords'), orderBy('inseminationDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const records: InseminationRecord[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({
        id: doc.id,
        ...data,
        inseminationDate: data.inseminationDate.toDate(),
      } as InseminationRecord);
    });
    return records;
  } catch (error) {
    console.error('Error fetching records: ', error);
    return [];
  }
}

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
        `Tanggal: ${r.inseminationDate.toLocaleDateString()}, Peternak: ${
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
