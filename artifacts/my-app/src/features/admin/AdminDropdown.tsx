import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AdminFilterOption } from './adminCatalog';

interface AdminDropdownProps {
  label: string;
  value: string;
  options: readonly AdminFilterOption[];
  onChange: (id: string) => void;
}

export function AdminDropdown({ label, value, options, onChange }: AdminDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="admin-dd" ref={rootRef}>
      <button
        type="button"
        className={`admin-dd__btn${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="admin-dd__meta">
          <span className="admin-dd__label">{label}</span>
          <span className="admin-dd__value">{current?.label ?? 'Все'}</span>
        </span>
        <ChevronDown size={14} aria-hidden />
      </button>
      {open && (
        <ul id={listId} className="admin-dd__list" role="listbox">
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={o.id === value}>
              <button
                type="button"
                className={`admin-dd__opt${o.id === value ? ' is-on' : ''}`}
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
