import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'dialkit/styles.css'
import '../components/vk/dialkit-clean.css'
import '../components/vk/motion.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'VariantKit — the control panel for AI-built UI',
  description:
    'When your AI agent builds UI, VariantKit has it generate a few real variants with a live control panel. Tune them, finalize one, the rest get pruned.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
