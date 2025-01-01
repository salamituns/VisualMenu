import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Edit, Eye, Utensils } from 'lucide-react'

export default function GetStartedPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Utensils className="h-6 w-6 mr-2" />
          <span className="font-bold">MenuViz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Help Center
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact Support
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Get Started with MenuViz
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Follow these simple steps to create your first visual menu and transform your dining experience.
            </p>
          </div>
          <Tabs defaultValue="account" className="max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">1. Create Account</TabsTrigger>
              <TabsTrigger value="upload">2. Upload Menu</TabsTrigger>
              <TabsTrigger value="customize">3. Customize</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Account</CardTitle>
                  <CardDescription>Enter your details to create your MenuViz account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name</Label>
                    <Input id="name" placeholder="Enter your restaurant's name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Enter your email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" placeholder="Create a password" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Create Account</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Menu</CardTitle>
                  <CardDescription>Upload your existing menu or create a new one from scratch.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="menu-file">Upload Menu File</Label>
                    <Input id="menu-file" type="file" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-500">or</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="menu-text">Enter Menu Text</Label>
                    <Textarea id="menu-text" placeholder="Type or paste your menu here..." />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" /> Upload Menu
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="customize">
              <Card>
                <CardHeader>
                  <CardTitle>Customize Your Visual Menu</CardTitle>
                  <CardDescription>Enhance your menu with images, descriptions, and custom styling.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" /> Edit Items
                    </Button>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" /> Add Images
                    </Button>
                    <Button variant="outline">
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Choose a Theme</Label>
                    <select id="theme" className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Classic</option>
                      <option>Modern</option>
                      <option>Rustic</option>
                      <option>Elegant</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Finish & Publish</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
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

