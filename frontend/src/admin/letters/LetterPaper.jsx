import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { mediaUrl } from '../../api/client';
import { formatDate } from './letterUtils';
import { resolveDesign, designVars } from './letterDesign';

// Header / footer divider lines: single, or a thick + thin "double" rule.
function Rule({ kind, width, lineStyle, primary, secondary, bleed }) {
  if (kind === 'bottom' || kind === 'top') {
    return <div className={`lp-rule ${bleed ? 'is-bleed' : ''}`} style={{ borderTop: `${width}px ${lineStyle} ${primary}` }} />;
  }
  if (kind === 'double') {
    return (
      <div className={`lp-rule ${bleed ? 'is-bleed' : ''}`}>
        <div style={{ borderTop: `${Math.max(width, 2)}px solid ${primary}` }} />
        <div style={{ borderTop: `${Math.max(1, Math.round(width / 3))}px solid ${secondary}`, marginTop: 3 }} />
      </div>
    );
  }
  return null;
}

// A4 letter. `bodyHtml` is the already-rendered template body.
// `design` is the template's design object (see letterDesign.js); without one
// the letter looks like the original plain letterhead.
export function LetterPaper({ company, refNo, issueDate, subject, bodyHtml, showSignature = true, design }) {
  const c = company || {};
  const d = resolveDesign(design, c);
  const contact = [c.email, c.phone, c.website].filter(Boolean).join('  |  ');
  const banner = d.headerLayout === 'banner';
  const framed = d.pageBorder !== 'none';
  const bleedX = framed ? Math.max(0, 20 - d.pageMargin - 1) : 20;
  const bleedTop = framed ? Math.max(0, 16 - d.pageMargin - 1) : 16;
  const bleedBottom = framed ? Math.max(0, 14 - d.pageMargin - 1) : 14;

  const vars = {
    ...designVars(d),
    '--lp-bx': `${bleedX}mm`,
    '--lp-bt': `${bleedTop}mm`,
    '--lp-bb': `${bleedBottom}mm`,
    '--lp-pm': `${d.pageMargin}mm`,
  };

  const headBox = d.headerBorder === 'box';
  const headStyle = {
    background: banner || headBox || d.headerBg !== '#ffffff' ? d.headerBg : undefined,
    color: d.headerText,
    padding: banner ? `${Math.max(d.headerPadding, 16)}px var(--lp-bx)` : headBox ? `${Math.max(d.headerPadding, 10)}px` : d.headerPadding ? `${d.headerPadding}px` : undefined,
    border: headBox ? `${d.headerBorderWidth}px ${d.borderStyle} ${d.primary}` : undefined,
    marginTop: banner ? 'calc(var(--lp-bt) * -1)' : undefined,
    marginLeft: banner ? 'calc(var(--lp-bx) * -1)' : undefined,
    marginRight: banner ? 'calc(var(--lp-bx) * -1)' : undefined,
  };

  const footLeft = d.footerLeft || c.footerText;
  const reg = c.registrationNo && `Reg. No: ${c.registrationNo}`;
  const footCenter = [footLeft, reg, d.showFooterContact && contact].filter(Boolean).join('  •  ');
  const footSplitLeft = [footLeft, reg].filter(Boolean).join('  •  ');
  const footSplitRight = d.footerRight || contact;
  const footBox = d.footerBorder === 'box';
  const footIsBar = d.footerLayout === 'bar';
  const footStyle = {
    color: d.footerText,
    background: footIsBar ? d.footerBg : undefined,
    border: footBox ? `${d.footerBorderWidth}px ${d.borderStyle} ${d.primary}` : undefined,
    padding: footIsBar ? '10px var(--lp-bx)' : footBox ? '8px 12px' : undefined,
    marginLeft: footIsBar ? 'calc(var(--lp-bx) * -1)' : undefined,
    marginRight: footIsBar ? 'calc(var(--lp-bx) * -1)' : undefined,
    marginBottom: footIsBar ? 'calc(var(--lp-bb) * -1)' : undefined,
  };

  const wmText = d.watermarkText || c.name || '';

  return (
    <div className={`lp-sheet lp-subject-${d.subjectStyle} ${d.tableStriped ? 'is-striped' : ''}`} style={vars}>
      {framed && (
        <div
          className="lp-pageborder"
          style={{
            inset: `${d.pageMargin}mm`,
            border: `${d.pageBorder === 'double' ? Math.max(d.pageBorderWidth, 3) : d.pageBorderWidth}px ${d.pageBorder === 'double' ? 'double' : 'solid'} ${d.pageBorderColor}`,
          }}
        >
          {d.pageBorder === 'frame' && <div className="lp-pageborder-in" style={{ border: `1px solid ${d.secondaryColor}` }} />}
        </div>
      )}

      {d.watermarkType !== 'none' && (
        <div className="lp-watermark" style={{ opacity: d.watermarkOpacity, color: d.watermarkColor }}>
          {d.watermarkType === 'logo' && c.logoUrl
            ? <img src={mediaUrl(c.logoUrl)} alt="" />
            : d.watermarkType === 'text' && wmText ? <span style={{ fontSize: `${Math.max(26, Math.min(78, Math.round(520 / wmText.length)))}pt` }}>{wmText}</span> : null}
        </div>
      )}

      {/* flow: header + body + signature. In print, the head/foot spacers repeat on
          every page, so text never touches the page border or the footer. */}
      <div className="lp-flow">
      <div className="lp-flow-head"><div className="lp-spacer" /></div>
      <div className="lp-flow-body">
      <header className={`lp-head lp-head-${d.headerLayout}`} style={headStyle}>
        {c.logoUrl && <img className="lp-logo" src={mediaUrl(c.logoUrl)} alt="" />}
        <div className="lp-head-text">
          {d.showCompanyName && <div className="lp-company" style={{ color: d.headerText }}>{c.name || 'Company Name'}</div>}
          {d.tagline && <div className="lp-tagline" style={{ color: d.headerText }}>{d.tagline}</div>}
          {c.address && <div className="lp-addr" style={{ color: d.headerText }}>{c.address}</div>}
          {contact && <div className="lp-addr" style={{ color: d.headerText }}>{contact}</div>}
        </div>
      </header>
      <Rule kind={d.headerBorder} width={d.headerBorderWidth} lineStyle={d.borderStyle} primary={d.primary} secondary={d.secondaryColor} bleed={banner} />
      <div className="lp-after-head" />

      <div className="lp-meta">
        <span>Ref: <strong>{refNo || '—'}</strong></span>
        <span>Date: <strong>{formatDate(issueDate)}</strong></span>
      </div>

      {subject && <div className="lp-subject">{subject}</div>}

      <div className="lp-body" dangerouslySetInnerHTML={{ __html: bodyHtml || '' }} />

      {showSignature && (
        <div className="lp-sign">
          <p>Yours sincerely,</p>
          <p className="lp-for">For <strong>{c.legalName || c.name}</strong></p>
          {c.signatureUrl
            ? <img className="lp-sig-img" src={mediaUrl(c.signatureUrl)} alt="" />
            : <div className="lp-sig-space" />}
          <p className="lp-signer"><strong>{c.signatoryName || 'Authorised Signatory'}</strong></p>
          {c.signatoryDesignation && <p className="lp-signer-role">{c.signatoryDesignation}</p>}
        </div>
      )}

      </div>
      <div className="lp-flow-foot"><div className="lp-spacer" /></div>
      </div>

      <div className="lp-foot-wrap">
        {(d.footerBorder === 'top' || d.footerBorder === 'double') && !footIsBar && (
          <Rule kind={d.footerBorder === 'top' ? 'top' : 'double'} width={d.footerBorderWidth} lineStyle={d.borderStyle} primary={d.primary} secondary={d.secondaryColor} />
        )}
        <footer className={`lp-foot lp-foot-${d.footerLayout}`} style={footStyle}>
          {d.footerLayout === 'split' ? (
            <>
              <span>{footSplitLeft}</span>
              <span>{footSplitRight}</span>
            </>
          ) : footCenter}
        </footer>
      </div>
    </div>
  );
}

// Scaled-down on-screen preview inside a grey "desk". Pass `print` to also
// mount a print-only copy so the browser prints just the letter.
export function LetterPreview({ print = true, ...props }) {
  const [root, setRoot] = useState(null);
  const [zoom, setZoom] = useState(0.7);
  const desk = useRef(null);

  // scale the A4 sheet to fill the available width, so text stays readable
  useEffect(() => {
    const node = desk.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const fit = () => setZoom(Math.min(1.1, Math.max(0.4, (node.clientWidth - 36) / 794)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!print) return undefined;
    let el = document.getElementById('lt-print-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lt-print-root';
      document.body.appendChild(el);
    }
    setRoot(el);
    return () => { el.innerHTML = ''; };
  }, [print]);

  return (
    <>
      <div className="lp-desk" ref={desk}><div className="lp-zoom" style={{ zoom }}><LetterPaper {...props} /></div></div>
      {print && root && createPortal(<LetterPaper {...props} />, root)}
    </>
  );
}