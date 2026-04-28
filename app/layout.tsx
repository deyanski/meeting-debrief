import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils"
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Meeting Debrief',
  description: 'Turn meeting transcripts into structured, actionable debriefs.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Meeting Debrief',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#d4a853' },
    { media: '(prefers-color-scheme: light)', color: '#b8872e' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(dmSans.variable, dmSerifDisplay.variable, jetBrainsMono.variable, "font-sans")}>
      <head>
        {/* Anti-flash: respect OS preference for new users; localStorage overrides */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');if(s==='light'){document.documentElement.setAttribute('data-theme','light');}else if(s==='dark'){/* keep default */}else{if(!window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','light');}}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
