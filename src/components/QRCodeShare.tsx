'use client';

import { useState } from 'react';

interface QRCodeShareProps {
  url: string;
  title?: string;
}

export default function QRCodeShare({ url, title }: QRCodeShareProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1e3a8a] bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Partager (QR Code)
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          {title || 'Partagez ce planning'}
        </h3>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* QR Code */}
        <div className="bg-white p-2 border border-gray-100 rounded-lg">
          <img
            src={qrUrl}
            alt="QR Code du planning"
            width={150}
            height={150}
            className="block"
          />
        </div>

        {/* URL + actions */}
        <div className="flex-1 space-y-2 w-full">
          <p className="text-xs text-gray-500">
            Scannez le QR code ou partagez le lien :
          </p>
          <div className="flex gap-1.5">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all shrink-0"
              style={{ background: copied ? '#3db54a' : 'linear-gradient(135deg, #1e3a8a, #3db54a)' }}
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <div className="flex gap-2 pt-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Réservez votre visite : ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Planning de visites')}&body=${encodeURIComponent(`Bonjour,\n\nVoici le lien pour réserver une visite :\n${url}\n\nÀ bientôt !`)}`}
              className="text-xs text-[#1e3a8a] hover:underline"
            >
              Email
            </a>
            <a
              href={`sms:?body=${encodeURIComponent(`Réservez votre visite : ${url}`)}`}
              className="text-xs text-gray-600 hover:underline"
            >
              SMS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
