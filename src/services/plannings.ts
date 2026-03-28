import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { stripUndefined } from '@/firebase/utils';
import type { Planning, PlanningFormData } from '@/types';

const COLLECTION = 'plannings';

export async function createPlanning(data: PlanningFormData): Promise<string> {
  const existing = await getPlanningBySlug(data.slug);
  if (existing) throw new Error('Ce slug est déjà utilisé');

  const now = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION), stripUndefined({
    ...data,
    createdAt: now,
    updatedAt: now,
  }));
  return docRef.id;
}

export async function getPlanningById(id: string): Promise<Planning | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Planning;
}

export async function getPlanningBySlug(slug: string): Promise<Planning | null> {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Planning;
}

export async function getAllPlannings(): Promise<Planning[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Planning);
}

export async function updatePlanning(id: string, data: Partial<PlanningFormData>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), stripUndefined({ ...data, updatedAt: Date.now() }));
}

export async function deletePlanning(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function subscribeToPlannings(callback: (plannings: Planning[]) => void): Unsubscribe {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Planning));
  });
}

export function subscribeToPlanningBySlug(
  slug: string,
  callback: (planning: Planning | null) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
    } else {
      const d = snap.docs[0];
      callback({ id: d.id, ...d.data() } as Planning);
    }
  });
}
