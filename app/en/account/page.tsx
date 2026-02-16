"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Loader2, Clock, InfoIcon, Phone, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({ phone: "", password: "" })
  const [registerData, setRegisterData] = useState({
    storeName: "",
    companyName: "",
    customerType: "standard",
    phone: "",
    password: "",
    confirmPassword: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [pendingMessage, setPendingMessage] = useState("")

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "register" || tab === "login") {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
    if (loginError) setLoginError(null)
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
    if (registerError) setRegisterError(null)
  }

  const handleRegisterSelectChange = (value: string) => {
    setRegisterData((prev) => ({ ...prev, customerType: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setIsPendingApproval(false)

    if (!loginData.phone || !loginData.password) {
      setLoginError("Please fill in all fields")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginData.phone, password: loginData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.pending) {
          setIsPendingApproval(true)
          setPendingMessage(data.message || "Please wait for administrator approval.")
        } else {
          setLoginError(data.error || "Incorrect phone number or password.")
        }
        return
      }
      toast({ title: "Login successful!", description: "Redirecting..." })
      router.push("/en/account/dashboard")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setLoginError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)

    if (!registerData.storeName || !registerData.phone || !registerData.password) {
      setRegisterError("Please fill in all required fields (Name, Phone, Password).")
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("Passwords do not match.")
      return
    }
    if (registerData.password.length < 6) {
      setRegisterError("Password must be at least 6 characters.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: registerData.storeName,
          companyName: registerData.companyName || null,
          phone: registerData.phone,
          email: registerData.email || null, // Send null if empty
          customerType: registerData.customerType,
          password: registerData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setRegisterError(data.error || "An error occurred during registration.")
        return
      }

      if (data.pending === false) {
        toast({
          title: "Registration successful!",
          description: "Logging you in...",
        })
        window.location.reload()
      } else if (data.pending === true) {
        setShowConfirmDialog(true)
        setRegisterData({
          storeName: "",
          companyName: "",
          customerType: "standard",
          phone: "",
          password: "",
          confirmPassword: "",
          email: "",
        })
      } else {
        setRegisterError("Registration successful, but approval status is unclear.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setRegisterError("An error occurred during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setShowConfirmDialog(false)
    setActiveTab("login")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-700 sticky top-0 z-50">
        <div className="container mx-auto pl-0 pr-4 py-2">
          <div className="flex items-center justify-between">
            <Link href="/en" className="flex items-center ml-0">
              <div className="relative h-12 w-36 ml-2">
                <Image
                  src="/images/design-mode/madix.png"
                  alt="Madix Groundbaits"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <div className="hidden md:flex flex-1 mx-8">{/* Search bar */}</div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/en/contact"
                className="text-sm font-medium text-gray-300 hover:text-yellow-400 transition-colors flex items-center gap-1"
              >
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <Link href="/en/account">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-yellow-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/en/cart">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-yellow-400 relative">
                  {/* Cart Icon SVG and count */}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="login" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription className="text-gray-400">Login to your account to continue</CardDescription>
                </CardHeader>
                <CardContent>
                  {loginError && (
                    <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800 text-white">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login Error</AlertTitle>
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  {isPendingApproval && (
                    <Alert className="mb-4 bg-yellow-900 border-yellow-800 text-white">
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Awaiting Approval</AlertTitle>
                      <AlertDescription>{pendingMessage}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone">Phone Number</Label>
                      <Input
                        id="login-phone"
                        name="phone"
                        type="tel"
                        value={loginData.phone}
                        onChange={handleLoginChange}
                        placeholder="Enter phone number"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                        autoComplete="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Enter password"
                          className="bg-gray-700 border-gray-600 text-white pr-10"
                          required
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showLoginPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-gray-800 border-gray-700 text-white">
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription className="text-gray-400">Create a new account</CardDescription>
                </CardHeader>
                <CardContent>
                  {registerError && (
                    <Alert variant="destructive" className="mb-4 bg-red-900 border-red-800 text-white">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Registration Error</AlertTitle>
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  <Alert className="mb-4 bg-blue-900 border-blue-800 text-white">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Standard customers get access immediately. Other customer types await administrator approval.
                    </AlertDescription>
                  </Alert>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-storeName">Name *</Label>
                      <Input
                        id="register-storeName"
                        name="storeName"
                        value={registerData.storeName}
                        onChange={handleRegisterChange}
                        placeholder="Name"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-companyName">Company</Label>
                      <Input
                        id="register-companyName"
                        name="companyName"
                        value={registerData.companyName}
                        onChange={handleRegisterChange}
                        placeholder="Company name (optional)"
                        className="bg-gray-700 border-gray-600 text-white"
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="your@email.com (optional)"
                        className="bg-gray-700 border-gray-600 text-white"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Phone *</Label>
                      <Input
                        id="register-phone"
                        name="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        placeholder="0888123456"
                        className="bg-gray-700 border-gray-600 text-white"
                        required
                        autoComplete="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-customerType">Type *</Label>
                      <Select value={registerData.customerType} onValueChange={handleRegisterSelectChange}>
                        <SelectTrigger id="register-customerType" className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                          <SelectItem value="standard">Standard Customer</SelectItem>
                          <SelectItem value="retailer">Retailer (requires approval)</SelectItem>
                          <SelectItem value="wholesaler">Wholesaler (requires approval)</SelectItem>
                          <SelectItem value="european">European Customer (requires approval)</SelectItem>
                        </SelectContent>
                      </Select>
                      {registerData.customerType !== "standard" && (
                        <p className="text-sm text-gray-400 mt-1">This account type requires administrator approval.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showRegisterPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Minimum 6 characters"
                          className="bg-gray-700 border-gray-600 text-white pr-10"
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showRegisterPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirmPassword">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="register-confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Confirm password"
                          className="bg-gray-700 border-gray-600 text-white pr-10"
                          required
                          autoComplete="new-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Registration Submitted!</DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              Your registration request has been received.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="rounded-full bg-green-700 p-3">
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-medium text-lg">Awaiting Account Approval</h3>
              <p className="text-sm text-gray-400">
                Your account will be activated after administrator approval. You will be able to login to the system
                after that.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseDialog} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
