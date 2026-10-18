import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Simple Word-style editor (no HTML shown). Stores HTML internally.
const RichEditor = forwardRef(function RichEditor({ value, onChange, editorKey }, ref) {
  const el = useRef(null);

  // load content only when switching template (never on each keystroke → cursor stays put)
  useEffect(() => {
    if (el.current) el.current.innerHTML = value || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  const emit = () => onChange(el.current.innerHTML);

  function exec(cmd, arg) {
    el.current.focus();
    document.execCommand(cmd, false, arg);
    emit();
  }

  function insertTable() {
    exec('insertHTML', '<table class="lt-table"><tr><td>Label</td><td>Value</td></tr><tr><td>Label</td><td>Value</td></tr></table><p><br></p>');
  }

  function addRow() {
    const sel = window.getSelection();
    let node = sel && sel.anchorNode;
    while (node && node !== el.current && node.nodeName !== 'TR') node = node.parentNode;
    if (!node || node.nodeName !== 'TR') { alert('Click inside a table row first.'); return; }
    const row = node.cloneNode(true);
    row.querySelectorAll('td').forEach((td, i) => { td.textContent = i === 0 ? 'Label' : 'Value'; });
    node.after(row);
    emit();
  }

  useImperativeHandle(ref, () => ({
    insert(text) { exec('insertText', text); },
  }));

  const Btn = ({ title, onClick, children }) => (
    <button type="button" title={title} className="lt-tb" onMouseDown={(e) => { e.preventDefault(); onClick(); }}>{children}</button>
  );

  return (
    <div className="lt-editor-wrap">
      <div className="lt-toolbar">
        <Btn title="Bold" onClick={() => exec('bold')}><b>B</b></Btn>
        <Btn title="Italic" onClick={() => exec('italic')}><i>I</i></Btn>
        <Btn title="Underline" onClick={() => exec('underline')}><u>U</u></Btn>
        <span className="lt-tb-sep" />
        <Btn title="Normal text" onClick={() => exec('formatBlock', 'p')}>Normal</Btn>
        <Btn title="Heading" onClick={() => exec('formatBlock', 'h4')}>Heading</Btn>
        <span className="lt-tb-sep" />
        <Btn title="Bullet list" onClick={() => exec('insertUnorderedList')}>• List</Btn>
        <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}>1. List</Btn>
        <span className="lt-tb-sep" />
        <Btn title="Align left" onClick={() => exec('justifyLeft')}>Left</Btn>
        <Btn title="Center" onClick={() => exec('justifyCenter')}>Center</Btn>
        <Btn title="Justify" onClick={() => exec('justifyFull')}>Justify</Btn>
        <span className="lt-tb-sep" />
        <Btn title="Insert details table" onClick={insertTable}>+ Table</Btn>
        <Btn title="Add a row below the current row" onClick={addRow}>+ Row</Btn>
        <span className="lt-tb-sep" />
        <Btn title="Undo" onClick={() => exec('undo')}>↶</Btn>
        <Btn title="Redo" onClick={() => exec('redo')}>↷</Btn>
      </div>
      <div
        ref={el}
        className="lt-editor lp-body"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        }}
      />
    </div>
  );
});

export default RichEditor;