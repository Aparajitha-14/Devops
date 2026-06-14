import { ChangeEvent } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  [key: string]: any;
}

export default function FormCheckbox({
  label,
  checked,
  onChange,
  required = false,
  error,
  ...rest
}: FormCheckboxProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="relative group mb-2">
      <label className="flex items-start gap-4 cursor-pointer relative z-10 p-2 -ml-2 rounded-xl transition-colors hover:bg-muted/30">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            {...rest}
          />
          {/* Custom Checkbox Design */}
          <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
            ${error ? 'border-destructive' : 'border-border peer-hover:border-primary/50'}
            ${checked ? 'bg-primary border-primary shadow-[0_0_15px_rgba(251,203,4,0.4)]' : 'bg-white'}
            peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20
          `}>
             <Check 
               size={16} 
               strokeWidth={4} 
               className={`text-primary-foreground transition-all duration-300 transform 
                 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
               `} 
             />
          </div>
        </div>
        <div className="flex-1">
          <span className={`text-sm md:text-base leading-relaxed transition-colors font-medium
            ${checked ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'}
          `}>
            {label}
            {required && <span className="text-primary font-bold ml-1">*</span>}
          </span>
        </div>
      </label>
      
      <div className={`overflow-hidden transition-all duration-300 ml-10 ${error ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
        <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs py-1">
           <AlertCircle size={14} className="stroke-2" />
           <p className="leading-none">{error}</p>
        </div>
      </div>
    </div>
  );
}
