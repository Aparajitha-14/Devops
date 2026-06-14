"use client";

import { useState } from "react";
import { ChevronLeft, HeartPulse, Scale, FileSignature, MessageSquare, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";
import FormInput from "./form-input";
import FormCheckbox from "./form-checkbox";
import SignaturePad from "./signature-pad";
import PhoneNumberField from "./phone-number-field";

interface AnimalFormProps {
  onBack: () => void;
}

interface FormData {
  fullName: string;
  address: string;
  countryCode: string;
  phone: string;
  email: string;
  animalType: string;
  animalAge: string;
  animalCondition: string;
  animalNotes: string;
  declaration: boolean;
  date: string;
  signature: string;
  consent: boolean;
}

export default function AnimalForm({ onBack }: AnimalFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    address: "",
    countryCode: "+91",
    phone: "",
    email: "",
    animalType: "",
    animalAge: "",
    animalCondition: "",
    animalNotes: "",
    declaration: false,
    date: new Date().toISOString().split("T")[0],
    signature: "",
    consent: true,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationId, setDeclarationId] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.countryCode.trim())
      newErrors.countryCode = "Country code is required";
    if (!/^\+\d{1,4}$/.test(formData.countryCode.trim()))
      newErrors.countryCode = "Use format like +91";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!/^[\d\-\(\)\s]+$/.test(formData.phone))
      newErrors.phone = "Please enter a valid phone number";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.animalType) newErrors.animalType = "Animal type is required";
    if (!formData.animalAge.trim())
      newErrors.animalAge = "Animal age is required";
    if (!formData.animalCondition.trim())
      newErrors.animalCondition = "Please describe the animal's condition";
    if (!formData.declaration)
      newErrors.declaration = "You must agree to the legal declaration";
    if (!formData.signature.trim())
      newErrors.signature = "Signature is required";

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
      const response = await fetch("/api/forms/declaration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || "Failed to submit form");
      }

      const result = await response.json();
      setDeclarationId(result?.data?.declarationId ?? null);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: "", address: "", countryCode: "+91", phone: "", email: "", animalType: "",
          animalAge: "", animalCondition: "", animalNotes: "", declaration: false,
          date: new Date().toISOString().split("T")[0], signature: "", consent: true,
        });
      }, 8000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to submit declaration form",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen pt-20 px-4 animate-in fade-in duration-700 bg-background">
        <div className="bg-[#1E314D] rounded-[3rem] p-16 md:p-24 shadow-[0_30px_100px_rgba(0,0,0,0.15)] text-center space-y-10 relative overflow-hidden w-full max-w-4xl text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          
          <div className="relative z-10 w-32 h-32 bg-gradient-to-tr from-green-500 to-green-300 rounded-[2rem] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-green-500/30 transform rotate-3">
            <Sparkles className="w-16 h-16 text-white absolute -top-4 -right-4 animate-bounce" />
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-[dash_1s_ease-out_forwards]" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Declaration <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Received.</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-medium">
              We have officially received your animal declaration. Thank you for acting in the best interest of the animal. Our rescue team will contact you shortly.
            </p>
          </div>

          {declarationId !== null && (
            <div className="relative z-10 group">
               <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transition-all group-hover:bg-primary/30"></div>
               <div className="relative bg-[#152336]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl max-w-sm mx-auto shadow-2xl">
                 <p className="text-white/60 font-semibold text-sm uppercase tracking-widest mb-2">Reference ID</p>
                 <p className="text-4xl font-mono font-black tracking-widest text-primary">{declarationId}</p>
               </div>
            </div>
          )}
          
          <div className="relative z-10 pt-10">
            <button
              onClick={onBack}
              className="px-12 py-5 bg-white text-[#1E314D] rounded-full font-black text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Return Home
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
        <div className="absolute inset-0 bg-[url('/animal-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[#1E314D]/90 to-[#1E314D]/40 backdrop-blur-[2px]" />
        
        {/* Content - Pure white text for guaranteed contrast */}
        <div className="relative z-20 space-y-8 w-full max-w-xl mx-auto lg:mx-0 pt-16 lg:pt-32">
          <div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-4 drop-shadow-lg">
              Animal <br/>Declaration.
            </h1>
            <p className="text-lg lg:text-xl text-white/90 font-medium leading-relaxed max-w-md drop-shadow-md">
              If you need to surrender an animal to CARE, we are here to help. This form begins the legal and medical transfer process.
            </p>
          </div>

          {/* Support Content */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-10 border border-primary/20 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <h2 className="text-2xl font-black text-white flex items-center gap-4 mb-6">
              <div className="p-3 bg-white shadow-sm rounded-2xl text-primary drop-shadow-sm"><HeartPulse size={24} /></div>
              We're Here to Help
            </h2>
            <p className="text-white/90 leading-relaxed font-medium">
              We understand that surrendering an animal is a difficult decision. Our absolute priority is to ensure the animal receives immediate medical attention, proper rehabilitation, and eventually a loving home.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 lg:p-10 border border-white/10 text-white relative overflow-hidden shadow-2xl group">
             <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             
             <h3 className="font-bold text-2xl flex items-center gap-4 mb-8 relative z-10 text-white drop-shadow-md">
               <div className="p-3 bg-secondary/80 backdrop-blur rounded-2xl text-white shadow-md"><AlertTriangle size={24} /></div>
               Important Notice
             </h3>
             <ul className="space-y-6 text-white/95 relative z-10 font-medium text-sm lg:text-base">
               <li className="flex gap-4 items-start group/item">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary flex-shrink-0 group-hover/item:scale-150 transition-transform shadow-[0_0_8px_var(--secondary)]" />
                 <span className="leading-relaxed"><strong className="text-white block text-lg mb-1 drop-shadow-sm">Legal Transfer</strong> Submitting this form authorizes a complete legal transfer of ownership to CARE.</span>
               </li>
               <li className="flex gap-4 items-start group/item">
                 <div className="mt-1.5 w-2 h-2 rounded-full bg-destructive flex-shrink-0 group-hover/item:scale-150 shadow-[0_0_12px_var(--destructive)] transition-transform" />
                 <span className="leading-relaxed"><strong className="text-white block text-lg mb-1 drop-shadow-sm">Irreversible Decision</strong> This decision is permanent. Once ownership is transferred, it cannot be reversed.</span>
               </li>
             </ul>
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
            
            {/* Step 1: Owner Info */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Your Details</h2>
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
                  label="Permanent Address"
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

            {/* Step 2: Animal Info */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-secondary to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100"></div>
              
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground tracking-tight">Animal Details</h2>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xl">2</div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="relative group w-full mb-2 z-20">
                    <select
                      value={formData.animalType}
                      onChange={(e) => setFormData({ ...formData, animalType: e.target.value })}
                      className={`peer w-full px-5 pb-3 pt-7 rounded-2xl border-2 transition-all duration-300 outline-none font-medium text-foreground bg-white/70 backdrop-blur-sm focus:bg-white hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] appearance-none cursor-pointer
                        ${errors.animalType 
                          ? 'border-destructive/40 focus:border-destructive ring-4 ring-transparent focus:ring-destructive/10' 
                          : 'border-border/60 hover:border-primary/40 focus:border-primary ring-4 ring-transparent focus:ring-primary/15'
                        }`}
                    >
                      <option value="" disabled hidden></option>
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="bird">Bird</option>
                      <option value="hamster">Hamster</option>
                      <option value="guinea-pig">Guinea Pig</option>
                      <option value="other">Other</option>
                    </select>
                  <label 
                    className={`absolute left-5 origin-[0] transition-all duration-300 pointer-events-none z-10 top-5 -translate-y-3.5 scale-[0.8] font-bold tracking-wide
                      ${errors.animalType ? 'text-destructive focus:text-destructive' : 'text-muted-foreground peer-focus:text-primary'}
                    `}
                  >
                    Animal Species <span className="text-primary ml-1">*</span>
                  </label>
                    <div className={`overflow-hidden transition-all duration-300 ${errors.animalType ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                      <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs ml-2">
                         <AlertCircle size={14} className="stroke-2" />
                         <p className="leading-none">{errors.animalType}</p>
                      </div>
                    </div>
                  </div>

                  <FormInput
                    label="Approximate Age"
                    value={formData.animalAge}
                    onChange={(value) => setFormData({ ...formData, animalAge: value })}
                    placeholder="e.g. 3 years, 6 months"
                    error={errors.animalAge}
                    required
                  />
                </div>

                <FormInput
                  label="Current Physical & Health Condition"
                  value={formData.animalCondition}
                  onChange={(value) => setFormData({ ...formData, animalCondition: value })}
                  placeholder="e.g. Healthy, injured right leg, malnourished"
                  error={errors.animalCondition}
                  required
                />

                <div className="relative group w-full mb-2 z-10 pt-2">
                  <textarea
                    value={formData.animalNotes}
                    onChange={(e) => setFormData({ ...formData, animalNotes: e.target.value })}
                    placeholder=" "
                    rows={4}
                    className={`peer w-full px-5 pb-3 pt-7 rounded-2xl border-2 transition-all duration-300 outline-none font-medium text-foreground bg-white/70 backdrop-blur-sm focus:bg-white hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] resize-vertical
                      border-border/60 hover:border-primary/40 focus:border-primary ring-4 ring-transparent focus:ring-primary/15
                    `}
                  />
                  <label 
                    className={`absolute left-5 origin-[0] z-10 top-5 -translate-y-3.5 scale-[0.8] font-bold tracking-wide pointer-events-none transition-colors duration-300 text-muted-foreground peer-focus:text-primary
                    `}
                  >
                    Additional Medical/Behavioral History
                  </label>
                </div>
              </div>
            </div>

            {/* Step 3: Legal & Signature Area */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-destructive transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-200"></div>
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                   Legal Transfer <Scale className="text-destructive mb-1" size={28}/>
                </h2>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xl">3</div>
              </div>

              <div className="bg-destructive/5 border-2 border-destructive/20 rounded-[2rem] p-8 mb-8 space-y-6 relative overflow-hidden group/legal">
                 <div className="absolute inset-0 bg-destructive/10 scale-0 origin-center group-hover/legal:scale-150 transition-transform duration-1000 ease-out opacity-20 rounded-full blur-2xl"></div>
                 <p className="font-black text-lg text-foreground relative z-10">
                    I hereby declare that I am the rightful owner of the above-mentioned animal and authorize Charlie's Animal Rescue Centre (CARE) to take full responsibility and ownership of this animal.
                 </p>
                 <FormCheckbox
                    label="I have read, understood, and agree to the legal terms transferring ownership of the animal."
                    checked={formData.declaration}
                    onChange={(checked) => setFormData({ ...formData, declaration: checked })}
                    required
                    error={errors.declaration}
                 />
              </div>

              <div className="space-y-6">
                <div className="relative z-20 md:w-1/2">
                   <FormInput
                     label="Date"
                     type="date"
                     value={formData.date}
                     onChange={(value) => setFormData({ ...formData, date: value })}
                     error={errors.date}
                     required
                   />
                </div>

                <SignaturePad
                  onSignatureChange={(value) => setFormData({ ...formData, signature: value })}
                  error={errors.signature}
                />
              </div>
            </div>

            {/* Submit Engine */}
            <div className="pt-6 space-y-8">
              <div className="bg-white/60 backdrop-blur-lg rounded-[2rem] p-8 border border-white flex items-start gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                <div className="p-3 bg-secondary/10 text-secondary rounded-2xl shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div className="space-y-1">
                   <h4 className="font-bold text-foreground">Opt-in to WhatsApp Updates</h4>
                   <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                     By confirming your submission, you agree to receive automated WhatsApp notifications regarding this transfer and subsequent shelter notices. Reply STOP at any time to opt-out.
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
                  className="flex-1 py-5 px-10 bg-destructive text-destructive-foreground rounded-full font-black text-xl hover:bg-destructive/90 shadow-[0_8px_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300"
                >
                  {isSubmitting ? "Processing..." : "Sign & Transfer Ownership"}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
