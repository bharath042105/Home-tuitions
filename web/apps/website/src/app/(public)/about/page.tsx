"use client";

import Link from "next/link";
import { Award, BookOpen, Users, Compass, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";

const STATS = [
  { icon: Award, number: "14+", label: "Years of Excellence", desc: "Serving students in Hyderabad since 2012." },
  { icon: Users, number: "25,000+", label: "Happy Parents", desc: "Academic growth and top grades achieved." },
  { icon: BookOpen, number: "5,000+", label: "Verified Tutors", desc: "Vetted experts across various subjects." },
  { icon: Compass, number: "100%", label: "Satisfaction Rate", desc: "Dedicated matching and free replacements." }
];

const CORE_VALUES = [
  {
    icon: Heart,
    title: "Student-Centric Care",
    desc: "Every student has a unique learning pace. We adapt our teaching strategies to align with their comprehension level and goals."
  },
  {
    icon: ShieldCheck,
    title: "Uncompromised Vetting",
    desc: "We rigorously verify qualifications, identity, address, and demo lectures. Only top tutors represent Vidya."
  },
  {
    icon: Sparkles,
    title: "Concept-Based Learning",
    desc: "We move away from rote learning. Our tutors focus on logic and conceptual foundations to build self-learning habits."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-905 dark:bg-neutral-950 dark:text-neutral-100 transition-colors flex flex-col justify-between">
      <SiteHeader />
      <div className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="absolute -left-20 top-[-100px] h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute right-[-50px] top-[-50px] h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[120px]" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            About{" "}
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-300">
              Vidya Home Tuitions
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base text-neutral-600 dark:text-neutral-400 leading-relaxed sm:text-lg">
            Providing high-impact, personalized 1-on-1 home and online tutoring across Hyderabad. Empowering students to build confidence and unlock high scores.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white sm:text-3xl">
                Our Journey Since 2012
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Vidya Home Tuitions (formerly Vivekanand Home Tuitions) was founded in Hyderabad with a simple vision: to bridge the educational gap through personalized, 1-on-1 student instruction. We realized that crowded classrooms often fail to address the specific doubts and learning paces of individual children.
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Over the last decade, we have expanded our network to cover all localities in Hyderabad, matching over 25,000 parents with verified, top-performing home tutors and online educators. From Nursery classes to advanced IIT-JEE/NEET preparation, our focus remains on delivering custom-tailored academic support.
              </p>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 opacity-20 blur-lg" />
              <div className="relative rounded-2xl border border-neutral-200 bg-white/90 p-8 shadow-md dark:border-neutral-800 dark:bg-neutral-900/90 text-center flex flex-col gap-1">
                <span className="text-brand-500 font-extrabold text-5xl">2012</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-2">Founded in Hyderabad</span>
                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed mt-2">
                  Started with a core group of 15 tutors. Today, we are proud to support over 5,000 background-checked academic professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900/30 border-y border-neutral-200/50 dark:border-neutral-800/50 transition-colors">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, idx) => (
              <div key={idx} className="p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 flex flex-col items-center text-center shadow-sm">
                <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-3.5">
                  <s.icon size={22} />
                </div>
                <span className="text-3xl font-extrabold text-neutral-900 dark:text-white leading-none">{s.number}</span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-2">{s.label}</span>
                <p className="text-xs text-neutral-550 dark:text-neutral-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Our Core Pillars of Excellence
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Every home lesson we arrange is built on our values of quality and safety.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {CORE_VALUES.map((val, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-neutral-150 bg-white dark:border-neutral-800 dark:bg-neutral-900/60 shadow-sm flex flex-col gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center self-start">
                  <val.icon size={20} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{val.title}</h3>
                <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vetting Standard */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900/30 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-5">
          <ShieldCheck size={48} className="text-brand-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Our Tutor Verification Guarantee</h2>
          <p className="max-w-2xl text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed">
            Every tutor listed in our directory undergoes strict academic and background screening. We physically verify Aadhaar details, examine certificate transcripts, conduct face-to-face capability interviews, and evaluate a strict teaching demo lecture. We ensure that your child is learning in a safe, productive atmosphere.
          </p>
          <Link href="/request-tutor" className="mt-2">
            <Button size="lg" className="font-semibold shadow-lg shadow-brand-500/20">
              Request a Match Today
            </Button>
          </Link>
        </div>
      </section>
      </div>
      <SiteFooter />
    </div>
  );
}
