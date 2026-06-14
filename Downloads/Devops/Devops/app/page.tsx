"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Phone, Mail, MapPin, PawPrint, ChevronRight, Stethoscope, Home as HomeIcon, HeartHandshake, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/70 backdrop-blur-md shadow-sm border-b border-border/50 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-3xl bg-primary/20 p-2 rounded-xl text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/30">
              <PawPrint size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">CARE</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">
                Rescue Centre
              </p>
            </div>
          </Link>

          <div className="flex gap-4 items-center">
            <Link
              href="/visitor"
              className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors hidden md:block"
            >
              Visit Shelter
            </Link>
            <Link
              href="/declaration"
              className="text-sm font-semibold text-foreground/80 hover:text-secondary transition-colors hidden md:block mr-4"
            >
              Relinquish Pet
            </Link>
            <Link
              href="/visitor"
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(251,203,4,0.39)] hover:shadow-[0_6px_20px_rgba(251,203,4,0.23)] transition-all hover:-translate-y-0.5"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        
        {/* Dynamic Split Hero Section */}
        <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center mb-32">
          <div className="space-y-8 relative z-10 pt-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary w-max">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">Over 10,000 Animals Saved</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-foreground">
              A second chance at <span className="text-primary relative whitespace-nowrap">
                life & love.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
              </span>
            </h1>
            
            <p className="text-lg text-foreground/70 leading-relaxed max-w-lg">
              Charlie's Animal Rescue Centre is dedicated to rescuing, rehabilitating, and rehoming animals in need. Join us in building a compassion-driven world.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/visitor"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transform hover:-translate-y-1 transition-all"
              >
                Adopt a Pet
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/declaration"
                className="flex items-center justify-center px-8 py-4 bg-white text-foreground border border-border rounded-full font-bold text-lg hover:border-secondary hover:text-secondary hover:bg-secondary/5 transform hover:-translate-y-1 transition-all"
              >
                Report Rescue
              </Link>
            </div>
            
            <div className="pt-8 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Supporter" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="text-foreground font-bold">5,000+</span><br/>
                <span className="text-muted-foreground">monthly supporters</span>
              </div>
            </div>
          </div>
          
          <div className="relative lg:h-[600px] h-[400px] rounded-[2rem] overflow-hidden shadow-2xl group">
             <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none"></div>
             <Image 
               src="/hero_rescue_dog.png"
               alt="A happy rescue dog with a volunteer"
               fill
               className="object-cover transition-transform duration-700 group-hover:scale-105"
               priority
             />
             <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-white shadow-lg flex items-center gap-4">
                <div className="bg-primary p-3 rounded-full text-primary-foreground flex-shrink-0">
                  <Heart size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight mb-1">Meet Charlie</h4>
                  <p className="text-sm opacity-90 leading-tight">Ready for his forever home after 3 weeks of care.</p>
                </div>
             </div>
          </div>
        </section>

        {/* Services - Glassy Modern Cards */}
        <section className="bg-white/40 border-y border-border/50 py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-black text-foreground mb-4">Comprehensive Care</h2>
              <p className="text-muted-foreground text-lg">We provide everything an animal needs from the moment they are rescued until they find their forever home.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Stethoscope size={32} />,
                  color: "bg-primary text-primary-foreground",
                  bg: "bg-primary/5",
                  border: "hover:border-primary/30",
                  title: "Medical Care",
                  description: "Professional veterinary care, surgeries, and vaccinations for all our rescue animals."
                },
                {
                  icon: <HomeIcon size={32} />,
                  color: "bg-secondary text-secondary-foreground",
                  bg: "bg-secondary/5",
                  border: "hover:border-secondary/30",
                  title: "Safe Shelter",
                  description: "Comfortable, climate-controlled environments and nutritious meals for every animal."
                },
                {
                  icon: <HeartHandshake size={32} />,
                  color: "bg-[#1E314D] text-white",
                  bg: "bg-[#1E314D]/5",
                  border: "hover:border-[#1E314D]/30",
                  title: "Rehabilitation",
                  description: "Behavioral training, socialization, and physical rehabilitation programs."
                },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className={`group bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-2 border border-border/60 ${service.border} relative overflow-hidden`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${service.bg} rounded-full blur-[40px] -mr-16 -mt-16 transition-all group-hover:scale-150`}></div>
                  <div className={`w-16 h-16 rounded-2xl ${service.color} flex items-center justify-center mb-6 shadow-md relative z-10`}>
                    {service.icon}
                  </div>
                  <h3 className="font-bold text-2xl text-foreground mb-3 relative z-10">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed relative z-10">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats Banner */}
        <section className="bg-[#1E314D] py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
              {[
                { label: "Animals Rescued", value: "10K+" },
                { label: "Successful Adoptions", value: "8,500" },
                { label: "Dedicated Volunteers", value: "240" },
                { label: "Years of Service", value: "15" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center px-4">
                  <div className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-primary/90 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 lg:p-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-[1.1]">
                Why Trust <span className="text-secondary">CARE</span>?
              </h2>
              <p className="text-lg text-muted-foreground">
                We believe in transparency, unparalleled medical standards, and ensuring every animal receives individualized attention before adoption.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Expert Veterinary Team", icon: ShieldCheck },
                  { title: "Transparent Adoption Process", icon: Heart },
                  { title: "24/7 Emergency Care", icon: Clock }
                ].map((point, idx) => (
                  <div key={idx} className="flex gap-4 items-center group">
                    <div className="bg-secondary/10 p-3 rounded-full text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                      <point.icon size={24} />
                    </div>
                    <span className="text-xl font-bold text-foreground">{point.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 relative">
               <div className="aspect-square rounded-[3rem] overflow-hidden bg-muted relative">
                  <Image src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80" alt="Happy dogs running" fill className="object-cover" />
               </div>
               <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-border mt-4">
                  <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center text-primary-foreground font-bold">
                    100%
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Non-Profit</h4>
                    <p className="text-sm text-muted-foreground">All funds go to care.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1E314D] text-white pt-20 pb-10 border-t-4 border-primary relative overflow-hidden">
        {/* Wavy top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16 relative z-10">
          <div className="md:col-span-1">
            <h3 className="font-black text-3xl mb-6 flex items-center gap-2 text-white">
              <PawPrint className="text-primary" size={32} /> CARE
            </h3>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Charlie's Animal Rescue Centre - A sanctuary dedicated to the well-being and protection of stray and abandoned animals.
            </p>
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors cursor-pointer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-colors cursor-pointer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <div className="space-y-4 text-white/80">
              <div className="flex items-start gap-3">
                <Phone className="text-secondary mt-1" size={18} />
                <span>+91 90359 99372<br/>+91 81230 38270</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-secondary" size={18} />
                <span>info@charlies-care.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="text-secondary mt-1" size={18} />
                <span className="leading-tight">Survey No. 124/1, <br/>Kogilu Village, Yelahanka, <br/>Bangalore - 560064</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3 text-white/80">
              <li><Link href="/visitor" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight size={14}/> Visit Shelter</Link></li>
              <li><Link href="/declaration" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight size={14}/> Report Rescue</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight size={14}/> About Us</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight size={14}/> Donate Now</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-bold text-lg mb-6">Newsletter</h4>
             <p className="text-sm text-white/70 mb-4">Subscribe for updates on rescues and adoptions.</p>
             <div className="flex">
                <input type="email" placeholder="Your email address" className="bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-l-lg px-4 py-3 w-full focus:outline-none focus:border-primary" />
                <button className="bg-primary text-primary-foreground font-bold px-4 py-3 rounded-r-lg hover:bg-primary/90 transition-colors">
                  Join
                </button>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-sm text-white/50">
          <p>© {new Date().getFullYear()} Charlie's Animal Rescue Centre. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
