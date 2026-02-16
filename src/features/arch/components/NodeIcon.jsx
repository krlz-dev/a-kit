export default function NodeIcon({ icon, iconUrl, color, size = 22 }) {
  if (iconUrl) {
    return <img src={iconUrl} alt="" width={size} height={size}
                style={{ objectFit: 'contain', pointerEvents: 'none' }}
                loading="lazy" draggable={false} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={icon} fill={color} />
    </svg>
  );
}
