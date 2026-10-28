import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource-variable/plus-jakarta-sans';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Soma-Agent — AI Learning for Ugandan Schools',
    template: '%s | Soma-Agent',
  },
  description:
    'Soma-Agent is an AI-powered learning platform for Ugandan O-Level students, teachers and parents — NCDC-aligned tutoring, mastery tracking and school analytics.',
  applicationName: 'Soma-Agent',
  keywords: ['Soma-Agent', 'Uganda', 'NCDC', 'O-Level', 'AI tutor', 'education', 'Gayaza'],
  authors: [{ name: 'Soma-Agent' }],
  openGraph: {
    title: 'Soma-Agent — AI Learning for Ugandan Schools',
    description:
      'An AI tutor that knows the NCDC syllabus. Track mastery, practise with instant quizzes and keep every guardian in the loop.',
    type: 'website',
    locale: 'en_UG',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a2a43',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
