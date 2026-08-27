'use client'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchInput = ({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) => (
  <div className="relative">
    <svg
      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-text/40"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
      />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-white border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-dark-text placeholder-dark-text/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition sm:w-72"
    />
  </div>
)
