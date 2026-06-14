import { HeartPulse } from "lucide-react";

function HealthCard() {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-border/40 text-[#1E314D] relative overflow-hidden shadow-xl shadow-black/[0.02] grid md:grid-cols-[1fr_auto] items-center gap-8 group">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -mr-20 -mt-20 pointer-events-none"></div>

      <div className="flex gap-6 items-center z-10 relative">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
           <HeartPulse size={32} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-2xl lg:text-3xl font-black mb-2 tracking-tight">Habitat Health</h4>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl leading-snug">
            Sanctuary is currently at <span className="font-bold text-[#1E314D]">84% capacity</span>. Resource consumption is stable, but plan future intakes carefully.
          </p>
        </div>
      </div>
      
      <div className="z-10 relative flex">
         <button className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-[0_8px_15px_rgba(251,203,4,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_20px_rgba(251,203,4,0.3)] transition-all whitespace-nowrap">
           Review Intakes
         </button>
      </div>
    </div>
  );
}

export default HealthCard;