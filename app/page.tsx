import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { FileText, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'AutoParse - AI Financial Document Parser',
  description: 'Enterprise-grade AI document parsing and analysis',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="px-6 lg:px-8 h-20 flex items-center justify-between backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AutoParse</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className={buttonVariants({ variant: 'ghost', className: 'hidden sm:inline-flex' })}>
              Sign In
            </Link>
            <Link href="/register" className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20' })}>
              Get Started
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 bg-indigo-50/50 dark:text-indigo-400 dark:bg-indigo-900/20 dark:ring-indigo-500/30 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
            AutoParse 1.0 is now live
          </div>
          
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
            Extract Data from Financial Documents with AI
          </h1>
          
          <p className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10">
            Upload invoices, bank statements, and tax forms. Our intelligent OCR and AI parsing engine automatically classifies, validates, and extracts structured data in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto">
            <Link href="/register" className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 h-14 px-8 text-lg' })}>
              Start Parsing for Free
            </Link>
            <Link href="/login" className={buttonVariants({ size: 'lg', variant: 'outline', className: 'w-full sm:w-auto h-14 px-8 text-lg border-slate-300 dark:border-zinc-700' })}>
              Dashboard Login
            </Link>
          </div>

          {/* Features grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-xl shadow-slate-200/20 dark:shadow-none transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning Fast AI</h3>
              <p className="text-slate-600 dark:text-slate-400">Powered by Gemini and Groq, parsing takes seconds. If one API fails, it automatically falls back to ensure 100% uptime.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-xl shadow-slate-200/20 dark:shadow-none transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Validation</h3>
              <p className="text-slate-600 dark:text-slate-400">Automatically verifies PANs, GSTINs, and IFSC codes. Low confidence scores trigger a manual review workflow.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-slate-200/50 dark:border-zinc-800/50 backdrop-blur-sm shadow-xl shadow-slate-200/20 dark:shadow-none transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Rich Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400">Visualize your parsing success rates, track document types, and export detailed CSV reports directly from your dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
