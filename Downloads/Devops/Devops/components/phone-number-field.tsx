"use client";

import { AlertCircle, Phone } from "lucide-react";

const COUNTRY_CODE_SUGGESTIONS = [
  { label: "India", value: "+91" },
  { label: "United States", value: "+1" },
  { label: "United Kingdom", value: "+44" },
  { label: "Canada", value: "+1" },
  { label: "China", value: "+86" },
  { label: "Japan", value: "+81" },
  { label: "South Korea", value: "+82" },
  { label: "Australia", value: "+61" },
  { label: "New Zealand", value: "+64" },
  { label: "Germany", value: "+49" },
  { label: "France", value: "+33" },
  { label: "Spain", value: "+34" },
  { label: "Italy", value: "+39" },
  { label: "Netherlands", value: "+31" },
  { label: "Belgium", value: "+32" },
  { label: "Sweden", value: "+46" },
  { label: "Norway", value: "+47" },
  { label: "Denmark", value: "+45" },
  { label: "Poland", value: "+48" },
  { label: "Russia", value: "+7" },
  { label: "Brazil", value: "+55" },
  { label: "Mexico", value: "+52" },
  { label: "Argentina", value: "+54" },
  { label: "South Africa", value: "+27" },
  { label: "UAE", value: "+971" },
  { label: "Saudi Arabia", value: "+966" },
  { label: "Qatar", value: "+974" },
  { label: "Kuwait", value: "+965" },
  { label: "Oman", value: "+968" },
  { label: "Nepal", value: "+977" },
  { label: "Bangladesh", value: "+880" },
  { label: "Pakistan", value: "+92" },
  { label: "Sri Lanka", value: "+94" },
  { label: "Malaysia", value: "+60" },
  { label: "Thailand", value: "+66" },
  { label: "Vietnam", value: "+84" },
  { label: "Indonesia", value: "+62" },
  { label: "Philippines", value: "+63" },
  { label: "Hong Kong", value: "+852" },
  { label: "Taiwan", value: "+886" },
  { label: "Turkey", value: "+90" },
  { label: "Greece", value: "+30" },
  { label: "Portugal", value: "+351" },
];

interface PhoneNumberFieldProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  countryCodeError?: string;
  phoneError?: string;
}

export default function PhoneNumberField({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  countryCodeError,
  phoneError,
}: PhoneNumberFieldProps) {
  const hasError = Boolean(countryCodeError || phoneError);

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-bold tracking-wide text-muted-foreground">
        Phone Number <span className="ml-1 text-primary">*</span>
      </label>

      <div
        className={`group flex min-h-[76px] w-full items-center rounded-[1.75rem] border-2 bg-white/70 px-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-sm transition-all duration-300
          ${
            hasError
              ? "border-destructive/40 ring-4 ring-transparent focus-within:border-destructive focus-within:ring-destructive/10"
              : "border-border/60 hover:border-primary/40 focus-within:border-primary ring-4 ring-transparent focus-within:ring-primary/15"
          }`}
      >
        <div className="mr-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Phone size={18} />
        </div>

        <div className="flex w-full flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-0">
          <div className="sm:w-[180px] sm:pr-3">
            <select
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              className="h-11 w-full rounded-2xl bg-transparent px-3 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/55 sm:rounded-none sm:border-0 sm:px-0 appearance-none cursor-pointer"
            >
              <option value="">Select Country</option>
              {COUNTRY_CODE_SUGGESTIONS.map((option) => (
                <option
                  key={`${option.label}-${option.value}`}
                  value={option.value}
                >
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden h-10 w-px shrink-0 bg-border/70 sm:block" />

          <div className="sm:min-w-0 sm:flex-1 sm:pl-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Enter mobile number"
              className="h-11 w-full rounded-2xl bg-transparent px-3 text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground/55 sm:rounded-none sm:border-0 sm:px-0"
            />
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          hasError ? "mt-2 max-h-12 opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        <div className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-destructive">
          <AlertCircle size={14} className="stroke-2" />
          <p className="leading-none">{countryCodeError || phoneError}</p>
        </div>
      </div>
    </div>
  );
}