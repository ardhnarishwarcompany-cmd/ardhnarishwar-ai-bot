import { DEFAULT_DESIGN, FONT_LABELS, PRESETS, withDefaults } from './letterDesign';

// Colour picker + hex box. `fallback` is what is shown while the value is
// empty (empty = "automatic", e.g. follow the company accent colour).
function ColorField({ label, value, fallback, onChange, hint }) {
  const shown = value || fallback || '#000000';
  return (
    <div>
      <label>{label}</label>
      <div className="lt-color">
        <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(shown) ? shown : '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value || ''} placeholder={hint || 'Auto'} maxLength={7} onChange={(e) => onChange(e.target.value)} />
        {value ? <button type="button" onClick={() => onChange('')}>Auto</button> : null}
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => <option key={v} value={v}>{text}</option>)}
      </select>
    </div>
  );
}

function Range({ label, value, min, max, step = 1, unit = '', onChange }) {
  return (
    <div>
      <label>{label}</label>
      <div className="lt-range">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <output>{value}{unit}</output>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="lt-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {label}
    </label>
  );
}

/**
 * Design controls for one letter template. `design` is the template's stored
 * design (may be null/partial); `onChange` receives the complete new object.
 */
export default function DesignPanel({ design, company, onChange, onApplyAll, canApplyAll }) {
  const d = withDefaults(design);
  const set = (patch) => onChange({ ...d, ...patch });
  const accent = company?.accentColor || '#281b3d';

  const applyPreset = (p) => onChange({ ...DEFAULT_DESIGN, ...p.design });

  return (
    <details className="lt-design" open>
      <summary>🎨 Letter design — colours, header, footer &amp; borders</summary>
      <div className="lt-design-body">
        <div className="lt-sec">Quick styles</div>
        <div className="lt-presets">
          {PRESETS.map((p) => (
            <button type="button" key={p.id} className="lt-preset" onClick={() => applyPreset(p)}>
              <span className="lt-preset-bar"><i style={{ background: p.swatch[0] }} /><i style={{ background: p.swatch[1] }} /></span>
              {p.name}
            </button>
          ))}
        </div>
        <p className="lt-muted" style={{ margin: '6px 0 0' }}>Pick a style to start, then fine-tune anything below. The preview on the right updates instantly.</p>

        <div className="lt-sec">Colours</div>
        <div className="lt-grid2">
          <ColorField label="Main colour" value={d.primaryColor} fallback={accent} hint={`Auto (${accent})`} onChange={(v) => set({ primaryColor: v })} />
          <ColorField label="Accent colour (thin lines, highlights)" value={d.secondaryColor} onChange={(v) => set({ secondaryColor: v })} />
          <ColorField label="Body text colour" value={d.bodyText} onChange={(v) => set({ bodyText: v })} />
          <ColorField label="Table label background" value={d.tableHeaderBg} onChange={(v) => set({ tableHeaderBg: v })} />
        </div>

        <div className="lt-sec">Text</div>
        <div className="lt-grid2">
          <Select label="Font style" value={d.fontFamily} options={Object.entries(FONT_LABELS)} onChange={(v) => set({ fontFamily: v })} />
          <Range label="Letter text size" min={10} max={15} step={0.5} unit=" pt" value={d.baseFontSize} onChange={(v) => set({ baseFontSize: v })} />
          <Select
            label="Subject line style"
            value={d.subjectStyle}
            options={[['lines', 'Lines above & below'], ['filled', 'Coloured bar'], ['boxed', 'Boxed'], ['underline', 'Accent underline'], ['plain', 'Plain text']]}
            onChange={(v) => set({ subjectStyle: v })}
          />
          <div style={{ alignSelf: 'end' }}><Check label="Striped table rows" checked={d.tableStriped} onChange={(v) => set({ tableStriped: v })} /></div>
        </div>

        <div className="lt-sec">Header (top of the letter)</div>
        <div className="lt-grid2">
          <Select
            label="Layout"
            value={d.headerLayout}
            options={[['left', 'Logo left, text right'], ['center', 'Centered'], ['right', 'Logo right'], ['banner', 'Full-width colour banner']]}
            onChange={(v) => set({ headerLayout: v })}
          />
          <Select
            label="Header border"
            value={d.headerBorder}
            options={[['none', 'None'], ['bottom', 'Line below'], ['double', 'Thick + thin double line'], ['box', 'Box around header']]}
            onChange={(v) => set({ headerBorder: v })}
          />
          <Range label="Border thickness" min={1} max={10} unit=" px" value={d.headerBorderWidth} onChange={(v) => set({ headerBorderWidth: v })} />
          <Select
            label="Line style"
            value={d.borderStyle}
            options={[['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['double', 'Double']]}
            onChange={(v) => set({ borderStyle: v })}
          />
          <ColorField label="Header background" value={d.headerBg === '#ffffff' ? '' : d.headerBg} fallback="#ffffff" hint={d.headerLayout === 'banner' ? 'Auto (main colour)' : 'White'} onChange={(v) => set({ headerBg: v || '#ffffff' })} />
          <ColorField label="Header text colour" value={d.headerText} fallback={d.primaryColor || accent} hint="Auto" onChange={(v) => set({ headerText: v })} />
          <Range label="Logo size" min={30} max={150} unit=" px" value={d.logoSize} onChange={(v) => set({ logoSize: v })} />
          <Range label="Extra header padding" min={0} max={30} unit=" px" value={d.headerPadding} onChange={(v) => set({ headerPadding: v })} />
          <div className="lt-span2"><label>Tagline (small line under the company name)</label>
            <input value={d.tagline} maxLength={160} placeholder="e.g. Innovating HR & Technology" onChange={(e) => set({ tagline: e.target.value })} />
          </div>
          <div className="lt-span2"><Check label="Show company name text next to the logo" checked={d.showCompanyName} onChange={(v) => set({ showCompanyName: v })} /></div>
        </div>

        <div className="lt-sec">Page border</div>
        <div className="lt-grid2">
          <Select
            label="Border around the page"
            value={d.pageBorder}
            options={[['none', 'None'], ['single', 'Single line'], ['double', 'Double line'], ['frame', 'Frame (line + inner accent line)']]}
            onChange={(v) => set({ pageBorder: v })}
          />
          {d.pageBorder !== 'none' && (
            <>
              <ColorField label="Border colour" value={d.pageBorderColor} fallback={d.primaryColor || accent} hint="Auto (main colour)" onChange={(v) => set({ pageBorderColor: v })} />
              <Range label="Border thickness" min={1} max={8} unit=" px" value={d.pageBorderWidth} onChange={(v) => set({ pageBorderWidth: v })} />
              <Range label="Distance from page edge" min={3} max={12} unit=" mm" value={d.pageMargin} onChange={(v) => set({ pageMargin: v })} />
            </>
          )}
        </div>

        <div className="lt-sec">Footer (bottom of the letter)</div>
        <div className="lt-grid2">
          <Select
            label="Layout"
            value={d.footerLayout}
            options={[['center', 'Centered text'], ['split', 'Left text + right text'], ['bar', 'Full-width colour bar']]}
            onChange={(v) => set({ footerLayout: v })}
          />
          <Select
            label="Footer border"
            value={d.footerBorder}
            options={[['none', 'None'], ['top', 'Line above'], ['double', 'Thick + thin double line'], ['box', 'Box around footer']]}
            onChange={(v) => set({ footerBorder: v })}
          />
          <Range label="Border thickness" min={1} max={8} unit=" px" value={d.footerBorderWidth} onChange={(v) => set({ footerBorderWidth: v })} />
          {d.footerLayout === 'bar'
            ? <ColorField label="Bar colour" value={d.footerBg} fallback={d.primaryColor || accent} hint="Auto (main colour)" onChange={(v) => set({ footerBg: v })} />
            : <div />}
          <ColorField label="Footer text colour" value={d.footerText} fallback="#6b6577" hint="Auto" onChange={(v) => set({ footerText: v })} />
          <div />
          <div className="lt-span2"><label>Footer left text (blank = company footer text)</label>
            <input value={d.footerLeft} maxLength={200} onChange={(e) => set({ footerLeft: e.target.value })} />
          </div>
          {d.footerLayout === 'split' && (
            <div className="lt-span2"><label>Footer right text (blank = email | phone | website)</label>
              <input value={d.footerRight} maxLength={200} onChange={(e) => set({ footerRight: e.target.value })} />
            </div>
          )}
          {d.footerLayout !== 'split' && (
            <div className="lt-span2"><Check label="Also show email / phone / website in the footer" checked={d.showFooterContact} onChange={(v) => set({ showFooterContact: v })} /></div>
          )}
        </div>

        <div className="lt-sec">Watermark</div>
        <div className="lt-grid2">
          <Select label="Background watermark" value={d.watermarkType} options={[['none', 'None'], ['text', 'Text'], ['logo', 'Company logo']]} onChange={(v) => set({ watermarkType: v })} />
          {d.watermarkType === 'text' && (
            <div><label>Watermark text</label><input value={d.watermarkText} maxLength={40} placeholder="Company name" onChange={(e) => set({ watermarkText: e.target.value })} /></div>
          )}
          {d.watermarkType === 'text' && <ColorField label="Watermark colour" value={d.watermarkColor} onChange={(v) => set({ watermarkColor: v })} />}
          {d.watermarkType !== 'none' && <Range label="Visibility" min={0.02} max={0.2} step={0.01} value={d.watermarkOpacity} onChange={(v) => set({ watermarkOpacity: v })} />}
        </div>

        <div className="lt-row" style={{ marginTop: 20, flexWrap: 'wrap' }}>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => onChange({ ...DEFAULT_DESIGN })}>Reset to plain design</button>
          {canApplyAll && <button type="button" className="admin-btn admin-btn-ghost" onClick={onApplyAll}>Use this design on all templates</button>}
        </div>
        <p className="lt-muted" style={{ marginBottom: 0 }}>Remember to press <strong>Save changes</strong> at the bottom. Letters already issued keep the design they were issued with.</p>
      </div>
    </details>
  );
}
