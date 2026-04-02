import { Fuel } from 'lucide-react'

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen"
      style={{ background: 'var(--gradient-bg)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          boxShadow: '0 12px 36px rgba(99,102,241,0.35)',
          animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      >
        <Fuel size={28} className="text-white" />
      </div>
      <p
        className="text-sm font-bold"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        A carregar postos...
      </p>
    </div>
  )
}
