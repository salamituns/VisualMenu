import { Metadata } from 'next'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{
    restaurantId: string
  }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ restaurantId: string }> }
): Promise<Metadata> {
  const resolvedParams = await params
  
  return {
    title: `Menu - Restaurant ${resolvedParams.restaurantId}`,
    description: 'View our delicious menu items',
  }
}

export default async function MenuLayout({
  children,
  params,
}: LayoutProps) {
  const resolvedParams = await params

  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  )
} 