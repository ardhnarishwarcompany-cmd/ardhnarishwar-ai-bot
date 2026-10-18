// Letter design (colours, header / footer, borders, fonts, watermark).
// A design is a plain object saved on each template; anything missing falls
// back to DEFAULT_DESIGN, so old templates keep looking exactly as before.

export const DEFAULT_DESIGN = {
  primaryColor: '',            // '' = use the company's accent colour
  secondaryColor: '#c99b61',
  bodyText: '#1d1a24',
  fontFamily: 'serif',
  baseFontSize: 12.5,

  headerLayout: 'left',        // left | center | right | banner
  headerBg: '#ffffff',
  headerText: '',              // '' = primary colour (banner: white)
  headerBorder: 'bottom',      // none | bottom | box | double
  headerBorderWidth: 3,
  borderStyle: 'solid',        // solid | double | dashed | dotted
  headerPadding: 0,
  logoSize: 84,
  showCompanyName: true,
  tagline: '',

  pageBorder: 'none',          // none | single | double | frame
  pageBorderWidth: 2,
  pageBorderColor: '',         // '' = primary colour
  pageMargin: 6,

  subjectStyle: 'lines',       // lines | filled | boxed | underline | plain
  tableHeaderBg: '#f5f3f9',
  tableStriped: false,

  footerLayout: 'center',      // center | split | bar
  footerBg: '',                // '' = primary colour (bar layout only)
  footerText: '',              // '' = grey (bar: white)
  footerBorder: 'top',         // none | top | box | double
  footerBorderWidth: 1,
  footerLeft: '',
  footerRight: '',
  showFooterContact: false,

  watermarkType: 'none',       // none | text | logo
  watermarkText: '',
  watermarkColor: '#281b3d',
  watermarkOpacity: 0.07,
};

export const FONT_STACKS = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Arial, Helvetica, sans-serif",
  modern: "'Segoe UI', Calibri, 'Helvetica Neue', Arial, sans-serif",
  classic: "'Times New Roman', Garamond, 'Book Antiqua', serif",
};

export const FONT_LABELS = { serif: 'Georgia (elegant serif)', sans: 'Arial (clean sans-serif)', modern: 'Segoe UI / Calibri (modern)', classic: 'Times New Roman (classic)' };

// Ready-made looks. Each one only overrides what it needs.
export const PRESETS = [
  { id: 'classic', name: 'Classic', swatch: ['#281b3d', '#ffffff'], design: {} },
  {
    id: 'royal', name: 'Royal Purple & Gold', swatch: ['#3b2160', '#c99b61'],
    design: {
      primaryColor: '#3b2160', secondaryColor: '#c99b61', headerLayout: 'banner', headerBg: '#3b2160', headerText: '#ffffff',
      headerBorder: 'double', headerBorderWidth: 4, pageBorder: 'single', pageBorderColor: '#c99b61', pageBorderWidth: 2,
      subjectStyle: 'filled', tableHeaderBg: '#efe7f9', footerLayout: 'bar', footerBg: '#3b2160', footerText: '#ffffff', footerBorder: 'none',
    },
  },
  {
    id: 'corporate', name: 'Corporate Blue', swatch: ['#0b3d7a', '#2f8fe0'],
    design: {
      primaryColor: '#0b3d7a', secondaryColor: '#2f8fe0', fontFamily: 'sans', headerLayout: 'left', headerBorder: 'double', headerBorderWidth: 4,
      subjectStyle: 'boxed', tableHeaderBg: '#e6f0fb', footerLayout: 'split', footerBorder: 'top', footerBorderWidth: 2, tableStriped: true,
    },
  },
  {
    id: 'emerald', name: 'Modern Emerald', swatch: ['#0f6b55', '#f2b84b'],
    design: {
      primaryColor: '#0f6b55', secondaryColor: '#f2b84b', fontFamily: 'modern', headerLayout: 'banner', headerBg: '#0f6b55', headerText: '#ffffff',
      headerBorder: 'bottom', headerBorderWidth: 5, subjectStyle: 'underline', tableHeaderBg: '#e4f4ee', footerLayout: 'bar', footerBg: '#0f6b55', footerText: '#ffffff', footerBorder: 'none',
    },
  },
  {
    id: 'maroon', name: 'Elegant Maroon', swatch: ['#7a1f2b', '#b8893b'],
    design: {
      primaryColor: '#7a1f2b', secondaryColor: '#b8893b', fontFamily: 'classic', headerLayout: 'center', headerBorder: 'double', headerBorderWidth: 4,
      pageBorder: 'double', pageBorderWidth: 3, pageBorderColor: '#7a1f2b', subjectStyle: 'lines', tableHeaderBg: '#f8ecee', footerLayout: 'center', footerBorder: 'double', footerBorderWidth: 3,
    },
  },
  {
    id: 'minimal', name: 'Minimal Slate', swatch: ['#334155', '#94a3b8'],
    design: {
      primaryColor: '#334155', secondaryColor: '#94a3b8', fontFamily: 'sans', headerLayout: 'right', headerBorder: 'bottom', headerBorderWidth: 1,
      subjectStyle: 'plain', tableHeaderBg: '#f1f5f9', footerLayout: 'center', footerBorder: 'top', footerBorderWidth: 1,
    },
  },
  {
    id: 'sunset', name: 'Sunset Orange', swatch: ['#c2410c', '#fbbf24'],
    design: {
      primaryColor: '#c2410c', secondaryColor: '#fbbf24', fontFamily: 'modern', headerLayout: 'left', headerBorder: 'box', headerBorderWidth: 2, headerPadding: 10, headerBg: '#fff7ed',
      pageBorder: 'frame', pageBorderWidth: 2, pageBorderColor: '#c2410c', subjectStyle: 'filled', tableHeaderBg: '#ffedd5', footerLayout: 'split', footerBorder: 'box', footerBorderWidth: 1,
    },
  },
];

export const withDefaults = (design) => {
  const out = { ...DEFAULT_DESIGN };
  Object.entries(design || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') out[k] = v; });
  return out;
};

// Fully-resolved values used by LetterPaper (colour fallbacks applied).
export function resolveDesign(design, company) {
  const d = withDefaults(design);
  const primary = d.primaryColor || company?.accentColor || '#281b3d';
  const banner = d.headerLayout === 'banner';
  return {
    ...d,
    primary,
    pageBorderColor: d.pageBorderColor || primary,
    headerText: d.headerText || (banner ? '#ffffff' : primary),
    headerBg: banner && d.headerBg === '#ffffff' ? primary : d.headerBg,
    footerBg: d.footerBg || primary,
    footerText: d.footerText || (d.footerLayout === 'bar' ? '#ffffff' : '#6b6577'),
    font: FONT_STACKS[d.fontFamily] || FONT_STACKS.serif,
  };
}

export const designVars = (r) => ({
  '--lp-primary': r.primary,
  '--lp-secondary': r.secondaryColor,
  '--lp-body-text': r.bodyText,
  '--lp-font': r.font,
  '--lp-ui-font': ['sans', 'modern'].includes(r.fontFamily) ? r.font : FONT_STACKS.sans,
  '--lp-size': `${r.baseFontSize}pt`,
  '--lp-table-bg': r.tableHeaderBg,
  '--lp-logo-h': `${r.logoSize}px`,
});
