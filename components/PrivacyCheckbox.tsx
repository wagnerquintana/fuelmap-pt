'use client'

import Link from 'next/link'

interface PrivacyCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function PrivacyCheckbox({ checked, onChange }: PrivacyCheckboxProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <span
        className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
        style={{
          background: checked ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
          border: checked ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.15)',
          boxShadow: checked ? '0 0 10px rgba(99,102,241,0.25)' : 'none',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5.5L4 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
        required
      />
      <span className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Li e aceito a{' '}
        <Link href="/privacidade" target="_blank" className="underline transition-colors" style={{ color: 'var(--color-primary)' }}>
          Política de Privacidade
        </Link>
      </span>
    </label>
  )
}
