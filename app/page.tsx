'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ImageIcon, Zap, ArrowRight, Star, Users, Building2 } from 'lucide-react'
import { Navigation } from "@/components/navigation"
import { motion, HTMLMotionProps } from "framer-motion"

export default function Home() {
  const MotionDiv = motion.div

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <Badge variant="secondary" className="mx-auto">
                  Trusted by 1000+ Restaurants
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                  Transform Your Menu into a Visual Feast
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Elevate your restaurant's ordering experience with our innovative menu visualization platform.
                  Join the future of digital dining.
                </p>
              </MotionDiv>
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-x-4"
              >
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </MotionDiv>
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-8 pt-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">1000+</div>
                  <div className="text-sm text-gray-500">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm text-gray-500">Menu Items</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-lg">
                Three simple steps to revolutionize your menu experience
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative overflow-hidden border-none shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                  <CardHeader>
                    <ImageIcon className="w-12 h-12 mb-4 text-primary" />
                    <CardTitle>Upload Your Menu</CardTitle>
                    <CardDescription>
                      Simply upload your existing menu. Our advanced OCR technology will do the rest.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </MotionDiv>
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative overflow-hidden border-none shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                  <CardHeader>
                    <Zap className="w-12 h-12 mb-4 text-primary" />
                    <CardTitle>Customize & Enhance</CardTitle>
                    <CardDescription>
                      Add images, descriptions, and customize the layout to match your brand.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </MotionDiv>
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="relative overflow-hidden border-none shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                  <CardHeader>
                    <CheckCircle2 className="w-12 h-12 mb-4 text-primary" />
                    <CardTitle>Publish & Delight</CardTitle>
                    <CardDescription>
                      Share your visual menu online or use it in-house to enhance the dining experience.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="w-full py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Plan</h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400 md:text-lg">
                Start free, upgrade as you grow
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <Card className="relative overflow-hidden border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <CardDescription>Perfect for small restaurants</CardDescription>
                  <div className="text-3xl font-bold mt-4">$0</div>
                  <div className="text-sm text-gray-500">Forever free</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Basic menu visualization
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Up to 50 menu items
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Basic analytics
                    </li>
                  </ul>
                  <Button className="w-full mt-6">Get Started</Button>
                </CardContent>
              </Card>
              {/* Pro Plan */}
              <Card className="relative overflow-hidden border-none shadow-lg bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription className="text-primary-foreground/90">For growing businesses</CardDescription>
                  <div className="text-3xl font-bold mt-4">$29</div>
                  <div className="text-sm text-primary-foreground/90">per month</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Everything in Starter
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Unlimited menu items
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Advanced analytics
                    </li>
                  </ul>
                  <Button variant="secondary" className="w-full mt-6">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
              {/* Enterprise Plan */}
              <Card className="relative overflow-hidden border-none shadow-lg">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For restaurant chains</CardDescription>
                  <div className="text-3xl font-bold mt-4">Custom</div>
                  <div className="text-sm text-gray-500">Contact us for pricing</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Everything in Pro
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Custom integrations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                      Dedicated support
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-white dark:bg-gray-900 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">About</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Transforming restaurant menus into visual experiences.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#">Features</Link></li>
                <li><Link href="#">Pricing</Link></li>
                <li><Link href="#">Demo</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#">Documentation</Link></li>
                <li><Link href="#">Contact</Link></li>
                <li><Link href="#">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href="#">Privacy</Link></li>
                <li><Link href="#">Terms</Link></li>
                <li><Link href="#">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 MenuViz. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

