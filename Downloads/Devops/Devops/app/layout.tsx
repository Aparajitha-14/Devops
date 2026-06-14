import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const fontDisplay = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans-display",
});

const fontText = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans-text",
});

export const metadata: Metadata = {
  title: 'CARE - Charlie\'s Animal Rescue Centre',
  description: 'Charlie\'s Animal Rescue Centre (CARE) - Dedicated to rescuing and protecting animals in need. Visit our shelter, adopt, volunteer, or donate today.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className={`${fontDisplay.variable} ${fontText.variable} font-sans antialiased text-body leading-relaxed`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
      
    </html>
  )
}

