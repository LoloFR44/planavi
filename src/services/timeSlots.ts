import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
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
import type { TimeSlot, TimeSlotFormData } from '@/types';

const COLLECTION = 'timeSlots';

export async function createTimeSlot(data: TimeSlotFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), stripUndefined({
    ...data,
    createdAt: Date.now(),
  }));
  return docRef.id;
}

export async function bulkCreateTimeSlots(slots: TimeSlotFormData[]): Promise<void> {
  const batch = writeBatch(db);
  for (const slot of slots) {
    const ref = doc(collection(db, COLLECTION));
    batch.set(ref, stripUndefined({ ...slot, createdAt: Date.now() }));
  }
  await batch.commit();
}

export async function getTimeSlotsForPlanning(planningId: string): Promise<TimeSlot[]> {
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as TimeSlot)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

export async function updateTimeSlot(id: string, data: Partial<TimeSlotFormData>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), stripUndefined(data as Record<string, unknown>));
}

export async function deleteTimeSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function bulkDeleteTimeSlots(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.delete(doc(db, COLLECTION, id));
  }
  await batch.commit();
}

export async function deleteTimeSlotsForPlanning(planningId: string): Promise<void> {
  const slots = await getTimeSlotsForPlanning(planningId);
  const batch = writeBatch(db);
  for (const slot of slots) {
    batch.delete(doc(db, COLLECTION, slot.id));
  }
  await batch.commit();
}

export function subscribeToTimeSlots(
  planningId: string,
  callback: (slots: TimeSlot[]) => void
): Unsubscribe {
  // Use simple where query without orderBy to avoid requiring a composite index.
  // Sort client-side instead.
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const slots = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as TimeSlot)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      callback(slots);
    },
    (error) => {
      console.error('Firestore subscription error (timeSlots):', error);
      callback([]);
    }
  );
}
