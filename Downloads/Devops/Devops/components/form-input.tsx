import React, { ChangeEvent, useId } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  min?: string | number;
  [key: string]: any;
}

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  min,
  ...rest
}: FormInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const id = useId();

  return (
    <div className="relative group w-full mb-2">
      <input
        type={type}
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        className={`peer w-full px-5 pb-3 pt-7 rounded-2xl border-2 transition-all duration-300 outline-none font-medium text-foreground bg-white/70 backdrop-blur-sm focus:bg-white hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]
          ${error 
            ? 'border-destructive/40 focus:border-destructive ring-4 ring-transparent focus:ring-destructive/10' 
            : 'border-border/60 hover:border-primary/40 focus:border-primary ring-4 ring-transparent focus:ring-primary/15'
          } placeholder:text-muted-foreground/50 placeholder:font-normal`}
        {...rest}
      />
      <label 
        htmlFor={id}
        className={`absolute left-5 origin-[0] z-10 top-5 -translate-y-3.5 scale-[0.8] font-bold tracking-wide pointer-events-none transition-colors duration-300
          ${error ? 'text-destructive' : 'text-muted-foreground peer-focus:text-primary'}
        `}
      >
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
        <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs ml-2">
           <AlertCircle size={14} className="stroke-2" />
           <p className="leading-none">{error}</p>
        </div>
      </div>
    </div>
  );
}
