"use client"

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Leaf, 
  HeartHandshake, 
  Building2, 
  Recycle, 
  ShieldCheck, 
  Clock, 
  LineChart, 
  Radio, 
  Receipt,
  Quote,
  CheckCircle2
} from "lucide-react";

// CountUp Hook for statistics
function useCountUp(end: number, duration: number = 2000, suffix: string = "") {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return { ref: countRef, value: `${count.toLocaleString()}${suffix}` };
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stats1 = useCountUp(12500, 2500, "+"); // Meals
  const stats2 = useCountUp(3125, 2500, " kg"); // CO2
  const stats3 = useCountUp(150, 2500, "+"); // Partners
  const stats4 = useCountUp(45, 2500, "L+"); // Tax saved

  return (
    <div className="flex flex-col min-h-dvh bg-slate-50 text-slate-900 overflow-hidden">
      {/* Dynamic Navbar */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 shrink-0 ${
          isScrolled ? "h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm" : "h-20 bg-transparent border-transparent"
        } px-6 flex items-center`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link className="flex items-center justify-center gap-2 group" href="/">
            <div className="relative">
              <Leaf className="h-7 w-7 text-emerald-600 relative z-10 transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform"></div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight font-heading bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              SuS-Food
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Impact</a>
          </nav>

          <nav className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="hidden sm:flex hover:bg-slate-100 hover:text-emerald-600 font-medium">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all rounded-full px-6 font-medium">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center">
          {/* Ambient Background Effects */}
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-teal-100 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Join 150+ partners fighting food waste
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl/none font-extrabold tracking-tighter font-heading text-slate-900">
                  Turn <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Surplus Food</span> into Sustenance
                </h1>
                <p className="max-w-[600px] text-slate-600 text-lg md:text-xl leading-relaxed">
                  Careit makes food donation simple. Connect your business with local nonprofits, reduce waste, fight hunger, and earn tax deductions—all in one smart platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-14 px-8 text-base shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                      Start Donating <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 rounded-full h-14 px-8 text-base border-slate-300 text-slate-700 bg-white hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative mx-auto w-full max-w-[500px] aspect-square animate-fade-in-up delay-200">
                {/* Abstract Data/Food Composition */}
                <div className="absolute inset-0 bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden transform rotate-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent"></div>
                  
                  {/* Floating Elements */}
                  <div className="absolute top-8 left-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">Fresh Market Banquets</div>
                        <div className="text-xs text-slate-500">15kg Prepared Meals Listed</div>
                      </div>
                      <Badge className="ml-auto bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Just Now</Badge>
                    </div>
                  </div>

                  <div className="absolute bottom-24 left-8 right-16 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)] transform rotate-3 hover:rotate-0 transition-transform z-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <HeartHandshake className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">City Hope Shelter</div>
                        <div className="text-xs text-slate-500">Claimed 15kg Donation</div>
                      </div>
                      <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                    </div>
                  </div>

                  {/* Decorative curved line connecting them */}
                  <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
                    <path d="M 120 100 Q 150 250 150 350" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" className="animate-[pulse_3s_ease-in-out_infinite]" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="border-y border-slate-200 bg-white py-12 relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
              <div className="space-y-2">
                <div ref={stats1.ref} className="text-4xl md:text-5xl font-extrabold font-heading text-emerald-600">{stats1.value}</div>
                <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">Meals Served</div>
              </div>
              <div className="space-y-2">
                <div ref={stats2.ref} className="text-4xl md:text-5xl font-extrabold font-heading text-teal-600">{stats2.value}</div>
                <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">CO₂ Avoided</div>
              </div>
              <div className="space-y-2">
                <div ref={stats3.ref} className="text-4xl md:text-5xl font-extrabold font-heading text-amber-500">{stats3.value}</div>
                <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">Partner NGOs</div>
              </div>
              <div className="space-y-2">
                <div ref={stats4.ref} className="text-4xl md:text-5xl font-extrabold font-heading text-emerald-600">₹{stats4.value}</div>
                <div className="text-sm md:text-base font-medium text-slate-500 uppercase tracking-wider">Tax Saved</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 relative bg-slate-50">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900">How It <span className="text-emerald-600">Works</span></h2>
              <p className="text-lg text-slate-600">A seamless flow from surplus to sustenance. We handle the logistics and compliance so you can focus on the impact.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent border-t-2 border-dashed border-emerald-300 -z-10"></div>
              
              <div className="bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 text-center relative">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 text-emerald-600 font-heading text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Snap & List</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Enter your surplus food details. Our smart system categorizes it and calculates saftey windows instantly.</p>
              </div>

              <div className="bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 text-center relative md:mt-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 text-emerald-600 font-heading text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Match</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Verified local NGOs are notified immediately. They claim the food based on their specific community needs.</p>
              </div>

              <div className="bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 text-center relative">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 text-emerald-600 font-heading text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Track & Deduct</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Food is collected safely. You receive automated tax receipts and detailed CO₂ reduction impact reports.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

        {/* FEATURES GRID */}
        <section id="features" className="py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900 max-w-2xl">
                Everything You Need to <br/><span className="text-emerald-600">Donate with Confidence</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Liability Protection</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Full Good Samaritan Act compliance protects your business. Donate confidently knowing you are legally covered.</p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Automatic Tax Receipts</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Get documented receipts for every donation with itemized values. Maximize tax benefits with zero paperwork.</p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Impact Reporting</h3>
                <p className="text-slate-600 text-sm leading-relaxed">See exactly where your food goes. Track pounds diverted, CO₂ avoided, and meals served for ESG goals.</p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Expiry Tracking</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Algorithmic safety windows ensure food is only claimed and consumed while it is perfectly safe and fresh.</p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Radio className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">SOS Radar System</h3>
                <p className="text-slate-600 text-sm leading-relaxed">NGOs can broadcast urgent needs directly to nearby donors when shelters run dangerously low on supplies.</p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-slate-50 border border-slate-200 p-8 rounded-3xl hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Recycle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Reduced Waste Costs</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Divert food from the dumpster and lower your waste hauling fees. Many businesses save thousands annually.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24 bg-slate-50">
          <div className="container px-4 md:px-6">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold font-heading text-slate-900">Real Results, <span className="text-emerald-600">Real Impact</span></h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white border-y border-r border-slate-200 border-l-4 border-l-emerald-500 p-8 rounded-r-2xl shadow-sm relative">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-100" />
                <p className="text-slate-600 italic mb-6">"SuS-Food has played a pivotal role in scaling our rescue operations. The real-time alerts ensure we never miss high-quality prepared meals for our evening service."</p>
                <div>
                  <div className="font-bold text-slate-900">Sarah Jenkins</div>
                  <div className="text-sm text-emerald-600">Director, City Hope Shelter</div>
                </div>
              </div>

              <div className="bg-white border-y border-r border-slate-200 border-l-4 border-l-amber-500 p-8 rounded-r-2xl shadow-sm relative">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-100" />
                <p className="text-slate-600 italic mb-6">"Our goal was reducing waste by 50%. In just 6 months using this platform across our 3 banquet halls, we've diverted 5,000kg of food and drastically cut disposal fees."</p>
                <div>
                  <div className="font-bold text-slate-900">Marcus Thorne</div>
                  <div className="text-sm text-amber-600">Ops Manager, Fresh Market Banquets</div>
                </div>
              </div>

              <div className="bg-white border-y border-r border-slate-200 border-l-4 border-l-emerald-500 p-8 rounded-r-2xl shadow-sm relative">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-100" />
                <p className="text-slate-600 italic mb-6">"The automated tax receipts alone make this worth it. We just snap a photo at the end of the shift, an NGO picks it up, and our documentation is handled automatically."</p>
                <div>
                  <div className="font-bold text-slate-900">Elena Rostova</div>
                  <div className="text-sm text-emerald-600">Owner, The Daily Bakehouse</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA CTA */}
        <section className="py-24 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(16,185,129,0.2)]">
              {/* Decorative background vectors */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-300 rounded-full blur-[80px]"></div>
              </div>

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight">
                  Start Donating Surplus Food Today
                </h2>
                <p className="text-emerald-50 text-lg md:text-xl">
                  Join 15,000+ businesses already reducing waste and making an impact in their communities. Zero implementation fees.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 rounded-full h-14 px-8 text-base shadow-xl hover:scale-105 transition-all font-bold">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-base border-white/50 text-white hover:bg-white/10 hover:border-white transition-all bg-transparent backdrop-blur-sm">
                      Log in as NGO
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2 space-y-4">
              <Link className="flex items-center gap-2 group" href="/">
                <Leaf className="h-6 w-6 text-emerald-600 group-hover:rotate-12 transition-transform" />
                <span className="font-extrabold text-xl tracking-tight font-heading text-slate-900">SuS-Food</span>
              </Link>
              <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
                A smart B2B platform connecting food donors with NGOs to solve hunger and promote responsible consumption. Together, we can eliminate food waste.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Platform</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-600">
                <Link href="/auth/register" className="hover:text-emerald-600 transition-colors">For Food Donors</Link>
                <Link href="/auth/register" className="hover:text-emerald-600 transition-colors">For Nonprofits</Link>
                <Link href="#" className="hover:text-emerald-600 transition-colors">For Corporations</Link>
                <Link href="#" className="hover:text-emerald-600 transition-colors">Tax Benefits Guide</Link>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Resources</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-600">
                <Link href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</Link>
                <Link href="#testimonials" className="hover:text-emerald-600 transition-colors">Impact Stories</Link>
                <Badge className="w-max bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-sm mt-2">System Status: Operative</Badge>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Company</h4>
              <nav className="flex flex-col gap-3 text-sm text-slate-600">
                <Link href="#" className="hover:text-emerald-600 transition-colors">About Us</Link>
                <Link href="#" className="hover:text-emerald-600 transition-colors">Contact Support</Link>
                <Link href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
              </nav>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} SuS-Food Network. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-700 cursor-pointer transition-colors">Designed with purpose.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

