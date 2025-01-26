import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/context/auth-context'
import { PermissionProvider } from '@/lib/context/permission-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visual Menu',
  description: 'Transform your menu into a visual feast',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PermissionProvider>
            {children}
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

