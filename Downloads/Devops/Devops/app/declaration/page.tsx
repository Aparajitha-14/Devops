'use client';

import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import AnimalForm from '@/components/animal-form';

export default function DeclarationPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Modern Simple Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-border/50 py-3">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-3xl bg-primary/20 p-2 rounded-xl text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/30">
              <PawPrint size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">CARE</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Rescue Centre</p>
            </div>
          </Link>

          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-muted hover:bg-secondary/10 hover:text-secondary transition-all"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        <AnimalForm onBack={() => window.location.href = '/'} />
      </main>

    </div>
  );
}
