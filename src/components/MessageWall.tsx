'use client';

import { useState, useRef, useEffect } from 'react';
import { createMessage } from '@/services/messages';
import { useMessages } from '@/hooks/useMessages';
import type { Message } from '@/types';

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface MessageWallProps {
  planningId: string;
  onDelete?: (id: string) => void;
}

export default function MessageWall({ planningId, onDelete }: MessageWallProps) {
  const { messages, loading } = useMessages(planningId);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSending(true);
    try {
      await createMessage({
        planningId,
        authorName: authorName.trim(),
        content: content.trim(),
      });
      setContent('');
    } catch {
      // silent fail
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">💬 Messages des proches</h2>

      {/* Messages list */}
      <div
        ref={listRef}
        className="space-y-3 max-h-[400px] overflow-y-auto mb-4"
      >
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucun message pour le moment. Soyez le premier à écrire !
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onDelete={onDelete} />
          ))
        )}
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-3">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Votre prénom"
            className="w-32 shrink-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            required
          />
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={sending || !authorName.trim() || !content.trim()}
            className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-40 hover:shadow-md shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
          >
            {sending ? '...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message, onDelete }: { message: Message; onDelete?: (id: string) => void }) {
  return (
    <div className="group flex gap-3 items-start">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
      >
        {message.authorName.charAt(0).toUpperCase()}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-gray-100 rounded-xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900">{message.authorName}</span>
            <span className="text-[11px] text-gray-400">{relativeTime(message.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            className="hidden group-hover:inline-block mt-1 text-[11px] text-red-400 hover:text-red-600"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
