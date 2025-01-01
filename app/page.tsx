import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2, ImageIcon, Utensils, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Utensils className="h-6 w-6 mr-2" />
          <span className="font-bold">MenuViz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Transform Your Menu into a Visual Feast
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Elevate your restaurant's ordering experience with our innovative menu visualization platform.
                </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <ImageIcon className="w-10 h-10 mb-2 text-primary" />
                  <CardTitle>Upload Your Menu</CardTitle>
                </CardHeader>
                <CardContent>
                  Simply upload your existing menu. Our advanced OCR technology will do the rest.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="w-10 h-10 mb-2 text-primary" />
                  <CardTitle>Customize & Enhance</CardTitle>
                </CardHeader>
                <CardContent>
                  Add images, descriptions, and customize the layout to match your brand.
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle2 className="w-10 h-10 mb-2 text-primary" />
                  <CardTitle>Publish & Delight</CardTitle>
                </CardHeader>
                <CardContent>
                  Share your visual menu online or use it in-house to enhance the dining experience.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">See It in Action</h2>
            <div className="flex justify-center">
              <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=720&width=1280"
                  alt="Product demo video placeholder"
                  layout="fill"
                  objectFit="cover"
                />
                {/* Replace with actual video player component */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button variant="outline" size="lg" className="text-white bg-black bg-opacity-50 hover:bg-opacity-75">
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Amazing Product!</CardTitle>
                    <CardDescription>Restaurant Owner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    "MenuViz has transformed how our customers interact with our menu. We've seen a significant increase in order value and customer satisfaction."
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Visualize Your Menu?</h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join thousands of restaurants already delighting their customers with visual menus.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg">Start Free Trial</Button>
                <Button variant="outline" size="lg">
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Trusted by Top Restaurants</h2>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {['Olive Garden', 'Cheesecake Factory', 'Applebee\'s', 'Chili\'s', 'TGI Fridays', 'Red Lobster'].map((restaurant) => (
                <div key={restaurant} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <Image
                    src={`https://logo.clearbit.com/${restaurant.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                    alt={`${restaurant} logo`}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 MenuViz. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

