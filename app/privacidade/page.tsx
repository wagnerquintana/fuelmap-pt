import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de privacidade do FuelMap PT — como tratamos os seus dados pessoais.',
}

const sections = [
  {
    title: '1. Responsável pelo tratamento',
    content: `O FuelMap PT é um serviço gratuito de comparação de preços de combustíveis em Portugal. O responsável pelo tratamento dos dados pessoais é o titular do projeto FuelMap PT.

Para questões relacionadas com a proteção de dados, pode contactar-nos através do email: **privacidade@fuelmap.pt**`,
  },
  {
    title: '2. Dados que recolhemos',
    content: `Recolhemos apenas os dados estritamente necessários ao funcionamento do serviço:

- **Email** — quando cria alertas de preço, guarda pesquisas ou utiliza a calculadora de poupança. Utilizado exclusivamente para o envio de notificações solicitadas.
- **Preferências de pesquisa** — distrito, tipo de combustível e filtros selecionados, associados ao email quando o utilizador opta por guardar a pesquisa.
- **Dados de autenticação** — quando utiliza o Magic Link para aceder aos favoritos, o email é processado pelo Supabase Auth.

**Não recolhemos:** nome, morada, dados de pagamento, localização GPS, cookies de rastreamento de terceiros, nem qualquer outro dado pessoal.`,
  },
  {
    title: '3. Finalidade do tratamento',
    content: `Os dados pessoais são tratados para as seguintes finalidades:

- **Alertas de preço** — enviar notificação por email quando o preço de um combustível num posto específico descer abaixo do limite definido pelo utilizador.
- **Pesquisas guardadas** — permitir ao utilizador receber atualizações sobre os preços na sua zona.
- **Calculadora de poupança** — gerar e enviar o relatório de poupança personalizado.
- **Favoritos** — autenticação via Magic Link para gerir postos favoritos.

Não utilizamos os dados para marketing, publicidade direcionada, venda a terceiros ou qualquer outra finalidade não descrita acima.`,
  },
  {
    title: '4. Base legal',
    content: `O tratamento dos dados pessoais baseia-se no **consentimento do utilizador** (artigo 6.º, n.º 1, alínea a) do RGPD), prestado de forma livre, específica e informada no momento em que fornece o seu email para cada funcionalidade.

O utilizador pode retirar o consentimento a qualquer momento, conforme descrito na secção 7.`,
  },
  {
    title: '5. Partilha de dados',
    content: `Os dados pessoais são processados pelos seguintes subcontratantes:

- **Supabase** (base de dados e autenticação) — dados armazenados na UE, em conformidade com o RGPD.
- **Vercel** (alojamento) — processamento de pedidos HTTP, sem armazenamento de dados pessoais.

Não vendemos, alugamos ou partilhamos dados pessoais com terceiros para fins comerciais.`,
  },
  {
    title: '6. Conservação dos dados',
    content: `- **Alertas de preço** — conservados enquanto o alerta estiver ativo. Alertas sem ativação durante 12 meses são automaticamente eliminados.
- **Pesquisas guardadas e leads** — conservados por um período máximo de 24 meses.
- **Dados de autenticação** — conservados enquanto a conta estiver ativa no Supabase Auth.

Após os períodos indicados, os dados são eliminados de forma irreversível.`,
  },
  {
    title: '7. Direitos do utilizador',
    content: `Nos termos do RGPD, o utilizador tem os seguintes direitos:

- **Acesso** — solicitar confirmação e cópia dos dados pessoais tratados.
- **Retificação** — corrigir dados inexatos ou incompletos.
- **Apagamento** — solicitar a eliminação dos dados pessoais ("direito ao esquecimento").
- **Portabilidade** — receber os dados num formato estruturado e legível por máquina.
- **Oposição** — opor-se ao tratamento dos dados em determinadas circunstâncias.
- **Retirada do consentimento** — retirar o consentimento a qualquer momento, sem comprometer a licitude do tratamento efetuado anteriormente.

Para exercer qualquer destes direitos, envie email para **privacidade@fuelmap.pt**.

Tem também o direito de apresentar reclamação junto da **Comissão Nacional de Proteção de Dados (CNPD)** — [www.cnpd.pt](https://www.cnpd.pt).`,
  },
  {
    title: '8. Dados de combustíveis',
    content: `Os preços de combustíveis apresentados neste site são dados abertos disponibilizados pela **Direção-Geral de Energia e Geologia (DGEG)** através da sua API pública, ao abrigo do Regulamento (UE) 2023/138 relativo a conjuntos de dados de elevado valor (HVD).

Estes dados não constituem dados pessoais e são atualizados diariamente.`,
  },
  {
    title: '9. Cookies',
    content: `O FuelMap PT utiliza apenas cookies estritamente necessários ao funcionamento do serviço:

- **Autenticação Supabase** — cookies de sessão para manter o login ativo.
- **Preferências locais** — armazenamento local (localStorage) para guardar o estado da pesquisa e preferências de interface.

Não utilizamos cookies de análise, publicidade ou rastreamento de terceiros.`,
  },
  {
    title: '10. Segurança',
    content: `Implementamos medidas técnicas e organizativas adequadas para proteger os dados pessoais contra acesso não autorizado, perda ou destruição, incluindo:

- Comunicações encriptadas via HTTPS/TLS.
- Autenticação sem password (Magic Link).
- Row Level Security (RLS) na base de dados para dados sensíveis.
- Acesso restrito aos sistemas de produção.`,
  },
  {
    title: '11. Alterações a esta política',
    content: `Esta política pode ser atualizada periodicamente. A data da última atualização é indicada no topo desta página. Recomendamos a consulta regular desta página.

Em caso de alterações significativas, poderemos notificar os utilizadores por email, quando disponível.`,
  },
]

export default function PrivacidadePage() {
  return (
    <div className="h-dvh overflow-y-auto overscroll-contain" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg mb-8 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <ArrowLeft size={13} strokeWidth={2.5} />
          Voltar
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.25)' }}
            >
              <Shield size={22} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: 'white' }}>Política de Privacidade</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Última atualização: abril 2026</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            O FuelMap PT respeita a sua privacidade e está comprometido com a proteção dos seus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) e a legislação portuguesa aplicável.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map(section => (
            <section
              key={section.title}
              className="rounded-xl p-5 sm:p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h2 className="text-sm font-bold mb-3" style={{ color: 'white' }}>{section.title}</h2>
              <div
                className="text-sm leading-relaxed prose-dark"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                dangerouslySetInnerHTML={{
                  __html: section.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: rgba(255,255,255,0.9)">$1</strong>')
                    .replace(/\n\n/g, '</p><p style="margin-top: 12px">')
                    .replace(/\n- /g, '</p><p style="margin-top: 4px; padding-left: 16px">• ')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: underline">$1</a>')
                }}
              />
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            FuelMap PT &middot; Dados abertos DGEG &middot; Regulamento UE 2023/138
          </p>
        </div>
      </div>
    </div>
  )
}
