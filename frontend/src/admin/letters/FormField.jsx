// Renders one dynamic field (text / textarea / date / number / select).
export default function FormField({ def, value, onChange, wide }) {
  const common = {
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    placeholder: def.placeholder || '',
  };
  let input;
  if (def.type === 'textarea') input = <textarea rows={3} {...common} />;
  else if (def.type === 'select') {
    input = (
      <select {...common}>
        <option value="">— Select —</option>
        {(def.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  } else input = <input type={def.type === 'date' || def.type === 'number' ? def.type : 'text'} {...common} />;

  return (
    <div className={wide || def.type === 'textarea' ? 'lt-span2' : undefined}>
      <label>{def.label}{def.required ? ' *' : ''}</label>
      {input}
    </div>
  );
}