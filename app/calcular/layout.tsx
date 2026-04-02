import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadora de Poupança',
  description:
    'Calcula quanto podes poupar por mês ao abastecer nos postos de combustível mais baratos de Portugal.',
  openGraph: {
    title: 'Calculadora de Poupança — FuelMap PT',
    description:
      'Descobre quanto podes poupar ao escolher os postos mais baratos.',
  },
}

export default function CalcularLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
