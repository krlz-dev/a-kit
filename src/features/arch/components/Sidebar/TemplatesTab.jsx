import { useState } from 'react';
import { TEXT, TEXT_DIM, TEMPLATES } from '../../constants';
import TemplatePreviewModal from './TemplatePreviewModal';

export default function TemplatesTab({ onLoadTemplate, nodes }) {
  const [previewTpl, setPreviewTpl] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Presets</div>
      {TEMPLATES.map((tpl, i) => (
        <div key={i} className="template-card" onClick={() => setPreviewTpl(tpl)}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{tpl.name}</div>
          <div style={{ fontSize: 10, color: TEXT_DIM, fontFamily: "'IBM Plex Mono', monospace" }}>{tpl.desc}</div>
        </div>
      ))}

      {previewTpl && (
        <TemplatePreviewModal
          template={previewTpl}
          nodeCount={nodes ? nodes.length : 0}
          onConfirm={() => { onLoadTemplate(previewTpl); setPreviewTpl(null); }}
          onClose={() => setPreviewTpl(null)}
        />
      )}
    </div>
  );
}
