'use client';

import { useState, type InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  showToggle?: boolean;
}

export default function AuthInput({ label, id, showToggle, type, ...props }: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? 'text' : 'password') : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1.5"
          style={{ color: 'var(--ink-700)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
          style={{
            borderColor: 'var(--line)',
            color: 'var(--ink-900)',
            background: 'var(--surface-alt)',
            paddingRight: showToggle ? '44px' : undefined,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--brand-600)';
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)';
            e.currentTarget.style.background = 'white';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--line)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'var(--surface-alt)';
          }}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
            style={{ color: 'var(--ink-500)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-500)'; }}
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {visible ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
