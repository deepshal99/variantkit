import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'dialkit/styles.css'
import '../components/vk/dialkit-clean.css'
import '../components/vk/motion.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const DESCRIPTION =
  'When your AI agent builds UI, VariantKit has it generate a few real variants with a live control panel. Tune them, finalize one, the rest get pruned.'

export const metadata: Metadata = {
  metadataBase: new URL('https://variantkit.vercel.app'),
  title: {
    default: 'VariantKit — the control panel for AI-built UI',
    template: '%s · VariantKit',
  },
  description: DESCRIPTION,
  applicationName: 'VariantKit',
  keywords: [
    'VariantKit', 'AI UI', 'AI coding agent', 'component variants', 'control panel',
    'Claude Code', 'Cursor', 'design tokens', 'React', 'DialKit', 'shadcn',
  ],
  authors: [{ name: 'VariantKit' }],
  creator: 'VariantKit',
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://variantkit.vercel.app',
    siteName: 'VariantKit',
    title: 'VariantKit — the control panel for AI-built UI',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VariantKit — the control panel for AI-built UI',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#08090a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
