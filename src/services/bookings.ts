import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { stripUndefined } from '@/firebase/utils';
import type { Booking, BookingFormData } from '@/types';

const COLLECTION = 'bookings';

export async function createBooking(data: BookingFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), stripUndefined({
    ...data,
    createdAt: Date.now(),
  }));
  return docRef.id;
}

export async function getBookingsForPlanning(planningId: string): Promise<Booking[]> {
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function getBookingsForTimeSlot(timeSlotId: string): Promise<Booking[]> {
  const q = query(
    collection(db, COLLECTION),
    where('timeSlotId', '==', timeSlotId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function deleteBookingsForPlanning(planningId: string): Promise<void> {
  const bookings = await getBookingsForPlanning(planningId);
  const batch = writeBatch(db);
  for (const booking of bookings) {
    batch.delete(doc(db, COLLECTION, booking.id));
  }
  await batch.commit();
}

export function subscribeToBookingsForPlanning(
  planningId: string,
  callback: (bookings: Booking[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Booking)
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(bookings);
    },
    (error) => {
      console.error('Firestore subscription error (bookings):', error);
      callback([]);
    }
  );
}
