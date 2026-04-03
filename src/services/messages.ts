import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { stripUndefined } from '@/firebase/utils';
import type { Message, MessageFormData } from '@/types';

const COLLECTION = 'messages';

export async function createMessage(data: MessageFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), stripUndefined({
    ...data,
    createdAt: Date.now(),
  }));
  return docRef.id;
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function deleteMessagesForPlanning(planningId: string): Promise<void> {
  const q = query(collection(db, COLLECTION), where('planningId', '==', planningId));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  for (const d of snap.docs) {
    batch.delete(doc(db, COLLECTION, d.id));
  }
  await batch.commit();
}

export function subscribeToMessages(
  planningId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const msgs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Message)
        .sort((a, b) => a.createdAt - b.createdAt);
      callback(msgs);
    },
    (error) => {
      console.error('Firestore subscription error (messages):', error);
      callback([]);
    }
  );
}
