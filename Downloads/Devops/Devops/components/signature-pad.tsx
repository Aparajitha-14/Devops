"use client";

import { useRef, useEffect, useState } from "react";
import { Trash2, AlertCircle, PencilLine } from "lucide-react";

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  error?: string;
}

export default function SignaturePad({
  onSignatureChange,
  error,
}: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Resize and scale canvas correctly for high-DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Ensure dimensions are valid
      if (rect.width === 0 || rect.height === 0) return;

      // Set the actual canvas pixel buffer size in device pixels
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));

      // Reset any transforms and scale so drawing coordinates map to CSS pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Set drawing properties
      ctx.strokeStyle = "#1E314D"; // Deep Navy for the pen
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    return () => {
      ro.disconnect();
    };
  }, []);

  const getPointerPos = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      // @ts-ignore
      canvas.setPointerCapture(e.pointerId);
    } catch {}

    const { x, y } = getPointerPos(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPointerPos(canvas, e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      // @ts-ignore
      if (e?.pointerId) canvas.releasePointerCapture(e.pointerId);
    } catch {}

    ctx.closePath();

    setHasSignature(true);
    // Note: since background is clear, saving toDataURL will be transparent PNG. 
    // This is perfect for high-end UI display elsewhere.
    const signature = canvas.toDataURL("image/png");
    onSignatureChange(signature);
  };

  const clearSignature = (e?: React.MouseEvent) => {
    e?.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset transform to identity, then clear the true canvas dimensions
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restore the high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);
    
    // Reset brush settings
    ctx.strokeStyle = "#1E314D"; // Deep Navy for the pen
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setHasSignature(false);
    onSignatureChange("");
  };

  return (
    <div className="relative group w-full mb-2">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm font-bold text-foreground">
          <PencilLine size={16} className="text-primary" />
          Digital Signature
          <span className="text-primary">*</span>
        </label>
        {hasSignature && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md animate-in fade-in">
            ✓ Captured
          </span>
        )}
      </div>

      <div 
         ref={containerRef}
         className={`relative rounded-3xl overflow-hidden transition-all duration-300 border-2 bg-white w-full h-[200px]
         ${error 
          ? 'border-destructive/40 ring-4 ring-transparent shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
          : 'border-border/60 hover:border-primary/40 focus-within:border-primary shadow-inner'}
      `}>
         {/* Dotted Grid Background */}
         <div 
           className="absolute inset-0 pointer-events-none opacity-[0.15]"
           style={{
             backgroundImage: 'radial-gradient(circle at center, #1E314D 1.5px, transparent 1.5px)',
             backgroundSize: '24px 24px'
           }}
         />
         
         <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
            style={{ touchAction: "none" }}
            className="absolute inset-0 z-10 w-full h-full cursor-crosshair outline-none"
         />

         {/* Floating Clear Button */}
         {hasSignature && (
           <button
             type="button"
             onClick={clearSignature}
             className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur border border-border rounded-full text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-sm group/clear animate-in zoom-in-95 duration-200"
           >
             <Trash2 size={14} className="group-hover/clear:rotate-12 transition-transform" />
             Clear
           </button>
         )}

         {/* Placeholder instructional text when empty */}
         {!hasSignature && !isDrawing && (
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/40 font-medium text-lg leading-none select-none">
             Sign here
           </div>
         )}
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-10 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
        <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs ml-2">
           <AlertCircle size={14} className="stroke-2" />
           <p className="leading-none">{error}</p>
        </div>
      </div>
    </div>
  );
}
