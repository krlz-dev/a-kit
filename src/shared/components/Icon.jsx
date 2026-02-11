export default function Icon({ path, color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d={path} fill={color} />
    </svg>
  );
}
