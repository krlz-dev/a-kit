const S = {
  handle: {
    position: 'absolute', top: 0, right: 0, width: 6, height: '100%',
    cursor: 'ew-resize', background: 'transparent', zIndex: 10,
    transition: 'background 0.2s',
  },
};

export default function SidebarResizeHandle({ onMouseDown }) {
  return (
    <div
      style={S.handle}
      onMouseDown={onMouseDown}
      onMouseEnter={e => { e.currentTarget.style.background = '#c8e600'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    />
  );
}
