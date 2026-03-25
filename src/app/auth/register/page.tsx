"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Leaf, 
  ArrowRight, 
  UserPlus, 
  Building2, 
  HeartHandshake, 
  ArrowLeft,
  CheckCircle2,
  PieChart,
  Smartphone,
  LineChart,
  Target,
  BellRing
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { registerOrganization } from "@/app/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [formData, setFormData] = useState({
    goal: "",
    email: "",
    orgType: "",
    orgName: "",
    compostable: null as boolean | null,
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    termsAgreed: false,
    language: "English",
    vehicle: "",
    country: "India",
    orgLegalName: "",
    orgEmail: "",
    orgPhone: "",
    orgAddress: "",
    latitude: "",
    longitude: "",
    suiteNumber: ""
  })

  const updateForm = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 6) setStep(s => s + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1)
  }

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const result = await registerOrganization(formData)
      if (result.success) {
        if (formData.goal === "ngo") {
          router.push("/dashboard/ngo")
        } else {
          router.push("/dashboard/business")
        }
      } else {
        setErrorMessage(result.error || "An error occurred during registration.")
        setIsSubmitting(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "A network error occurred.")
      setIsSubmitting(false)
    }
  }

  // Define sidebar content based on step
  const sidebarContent = [
    {
      title: "Centralized Dashboard",
      desc: "Manage donations, partner info, and compliance for multiple locations with ease.",
      icon: <PieChart className="w-24 h-24 text-teal-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-emerald-900 via-teal-900 to-slate-900"
    },
    {
      title: "Mobile App",
      desc: "Empower your team with our mobile app designed for drivers. Easily track, manage, and optimize food pickups.",
      icon: <Smartphone className="w-24 h-24 text-teal-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-teal-900 via-cyan-900 to-slate-900"
    },
    {
      title: "Robust Reporting",
      desc: "Access detailed reports to market your corporate environmental and social responsibility achievements.",
      icon: <LineChart className="w-24 h-24 text-emerald-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-cyan-900 via-blue-900 to-slate-900"
    },
    {
      title: "Preferred Partner Prioritization",
      desc: "Identify and onboard partners that align tightly with your organization's core values.",
      icon: <Target className="w-24 h-24 text-emerald-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-blue-900 via-indigo-900 to-slate-900"
    },
    {
      title: "Smart Alerts",
      desc: "Instant notifications ensure that surplus food and emergent needs are matched perfectly without delay.",
      icon: <BellRing className="w-24 h-24 text-teal-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-indigo-900 via-purple-900 to-slate-900"
    },
    {
      title: "Secure & Compliant",
      desc: "Your data is protected with enterprise-grade security and compliant with all relevant regulations.",
      icon: <CheckCircle2 className="w-24 h-24 text-emerald-300 drop-shadow-xl" strokeWidth={1.5} />,
      color: "from-slate-900 via-emerald-900 to-teal-900"
    }
  ]

  const currentSidebar = sidebarContent[step - 1]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      
      {/* Left Pane - Visual Storytelling */}
      <div className={`hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden transition-colors duration-1000 bg-linear-to-br ${currentSidebar.color}`}>
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Leaf className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <span className="text-3xl font-heading font-bold text-white tracking-tight">SuS-Food</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center max-w-md mx-auto">
          {/* Animated Illustration */}
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-150 animate-pulse-slow"></div>
            <motion.div
              key={step}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative z-10"
            >
              {currentSidebar.icon}
            </motion.div>
          </div>

          <motion.div
            key={`text-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-semibold text-white">
              {currentSidebar.title}
            </h2>
            <p className="text-slate-200 text-lg">
              {currentSidebar.desc}
            </p>
          </motion.div>

          {/* Stepper Dots Indicator */}
          <div className="flex gap-2 mt-12">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div 
                key={s} 
                className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-400/50'}`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-300 text-sm">
          © {new Date().getFullYear()} SuS-Food Network. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Action Area */}
      <div className="w-full md:w-7/12 lg:w-1/2 bg-white flex flex-col justify-center min-h-screen relative shadow-[-20px_0_50px_rgba(0,0,0,0.05)]">
        
        {/* Mobile Header */}
        <div className="md:hidden absolute top-6 left-6 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-600" />
          <span className="text-xl font-heading font-bold text-slate-900">SuS-Food</span>
        </div>

        <div className="max-w-xl w-full mx-auto px-8 md:px-12 lg:px-16 py-12">
          
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`form-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                
                {/* ---------- STEP 1: GOAL SELECTION ---------- */}
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="text-center md:text-left space-y-2">
                      <h1 className="text-3xl font-heading font-bold text-slate-900">Get started today</h1>
                      <p className="text-slate-500">We'd love to know more about your organization.</p>
                    </div>

                    <div className="space-y-4 font-medium">
                      
                      <button 
                        onClick={() => { updateForm("goal", "team"); nextStep(); }}
                        className="w-full relative group text-left flex items-center p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-6 border border-slate-200 group-hover:border-emerald-500/30 group-hover:text-emerald-600 text-slate-400 transition-colors">
                          <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-normal">I'm joining an existing organization</div>
                          <div className="text-xl text-slate-800 group-hover:text-emerald-700 transition-colors">Team Member</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => { updateForm("goal", "ngo"); nextStep(); }}
                        className="w-full relative group text-left flex items-center p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-6 border border-slate-200 group-hover:border-emerald-500/30 group-hover:text-emerald-600 text-slate-400 transition-colors">
                          <HeartHandshake className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-normal">My organization would like to</div>
                          <div className="text-xl text-slate-800 group-hover:text-emerald-700 transition-colors">Rescue food or goods</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => { updateForm("goal", "donor"); nextStep(); }}
                        className="w-full relative group text-left flex items-center p-6 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all overflow-hidden"
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-6 border border-slate-200 group-hover:border-emerald-500/30 group-hover:text-emerald-600 text-slate-400 transition-colors">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 font-normal">My organization would like to</div>
                          <div className="text-xl text-slate-800 group-hover:text-emerald-700 transition-colors">Donate food or goods</div>
                        </div>
                      </button>

                    </div>
                  </div>
                )}

                {/* ---------- STEP 2: EMAIL ---------- */}
                {step === 2 && (
                  <div className="space-y-8 max-w-md mx-auto py-12">
                    <div className="text-center space-y-3">
                      <h1 className="text-3xl font-heading font-bold text-slate-900">Thank you!</h1>
                      <p className="text-slate-500 text-lg">Let's get you set up. Please enter your email address to continue.</p>
                    </div>

                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                          placeholder="you@organization.com"
                          value={formData.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                        />
                      </div>

                      <Button 
                        size="lg" 
                        disabled={!formData.email.includes("@")}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg rounded-xl shadow-sm transition-all"
                        onClick={nextStep}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* ---------- STEP 3: ORG DETAILS ---------- */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div className="text-left space-y-2">
                      <h1 className="text-3xl font-heading font-bold text-slate-900">Organization Details</h1>
                      <p className="text-slate-500">Tell us more about the kind of organization you represent.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2 pt-2">
                        <Label className="text-slate-700 font-medium block mb-3">Organization Type</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={() => updateForm("orgType", "nonprofit")}
                            className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${formData.orgType === 'nonprofit' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <HeartHandshake className={`w-6 h-6 ${formData.orgType === 'nonprofit' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs text-slate-500">We are a</div>
                              <div className={`font-semibold ${formData.orgType === 'nonprofit' ? 'text-emerald-700' : 'text-slate-700'}`}>Nonprofit or Charity</div>
                            </div>
                          </button>
                          
                          <button 
                            onClick={() => updateForm("orgType", "business")}
                            className={`p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${formData.orgType === 'business' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                          >
                            <Building2 className={`w-6 h-6 ${formData.orgType === 'business' ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs text-slate-500">We are a</div>
                              <div className={`font-semibold ${formData.orgType === 'business' ? 'text-emerald-700' : 'text-slate-700'}`}>Business Entity</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {formData.goal === 'ngo' && (
                        <div className="space-y-3 pt-4 border-t border-slate-200">
                          <Label className="text-slate-700 font-medium">Does your organization also rescue animal feed or compostable food waste?</Label>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => updateForm("compostable", true)}
                              className={`flex-1 p-3 rounded-lg border text-center transition-all ${formData.compostable === true ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => updateForm("compostable", false)}
                              className={`flex-1 p-3 rounded-lg border text-center transition-all ${formData.compostable === false ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* ---------- STEP 4: ABOUT YOU ---------- */}
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="text-left space-y-2 pb-2">
                      <h1 className="text-3xl font-heading font-bold text-slate-900">About You</h1>
                      <p className="text-slate-500">Help us get to know you better. Set up your personal profile.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name</Label>
                        <Input 
                          id="firstName" 
                          className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                          placeholder="Jane"
                          value={formData.firstName}
                          onChange={(e) => updateForm("firstName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
                        <Input 
                          id="lastName" 
                          className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => updateForm("lastName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-700 font-medium">Mobile Phone (India)</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        placeholder="+91 81234 56789"
                        value={formData.phone}
                        onChange={(e) => updateForm("phone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailConfirm" className="text-slate-700 font-medium">Email address</Label>
                      <Input 
                        id="emailConfirm" 
                        type="email"
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.email}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-slate-700 font-medium">Preferred language</Label>
                      <Select value={formData.language} onValueChange={(val) => updateForm("language", val)}>
                        <SelectTrigger className="h-12 bg-white text-slate-900">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Hindi">Hindi</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="text-slate-700 font-medium">Vehicle (Optional)</Label>
                      <Select value={formData.vehicle} onValueChange={(val) => updateForm("vehicle", val)}>
                        <SelectTrigger className="h-12 bg-white text-slate-900">
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="car">Car / Sedan</SelectItem>
                          <SelectItem value="suv">SUV / Minivan</SelectItem>
                          <SelectItem value="truck">Truck / Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700 font-medium">Create Password</Label>
                      <Input 
                        id="password" 
                        type="password"
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateForm("password", e.target.value)}
                      />
                      <div className="text-xs text-slate-500 mt-2 flex flex-col gap-1">
                        <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-600' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Should contain at least 8 characters
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Should contain at least 1 uppercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Should contain at least 1 lowercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Should contain at least 1 number
                        </span>
                        <span className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <CheckCircle2 className="w-3 h-3" /> Should contain at least 1 special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------- STEP 5: ABOUT ORGANIZATION ---------- */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="text-left space-y-2 pb-2">
                      <h1 className="text-3xl font-heading font-bold text-slate-900">About Your Organization</h1>
                      <p className="text-slate-500">Tell us a little more about your organization.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-slate-700 font-medium">Country</Label>
                      <Select value={formData.country} onValueChange={(val) => updateForm("country", val)}>
                        <SelectTrigger className="h-12 bg-white text-slate-900">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgNameForm" className="text-slate-700 font-medium">Organization Name</Label>
                      <Input 
                        id="orgNameForm" 
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.orgName}
                        onChange={(e) => updateForm("orgName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgLegalName" className="text-slate-700 font-medium">Organization Legal Name (optional)</Label>
                      <Input 
                        id="orgLegalName" 
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.orgLegalName}
                        onChange={(e) => updateForm("orgLegalName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgEmail" className="text-slate-700 font-medium">Organization Email</Label>
                      <Input 
                        id="orgEmail" 
                        type="email"
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.orgEmail}
                        onChange={(e) => updateForm("orgEmail", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgPhone" className="text-slate-700 font-medium">Organization Phone Number</Label>
                      <Input 
                        id="orgPhone" 
                        type="tel"
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.orgPhone}
                        onChange={(e) => updateForm("orgPhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgAddress" className="text-slate-700 font-medium">Organization Address</Label>
                      <Input 
                        id="orgAddress" 
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.orgAddress}
                        onChange={(e) => updateForm("orgAddress", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude" className="text-slate-700 font-medium">Latitude</Label>
                        <Input 
                          id="latitude" 
                          placeholder="e.g. 12.9716"
                          required
                          className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                          value={formData.latitude}
                          onChange={(e) => updateForm("latitude", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude" className="text-slate-700 font-medium">Longitude</Label>
                        <Input 
                          id="longitude" 
                          placeholder="e.g. 77.5946"
                          required
                          className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                          value={formData.longitude}
                          onChange={(e) => updateForm("longitude", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="suiteNumber" className="text-slate-700 font-medium">Suite Number (optional)</Label>
                      <Input 
                        id="suiteNumber" 
                        className="h-12 bg-white border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-slate-900" 
                        value={formData.suiteNumber}
                        onChange={(e) => updateForm("suiteNumber", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* ---------- STEP 6: TERMS ---------- */}
                {step === 6 && (
                  <div className="space-y-8 max-w-md mx-auto py-12">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h1 className="text-3xl font-heading font-bold text-slate-900">Almost done!</h1>
                      <p className="text-slate-500">Review the terms of service and finish setting up your account.</p>
                      
                      {errorMessage && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 shadow-sm text-left flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{errorMessage}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="terms" 
                          checked={formData.termsAgreed}
                          onCheckedChange={(checked) => updateForm("termsAgreed", checked as boolean)}
                          className="mt-1 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="space-y-1 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-normal text-slate-600 cursor-pointer"
                          >
                            I accept the <Link href="#" className="text-emerald-600 font-semibold hover:underline">Terms of Service</Link> and acknowledge the <Link href="#" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link>.
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      disabled={!formData.termsAgreed || isSubmitting}
                      className={`w-full h-14 font-medium text-lg rounded-xl transition-all ${formData.termsAgreed ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20' : ''}`}
                      variant={formData.termsAgreed ? "default" : "secondary"}
                      onClick={handleComplete}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation & Links */}
          <div className="mt-12 flex flex-col gap-6">
            {/* Numbered Stepper */}
            {step > 1 && (
              <div className="flex items-center justify-center w-full px-4 mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((item, index) => {
                    const isActive = step - 1 === item;
                    const isCompleted = step - 1 > item;
                    return (
                      <div key={item} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white transition-colors duration-300 shadow-sm ${isActive || isCompleted ? 'bg-[#3e8d7b]' : 'bg-[#9ea6af]'}`}>
                          {item}
                        </div>
                        {index < 4 && (
                          <div className={`w-6 sm:w-10 h-[2px] mx-2 transition-colors duration-300 ${isCompleted ? 'bg-[#3e8d7b]' : 'bg-[#e5e7eb]'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              {step > 1 ? (
                <Button 
                  variant="ghost" 
                  onClick={prevStep}
                  className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div /> // Placeholder for layout
              )}

              {step > 2 && step < 6 ? (
                <Button 
                  onClick={nextStep}
                  disabled={
                    (step === 3 && (!formData.orgType || (formData.goal === "ngo" && formData.compostable === null))) ||
                    (step === 4 && (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim() || formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password))) ||
                    (step === 5 && (!formData.orgName.trim() || !formData.orgEmail.trim() || !formData.orgPhone.trim() || !formData.orgAddress.trim() || !formData.country))
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              ) : (
                <div /> // Handled by inline buttons in specific steps
              )}
            </div>

            <div className="text-center text-sm text-slate-500">
              Already have an account? <Link href="/auth" className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4">Login.</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
