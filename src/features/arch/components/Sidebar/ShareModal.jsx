import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ACCENT, BG, TEXT, TEXT_DIM, CARD_BG, CARD_BORDER, DIVIDER } from '../../constants';

export default function ShareModal({ projectId, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}#/share/${projectId}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return createPortal(
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 14px' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Share diagram</div>
          <div style={{ fontSize: 12, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>
            Anyone with this link can view your diagram (read-only).
          </div>
        </div>

        {/* URL field */}
        <div style={{
          margin: '0 18px', padding: '10px 14px', borderRadius: 10,
          background: BG, border: `1px solid ${DIVIDER}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            flex: 1, fontSize: 12, color: TEXT_DIM,
            fontFamily: "'IBM Plex Mono', monospace",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            userSelect: 'all',
          }}>
            {shareUrl}
          </span>
          <button onClick={handleCopy} style={{
            padding: '6px 16px', borderRadius: 8, border: 'none',
            background: copied ? '#22c55e' : ACCENT,
            color: BG, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Actions */}
        <div style={{
          padding: '16px 18px 18px', display: 'flex', justifyContent: 'flex-end',
          marginTop: 4,
        }}>
          <button onClick={onClose} style={{
            padding: '9px 22px', borderRadius: 8, border: `1px solid ${DIVIDER}`,
            background: 'transparent', color: TEXT_DIM, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
