import { useRef, useEffect } from 'react';
import { COMPONENTS, ACCENT, ACCENT_DIM, BG, CARD_BORDER, SURFACE, TEXT_MID } from '../../constants';
import Icon from '../Icon';

export default function AddMenu({ open, onToggle, onAdd }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onToggle(false);
    };
    const t = setTimeout(() => document.addEventListener('pointerdown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('pointerdown', handler); };
  }, [open, onToggle]);

  return (
    <div style={{ position: "absolute", bottom: 28, right: 28, zIndex: 25 }} ref={menuRef}>
      {open && (
        <div data-add-menu="true" style={{
          position: "absolute", bottom: 64, right: 0, width: 300,
          background: "rgba(10,14,10,0.97)", border: `1px solid ${ACCENT}15`, borderRadius: 18,
          backdropFilter: "blur(24px)", boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${ACCENT}05`,
          padding: 14, animation: "scaleIn 0.18s ease-out",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, padding: "0 4px" }}>Add Component</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {COMPONENTS.map((item, i) => (
              <div key={item.type} onClick={() => onAdd(item)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px 10px",
                borderRadius: 12, border: `1px solid ${CARD_BORDER}`, background: SURFACE,
                cursor: "pointer", transition: "all 0.15s", animation: `fadeIn 0.15s ease-out ${i * 0.02}s both`,
              }}
                onPointerEnter={(e) => { e.currentTarget.style.borderColor = `${item.color}40`; e.currentTarget.style.background = `${item.color}0a`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onPointerLeave={(e) => { e.currentTarget.style.borderColor = CARD_BORDER; e.currentTarget.style.background = SURFACE; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Icon path={item.icon} color={item.color} size={22} />
                <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MID, textAlign: "center", lineHeight: 1.15 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => onToggle(!open)} style={{
        width: 56, height: 56, borderRadius: "50%",
        background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
        border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 20px ${ACCENT}40, 0 0 40px ${ACCENT}15`,
        transition: "all 0.25s", transform: open ? "rotate(45deg)" : "rotate(0)",
      }}
        onPointerEnter={(e) => { e.currentTarget.style.transform = open ? "rotate(45deg) scale(1.1)" : "scale(1.1)"; e.currentTarget.style.boxShadow = `0 6px 28px ${ACCENT}55, 0 0 50px ${ACCENT}20`; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = open ? "rotate(45deg)" : "rotate(0)"; e.currentTarget.style.boxShadow = `0 4px 20px ${ACCENT}40, 0 0 40px ${ACCENT}15`; }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke={BG} strokeWidth="2.5" strokeLinecap="round" fill="none" /></svg>
      </button>
    </div>
  );
}
