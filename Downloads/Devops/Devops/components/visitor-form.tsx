"use client";

import { useState } from "react";
import { ChevronLeft, Home, Calendar, ShieldAlert, HeartHandshake, CameraOff, IndianRupee, AlertTriangle, FileSignature, MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import FormInput from "./form-input";
import FormCheckbox from "./form-checkbox";
import SignaturePad from "./signature-pad";
import PhoneNumberField from "./phone-number-field";

interface VisitorFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  numberOfVisitors: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  howHeardAbout: string;
  date: string;
  guide: string;
  signature: string;
  consent: boolean;
}

export default function VisitorForm({ onBack }: VisitorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    numberOfVisitors: "1",
    address: "",
    countryCode: "+91",
    phone: "",
    email: "",
    howHeardAbout: "",
    date: "",
    guide: "",
    signature: "",
    consent: true,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.numberOfVisitors)
      newErrors.numberOfVisitors = "Required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.countryCode.trim())
      newErrors.countryCode = "Country code is required";
    if (!/^\+\d{1,4}$/.test(formData.countryCode.trim()))
      newErrors.countryCode = "Use format like +91";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^[\d\-\(\)\s]+$/.test(formData.phone))
      newErrors.phone = "Invalid phone format";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email address";
    if (!formData.howHeardAbout)
      newErrors.howHeardAbout = "Please select an option";
    if (!formData.date) newErrors.date = "Select a date";
    if (!formData.signature.trim())
      newErrors.signature = "Please provide your signature above";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/forms/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit form");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: "", numberOfVisitors: "1", address: "", countryCode: "+91", phone: "", email: "",
          howHeardAbout: "", date: "", guide: "", signature: "", consent: true,
        });
      }, 7000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to submit form",
      });
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen pt-20 px-4 animate-in fade-in duration-700 bg-background">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-16 md:p-24 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-white text-center space-y-10 relative overflow-hidden w-full max-w-4xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: "1s"}} />
          
          <div className="relative z-10 w-32 h-32 bg-gradient-to-tr from-green-400 to-green-300 rounded-[2rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-green-500/30 transform rotate-3">
            <Sparkles className="w-16 h-16 text-white absolute -top-4 -right-4 animate-bounce" />
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_1s_ease-out_forwards]" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              Expect a warm <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">welcome!</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Your visit request is confirmed. We can't wait to show you around CARE and introduce you to our wonderful rescues.
            </p>
          </div>
          
          <div className="relative z-10 pt-10">
            <button
              onClick={onBack}
              className="px-12 py-5 bg-foreground text-background rounded-full font-black text-xl hover:shadow-2xl hover:scale-105 hover:bg-black transition-all duration-300 shadow-xl shadow-foreground/20"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen animate-in fade-in duration-700 bg-background">
      
      {/* PERFECT SPLIT SCREEN - LEFT SIDE */}
      <div className="lg:w-5/12 relative lg:fixed lg:inset-y-0 lg:left-0 flex flex-col p-8 lg:p-16 overflow-hidden min-h-[50vh] lg:min-h-screen">
        {/* Background Image with Cinematic Overlay */}
        <div className="absolute inset-0 bg-[url('/visitor-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[#1E314D]/90 to-[#1E314D]/40 backdrop-blur-[2px]" />
        
        {/* Content - Aligned to top/center instead of bottom */}
        <div className="relative z-20 space-y-8 w-full max-w-xl mx-auto lg:mx-0 pt-16 lg:pt-32">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-4 drop-shadow-lg">
              Schedule <br/>A Visit.
            </h1>
            <p className="text-lg lg:text-xl text-white/90 font-medium leading-relaxed max-w-md drop-shadow-md">
              We love welcoming visitors! Please review our guidelines to ensure a safe and happy visit for both you and our animals.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-10 border border-white/20 text-white relative overflow-hidden shadow-2xl">
             <h3 className="font-bold text-2xl flex items-center gap-4 mb-8 text-white">
               <div className="p-3 bg-white/20 backdrop-blur rounded-2xl text-primary drop-shadow-sm"><AlertTriangle size={24} /></div>
               Shelter Rules
             </h3>
             <ul className="space-y-6 text-white/95 font-medium text-sm lg:text-base">
               <li className="flex gap-4 items-start group/item">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_8px_var(--primary)]" />
                 <span className="leading-relaxed"><strong className="text-white block text-lg mb-1 drop-shadow-sm">Sanitization First</strong> Use our provided hand sanitizers before entering different enclosures.</span>
               </li>
               <li className="flex gap-4 items-start group/item">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-destructive flex-shrink-0 group-hover/item:scale-150 shadow-[0_0_10px_var(--destructive)] transition-transform" />
                 <span className="leading-relaxed"><strong className="text-white block text-lg mb-1 drop-shadow-sm">Red Collars = Caution</strong> Animals wearing red collars are currently moody or undergoing training. Give them space.</span>
               </li>
               <li className="flex gap-4 items-start group/item">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_8px_var(--primary)]" />
                 <span className="leading-relaxed"><strong className="text-white block text-lg mb-1 drop-shadow-sm">Let Them Approach</strong> Allow animals to come to you naturally rather than forcing interaction.</span>
               </li>
             </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-5 lg:p-6 border border-white/10 flex border-b-4 border-b-destructive/50 flex-col items-center justify-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
               <div className="p-4 bg-destructive/30 text-white rounded-[1.5rem]">
                 <CameraOff size={28} />
               </div>
               <p className="text-sm font-bold text-white drop-shadow-sm">No Photography</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-5 lg:p-6 border border-white/10 flex border-b-4 border-b-primary/50 flex-col items-center justify-center text-center gap-4 hover:-translate-y-2 transition-transform duration-300">
               <div className="p-4 bg-primary/30 text-white rounded-[1.5rem]">
                 <HeartHandshake size={28} strokeWidth={2.5}/>
               </div>
               <p className="text-sm font-bold text-white drop-shadow-sm">Do Not Feed</p>
            </div>
          </div>
        </div>
      </div>

      {/* PERFECT SPLIT SCREEN - RIGHT SIDE (The Form) */}
      <div className="lg:w-7/12 lg:ml-[41.666667%] w-full">
        {/* We add pt-32 here to account for the transparent fixed navigation bar */}
        <div className="max-w-3xl mx-auto px-6 py-12 lg:pt-32 lg:pb-24">
          <button
            onClick={onBack}
            className="group flex items-center gap-3 text-muted-foreground hover:text-foreground mb-12 font-bold transition-colors w-max"
          >
            <div className="bg-white/80 backdrop-blur border border-border p-3 rounded-full shadow-sm group-hover:shadow-md group-hover:-translate-x-1 transition-all">
              <ChevronLeft size={20} />
            </div>
            Return Home
          </button>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Personal Info */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Personal Details</h2>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xl">1</div>
              </div>

              <div className="space-y-4">
                <FormInput
                  label="Full Legal Name"
                  value={formData.fullName}
                  onChange={(value) => setFormData({ ...formData, fullName: value })}
                  error={errors.fullName}
                  required
                />
                
                <FormInput
                  label="Number of Visiting Group Members"
                  type="number"
                  value={formData.numberOfVisitors}
                  onChange={(value) => setFormData({ ...formData, numberOfVisitors: value })}
                  min="1"
                  error={errors.numberOfVisitors}
                  required
                />

                <FormInput
                  label="Complete Residential Address"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  error={errors.address}
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <PhoneNumberField
                      countryCode={formData.countryCode}
                      phone={formData.phone}
                      onCountryCodeChange={(value) =>
                        setFormData({ ...formData, countryCode: value })
                      }
                      onPhoneChange={(value) =>
                        setFormData({ ...formData, phone: value })
                      }
                      countryCodeError={errors.countryCode}
                      phoneError={errors.phone}
                    />
                  </div>
                  <FormInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                    error={errors.email}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Visit Details */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-secondary to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Visit Schedule</h2>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xl">2</div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative z-20">
                     <FormInput
                      label="Preferred Date"
                      type="date"
                      value={formData.date}
                      onChange={(value) => setFormData({ ...formData, date: value })}
                      error={errors.date}
                      required
                    />
                  </div>

                  <FormInput
                    label="Preferred Guide"
                    value={formData.guide}
                    onChange={(value) => setFormData({ ...formData, guide: value })}
                    placeholder="(Optional)"
                  />
                </div>

                <div className="relative group w-full mb-2 z-10">
                  <select
                    value={formData.howHeardAbout}
                    onChange={(e) => setFormData({ ...formData, howHeardAbout: e.target.value })}
                    className={`peer w-full px-5 pb-3 pt-7 rounded-2xl border-2 transition-all duration-300 outline-none font-medium text-foreground bg-white/70 backdrop-blur-sm focus:bg-white hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] appearance-none cursor-pointer
                      ${errors.howHeardAbout 
                        ? 'border-destructive/40 focus:border-destructive ring-4 ring-transparent focus:ring-destructive/10' 
                        : 'border-border/60 hover:border-primary/40 focus:border-primary ring-4 ring-transparent focus:ring-primary/15'
                      }`}
                  >
                    <option value="" disabled hidden></option>
                    <option value="social-media">Social Media (Instagram, Facebook)</option>
                    <option value="word-of-mouth">Word of Mouth</option>
                    <option value="website">Website</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="friend">Friend / Family</option>
                    <option value="other">Other</option>
                  </select>
                  <label 
                    className={`absolute left-5 origin-[0] transition-all duration-300 pointer-events-none z-10 top-5 -translate-y-3.5 scale-[0.8] font-bold tracking-wide
                      ${errors.howHeardAbout ? 'text-destructive focus:text-destructive' : 'text-muted-foreground peer-focus:text-primary'}
                    `}
                  >
                    Discovery Source <span className="text-primary ml-1">*</span>
                  </label>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${errors.howHeardAbout ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs ml-2">
                       <AlertCircle size={14} className="stroke-2" />
                       <p className="leading-none">{errors.howHeardAbout}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Signature Area */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-[#1E314D] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Authorization</h2>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xl">3</div>
              </div>

              <SignaturePad
                onSignatureChange={(value) => setFormData({ ...formData, signature: value })}
                error={errors.signature}
              />
            </div>

            {/* Submit Engine */}
            <div className="pt-6 space-y-8">
              <div className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-8 border border-white flex items-start gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div className="space-y-1">
                   <h4 className="font-bold text-foreground">Opt-in to WhatsApp Updates</h4>
                   <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                     By confirming your submission, you agree to receive automated WhatsApp notifications regarding your visit schedule and shelter notices. Reply STOP at any time to opt-out.
                   </p>
                </div>
              </div>

              {errors.submit && (
                <div className="bg-destructive text-destructive-foreground p-6 rounded-2xl font-bold flex items-center gap-3 animate-in shake">
                  <AlertCircle size={20} />
                  {errors.submit}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-5 px-10 bg-primary text-primary-foreground rounded-full font-black text-xl hover:bg-primary/90 shadow-[0_8px_20px_rgba(251,203,4,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                >
                  {isSubmitting ? "Processing Request..." : "Confirm & Submit Request"}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
