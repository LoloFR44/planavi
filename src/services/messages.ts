import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
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

export function subscribeToMessages(
  planningId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where('planningId', '==', planningId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message));
  });
}
