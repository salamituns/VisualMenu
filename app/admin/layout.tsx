import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AdminLayoutClient from './admin-layout-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MenuViz Admin - Manage Your Restaurant',
  description: 'Admin dashboard for MenuViz - Manage your menus, view analytics, and control your restaurant settings.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  )
}

