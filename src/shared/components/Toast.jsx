import { ACCENT } from '../constants';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "rgba(14,20,14,0.95)", border: `1px solid ${ACCENT}25`, borderRadius: 12,
      padding: "8px 22px", fontSize: 12.5, fontWeight: 600, color: ACCENT,
      animation: "toastSlide 0.2s ease-out", zIndex: 60,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
    }}>{message}</div>
  );
}
