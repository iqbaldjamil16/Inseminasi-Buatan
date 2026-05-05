
'use client';

import React, { useMemo, useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { onAuthStateChanged, signInAnonymously, type Auth, type User } from 'firebase/auth';
import { getFirestore, collection, getDocs, writeBatch, serverTimestamp, doc } from 'firebase/firestore';

// Sample data to seed the database
const sampleData = [
  // --- Puskeswan Topoyo ---
  {
    inseminationDate: new Date('2024-05-10'),
    staffName: 'drh. Iqbal Djamil',
    puskeswan: 'Puskeswan Topoyo',
    breederName: 'Andi Peternak',
    breederAddress: 'Desa Topoyo',
    phoneNumber: '081234567890',
    breederId: '1234567890123456',
    cowType: 'Sapi Brahman',
    cowId: 'TPY-001',
    strawType: 'Sapi Limosin',
    strawId: 'LMSN-01',
    strawBatchId: 'B01-LMSN',
    strawProducer: 'BIB Lembang',
  },
  {
    inseminationDate: new Date('2024-05-15'),
    staffName: 'Alfons B',
    puskeswan: 'Puskeswan Topoyo',
    breederName: 'Budi Daya',
    breederAddress: 'Desa Waeputeh',
    phoneNumber: '081234567891',
    breederId: '1234567890123457',
    cowType: 'Sapi Bali',
    cowId: 'TPY-002',
    strawType: 'Sapi Simental',
    strawId: 'SMTL-02',
    strawBatchId: 'B02-SMTL',
    strawProducer: 'BIB Singosari',
  },
  {
    inseminationDate: new Date('2024-06-02'),
    staffName: 'Haslim',
    puskeswan: 'Puskeswan Topoyo',
    breederName: 'Citra Ternak',
    breederAddress: 'Desa Tabolang',
    phoneNumber: '081234567892',
    breederId: '1234567890123458',
    cowType: 'Sapi Brahman',
    cowId: 'TPY-003',
    strawType: 'Sapi Limosin',
    strawId: 'LMSN-01',
    strawBatchId: 'B01-LMSN',
    strawProducer: 'BIB Lembang',
  },
  // --- Puskeswan Karossa ---
  {
    inseminationDate: new Date('2024-05-20'),
    staffName: 'Asari Rasyid',
    puskeswan: 'Puskeswan Karossa',
    breederName: 'Dedi Makmur',
    breederAddress: 'Desa Karossa',
    phoneNumber: '082345678901',
    breederId: '2345678901234567',
    cowType: 'Sapi Donggala',
    cowId: 'KRS-001',
    strawType: 'Sapi Angus',
    strawId: 'ANGS-03',
    strawBatchId: 'B03-ANGS',
    strawProducer: 'BIB Maros',
  },
  {
    inseminationDate: new Date('2024-06-05'),
    staffName: 'drh. Stephani',
    puskeswan: 'Puskeswan Karossa',
    breederName: 'Eka Farm',
    breederAddress: 'Desa Lara',
    phoneNumber: '082345678902',
    breederId: '2345678901234568',
    cowType: 'Sapi Simental',
    cowId: 'KRS-002',
    strawType: 'Sapi Simental',
    strawId: 'SMTL-02',
    strawBatchId: 'B02-SMTL',
    strawProducer: 'BIB Singosari',
  },
    {
    inseminationDate: new Date('2024-06-10'),
    staffName: 'Basuki',
    puskeswan: 'Puskeswan Karossa',
    breederName: 'Fajar Sentosa',
    breederAddress: 'Desa Kayucalla',
    phoneNumber: '082345678903',
    breederId: '2345678901234569',
    cowType: 'Sapi Bali',
    cowId: 'KRS-003',
    strawType: 'Sapi Limosin',
    strawId: 'LMSN-01',
    strawBatchId: 'B01-LMSN',
    strawProducer: 'BIB Lembang',
  },
  // --- Puskeswan Pangale ---
  {
    inseminationDate: new Date('2024-07-01'),
    staffName: 'drh. Ketut Elok',
    puskeswan: 'Puskeswan Pangale',
    breederName: 'Gita Pertiwi',
    breederAddress: 'Desa Pangale',
    phoneNumber: '083456789012',
    breederId: '3456789012345678',
    cowType: 'Sapi Madura',
    cowId: 'PGL-001',
    strawType: 'Sapi Brahman',
    strawId: 'BRMN-04',
    strawBatchId: 'B04-BRMN',
    strawProducer: 'BIB Maros',
  },
  {
    inseminationDate: new Date('2024-07-08'),
    staffName: 'Mansyur',
    puskeswan: 'Puskeswan Pangale',
    breederName: 'Hari Tani',
    breederAddress: 'Desa Lemo-Lemo',
    phoneNumber: '083456789013',
    breederId: '3456789012345679',
    cowType: 'Sapi Simental',
    cowId: 'PGL-002',
    strawType: 'Sapi Simental',
    strawId: 'SMTL-05',
    strawBatchId: 'B05-SMTL',
    strawProducer: 'BIB Singosari',
  },
];

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    if (firebaseServices.auth) {
      const auth = firebaseServices.auth as Auth;
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setIsAuthReady(true);
        if (!user) {
          signInAnonymously(auth).catch((error) => {
            console.error('Anonymous sign-in failed:', error);
          });
        }
      });
      return () => unsubscribe();
    }
  }, [firebaseServices.auth]);

  useEffect(() => {
    const seedDatabase = async () => {
      // Tunggu hingga user terautentikasi sebelum mencoba baca/tulis Firestore
      if (!firebaseServices.firestore || !currentUser) return;
      
      const db = firebaseServices.firestore;
      const recordsCollectionRef = collection(db, 'inseminationRecords');

      try {
        const querySnapshot = await getDocs(recordsCollectionRef);
        if (querySnapshot.empty) {
          console.log('inseminationRecords collection is empty. Seeding data...');
          const batch = writeBatch(db);
          sampleData.forEach((record) => {
            const docRef = doc(collection(db, 'inseminationRecords'));
            batch.set(docRef, { ...record, createdAt: serverTimestamp() });
          });
          await batch.commit();
          console.log('Sample data seeded successfully.');
        }
      } catch (error) {
        // Abaikan error seeding jika disebabkan oleh aturan keamanan selama transisi auth
        console.error('Error seeding database:', error);
      }
    };

    if (isAuthReady && firebaseServices.firestore && currentUser) {
        if (!(window as any).__hasSeeded) {
            seedDatabase();
            (window as any).__hasSeeded = true;
        }
    }
  }, [isAuthReady, firebaseServices.firestore, currentUser]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
