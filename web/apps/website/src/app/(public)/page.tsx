"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock3,
  Globe2,
  ShieldCheck,
  Trophy,
  Users,
  Star,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThreeDTilt } from "@/components/ui/ThreeDTilt";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { ThreeDInteractiveBackground } from "@/components/features/marketing/ThreeDInteractiveBackground";

// FAQ Data
const FAQS = [
  {
    q: "How does the tutor matching process work?",
    a: "Once you submit a 'Request a Tutor' form with your child's class, subjects, and budget, our team matches you with the top 3 verified tutors in your locality. You can review their profiles and schedule a free 1-hour demo session with the tutor you prefer."
  },
  {
    q: "Are the tutors verified?",
    a: "Yes, absolutely. Every tutor in the Vidya Home Tuitions network undergoes a strict vetting process. We verify their academic credentials, teaching experience, and run background checks on their identity and address details to ensure student safety."
  },
  {
    q: "Is there a fee for the demo class?",
    a: "No, the first demo class (1 hour) is completely free of charge. This allows the student and parent to evaluate the tutor's teaching style, communication skills, and subject expertise before finalizing the tuition."
  },
  {
    q: "What boards and classes do you support?",
    a: "We support all major educational boards, including CBSE, ICSE/ISC, IGCSE, IB, and Telangana State Board. Our tutoring services cover classes from Nursery to 12th Grade, as well as competitive entrance exam coaching like IIT-JEE, NEET, and Olympiads."
  },
  {
    q: "What happens if we want to change a tutor?",
    a: "If you are not satisfied with a tutor at any point, we offer free and quick replacements. Simply contact our support coordinator, and we will arrange demo classes with alternative matching tutors immediately."
  }
];

// Testimonials Data
const TESTIMONIALS = [
  {
    name: "Dr. Srinivas Rao",
    role: "Parent of Class 10 CBSE Student (Miyapur)",
    quote: "Finding a qualified tutor for Physics & Maths was a struggle until we contacted Vidya. The tutor matched was exceptionally clear with concepts. My son's grades improved from 75% to 93% in his board exams.",
    rating: 5
  },
  {
    name: "Ananya Deshmukh",
    role: "Parent of Class 6 ICSE Student (Gachibowli)",
    quote: "The personalized attention has made a huge difference. My daughter was afraid of Mathematics, but her tutor made learning fun and relatable. She now completes her homework independently!",
    rating: 5
  },
  {
    name: "Karthik Reddy",
    role: "Tutor (Mathematics & Chemistry)",
    quote: "Vidya Home Tuitions provides a highly professional platform for educators. They manage client matchings and payment clearances seamlessly, letting tutors focus entirely on what they do best: teaching.",
    rating: 5
  }
];

// Subjects Tabs Data
const SUBJECT_CATEGORIES = [
  {
    id: "primary",
    label: "Nursery - Class 5",
    description: "Building strong foundational concepts in core subjects with interactive, friendly guidance.",
    subjects: ["Mathematics", "General Science", "English Grammar", "Hindi / Telugu", "EVS (Environmental Studies)"]
  },
  {
    id: "middle",
    label: "Class 6 - Class 10",
    description: "Developing analytical and problem-solving skills for board-level preparation.",
    subjects: ["Physics", "Chemistry", "Biology", "Algebra & Geometry", "Social Science", "Sanskrit / French"]
  },
  {
    id: "secondary",
    label: "Class 11 - Class 12",
    description: "Rigorous academic preparation for boards and building blocks for competitive exams.",
    subjects: ["Calculus & Vectors", "Organic & Inorganic Chemistry", "Mechanics & Electromagnetism", "Economics & Accounts", "Computer Science (Python/Java)"]
  },
  {
    id: "competitive",
    label: "Entrance Exams",
    description: "Specialized coaching targeting premium universities and professional entrance exams.",
    subjects: ["IIT-JEE Mains & Advanced", "NEET (Medical Prep)", "NTSE & Olympiads", "EAMCET Coaching"]
  }
];

export default function HomePage() {
  const router = useRouter();

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Subject Tabs State
  const [activeTab, setActiveTab] = useState("middle");

  // Quick Match Form State
  const [matchClass, setMatchClass] = useState("");
  const [matchSubject, setMatchSubject] = useState("");
  const [matchType, setMatchType] = useState("HOME");

  const handleQuickMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to request-tutor page with pre-filled query parameters
    const params = new URLSearchParams();
    if (matchClass) params.set("class", matchClass);
    if (matchSubject) params.set("subject", matchSubject);
    if (matchType) params.set("type", matchType);
    
    router.push(`/request-tutor?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors flex flex-col justify-between">
      <SiteHeader />
      <main className="relative overflow-hidden flex-1">
        <ThreeDInteractiveBackground />
        {/* Glow Mesh Gradients */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 flex justify-center overflow-hidden">
          <div className="relative h-[800px] w-[1440px] shrink-0">
            <div className="absolute -left-20 top-[-100px] h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[100px] dark:bg-brand-500/5 animate-drift-slow-1" />
            <div className="absolute right-[-50px] top-[-50px] h-[600px] w-[600px] rounded-full bg-accent-500/10 blur-[120px] dark:bg-accent-500/5 animate-drift-slow-2" />
            <div className="absolute left-[30%] top-[400px] h-[400px] w-[400px] rounded-full bg-brand-500/10 blur-[90px] dark:bg-brand-500/5 animate-drift-slow-3" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Typography & CTAs */}
              <div className="flex flex-col gap-6 text-left lg:col-span-7">
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-accent-300/40 bg-accent-50 px-4 py-1.5 text-xs font-semibold text-accent-700 dark:border-accent-500/20 dark:bg-accent-500/10 dark:text-accent-300">
                  <Sparkles size={14} className="animate-spin-slow" />
                  <span>1-on-1 Personalized Home & Online Learning</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl leading-[1.1]">
                  Transform Grades with{" "}
                  <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-300 dark:to-accent-300">
                    Vidya Home Tuitions
                  </span>
                </h1>
                <p className="max-w-xl text-base text-neutral-600 dark:text-neutral-400 sm:text-lg leading-relaxed">
                  Struggling with complex concepts? Connect with background-verified, high-achieving school & college tutors for personalized, results-driven learning right at your home or online.
                </p>

                <div className="flex flex-wrap gap-4 mt-2">
                  <Link href="/request-tutor">
                    <Button size="lg" className="font-semibold shadow-lg shadow-brand-500/20">
                      Book a Free Trial Class
                    </Button>
                  </Link>
                  <Link href="/tutor-registration">
                    <Button variant="secondary" size="lg" className="font-semibold">
                      Apply as a Tutor
                    </Button>
                  </Link>
                </div>

                {/* Micro Reviews */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-9 w-9 rounded-full border-2 border-white bg-neutral-200 dark:border-neutral-950 flex items-center justify-center font-bold text-[10px] text-neutral-600"
                        style={{
                          backgroundImage: `url('https://images.unsplash.com/photo-${1500000000000 + i * 100000}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')`,
                          backgroundSize: "cover"
                        }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-accent-500 text-accent-500" />
                      ))}
                      <span className="text-sm font-bold ml-1">4.9/5</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-450">
                      Trusted by 2,500+ parents in Hyderabad
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Quick Match Form Card */}
              <div className="lg:col-span-5 relative animate-float">
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-brand-500 to-accent-500 opacity-25 blur-2xl dark:opacity-40" />
                <ThreeDTilt maxRotation={12} scale={1.03} className="w-full">
                  <div className="relative rounded-2xl border border-white/40 glass-morphic p-6 shadow-2xl sm:p-8 hover:border-brand-500/35 transition-colors duration-500 preserve-3d">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2 translate-z-30">
                      <GraduationCap className="text-brand-500 animate-pulse" />
                      Quick Tutor Matcher
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1 mb-6 translate-z-20">
                      Fill the preferences below to view matches.
                    </p>

                    <form onSubmit={handleQuickMatchSubmit} className="flex flex-col gap-4 preserve-3d">
                      <div className="translate-z-20">
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                          Select Grade / Class
                        </label>
                        <select
                          value={matchClass}
                          onChange={(e) => setMatchClass(e.target.value)}
                          required
                          className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white shadow-sm"
                        >
                          <option value="">-- Choose Class --</option>
                          <option value="Nursery-UKG">Nursery to UKG</option>
                          <option value="Class 1-5">Class 1 to 5</option>
                          <option value="Class 6-8">Class 6 to 8</option>
                          <option value="Class 9-10">Class 9 & 10 (Board)</option>
                          <option value="Class 11-12">Class 11 & 12 (Intermediate)</option>
                          <option value="IIT-JEE/NEET">IIT-JEE / NEET Prep</option>
                        </select>
                      </div>

                      <div className="translate-z-20">
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                          Target Subject
                        </label>
                        <select
                          value={matchSubject}
                          onChange={(e) => setMatchSubject(e.target.value)}
                          required
                          className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white shadow-sm"
                        >
                          <option value="">-- Choose Subject --</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="General Science">General Science</option>
                          <option value="English">English / Grammar</option>
                          <option value="Languages">Hindi / Telugu / Sanskrit</option>
                          <option value="Coding">Coding (Scratch/Python)</option>
                        </select>
                      </div>

                      <div className="translate-z-20">
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                          Tuition Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMatchType("HOME")}
                            className={`h-10 text-xs font-semibold rounded-md border transition-all ${
                              matchType === "HOME"
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm"
                                : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                            }`}
                          >
                            At Home (Offline)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatchType("ONLINE")}
                            className={`h-10 text-xs font-semibold rounded-md border transition-all ${
                              matchType === "ONLINE"
                                ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm"
                                : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                            }`}
                          >
                            Online Live 1-on-1
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="h-11 font-semibold w-full mt-2 translate-z-30 shadow-lg shadow-brand-500/20">
                        Find Matching Tutors
                        <ArrowRight size={16} />
                      </Button>
                    </form>
                  </div>
                </ThreeDTilt>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Stats Section */}
        <section id="why-us" className="py-16 bg-neutral-50 dark:bg-neutral-900/40 border-y border-neutral-200/50 dark:border-neutral-800/50 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Why Vidya Home Tuitions is Hyderabad's Top Choice
              </h2>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-3">
                Since 2012, we have matched students with expert tutors, enabling academic turnarounds through customized care.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 perspective-1000">
              <div className="p-6 rounded-2xl bg-white border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 flex items-start gap-4 hover-3d-card glow-shadow-brand preserve-3d">
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 shrink-0 translate-z-30">
                  <ShieldCheck size={24} />
                </div>
                <div className="translate-z-20">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">5,000+</h3>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-250 mt-2">Verified Tutors</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">Background and document verified academic experts.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 flex items-start gap-4 hover-3d-card glow-shadow-accent preserve-3d">
                <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 shrink-0 translate-z-30">
                  <Users size={24} />
                </div>
                <div className="translate-z-20">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">25,000+</h3>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-250 mt-2">Students Taught</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">Empowering students across Hyderabad to achieve board goals.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 flex items-start gap-4 hover-3d-card glow-shadow-success preserve-3d">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 translate-z-30">
                  <Award size={24} />
                </div>
                <div className="translate-z-20">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">100%</h3>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-250 mt-2">Free Replacement</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1 leading-relaxed">If the tutor is not a fit, we match you with a replacement immediately.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 flex items-start gap-4 hover-3d-card glow-shadow-warning preserve-3d">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 translate-z-30">
                  <Clock3 size={24} />
                </div>
                <div className="translate-z-20">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white leading-none">Flexible</h3>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-250 mt-2">Schedules & Budget</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">Set timings and frequency that fit your family schedule.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects & Boards Section */}
        <section id="subjects" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Subjects & Classes We Cover
              </h2>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-3">
                Expert tuition matched to all major curriculum layouts: CBSE, ICSE, SSC, IGCSE, and IB.
              </p>
            </div>

            {/* Tabs Selector */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 bg-neutral-150/60 dark:bg-neutral-900/90 rounded-2xl shadow-inner border border-neutral-200/50 dark:border-neutral-800/80">
                {SUBJECT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 ${
                      activeTab === cat.id
                        ? "bg-white text-brand-600 shadow-md scale-102 dark:bg-neutral-800 dark:text-brand-400 border border-neutral-200/30 dark:border-neutral-700/50"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Panel */}
            <div className="relative rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 sm:p-10 transition-all duration-300">
              {SUBJECT_CATEGORIES.map((cat) => {
                if (cat.id !== activeTab) return null;
                return (
                  <div key={cat.id} className="animate-fade-in-up flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="lg:w-1/2 flex flex-col gap-4">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{cat.label} Tutoring</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {cat.description} We focus on core curriculum syllabus depth, systematic homework solving, and periodical assessments.
                      </p>
                      <div className="flex flex-col gap-2.5 mt-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span>Includes regular homework and mock test sheets</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span>Custom syllabus tracking as per school progress</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          <span>Focus on weak topics and doubt clearance sessions</span>
                        </div>
                      </div>
                      <Link href="/request-tutor" className="mt-4 self-start">
                        <Button className="font-semibold gap-1.5">
                          Find Tutors for {cat.label}
                          <ArrowRight size={16} />
                        </Button>
                      </Link>
                    </div>

                    <div className="lg:w-1/2">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Featured Core Subjects</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {cat.subjects.map((sub, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-neutral-100 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 hover:border-brand-500/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center gap-3 cursor-default"
                          >
                            <div className="h-2.5 w-2.5 rounded-full bg-accent-500 animate-pulse" />
                            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-neutral-50 dark:bg-neutral-900/40 border-y border-neutral-200/50 dark:border-neutral-800/50 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                Get a Tutor in 3 Easy Steps
              </h2>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-3">
                Our matching system takes the hassle out of finding the right tutoring match.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 relative perspective-1000">
              {/* Stepper Connecting Lines (Desktop only) */}
              <div className="hidden lg:block absolute top-14 left-[15%] right-[15%] h-0.5 bg-neutral-250 dark:bg-neutral-800 -z-10" />

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm relative group hover-3d-card preserve-3d">
                <div className="absolute top-[-20px] h-10 w-10 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-md group-hover:scale-110 transition-transform translate-z-30">
                  1
                </div>
                <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mt-4 mb-5 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 translate-z-30">
                  <BookOpen size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white translate-z-20">Share Requirements</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-2 leading-relaxed translate-z-20">
                  Fill our simple request form detailing class, subjects, location, budget, and preferences.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm relative group hover-3d-card preserve-3d">
                <div className="absolute top-[-20px] h-10 w-10 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-md group-hover:scale-110 transition-transform translate-z-30">
                  2
                </div>
                <div className="h-16 w-16 rounded-2xl bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center mt-4 mb-5 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-300 translate-z-30">
                  <Clock3 size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white translate-z-20">Free 1-Hour Demo</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-455 mt-2 leading-relaxed translate-z-20">
                  We schedule a free trial demo session in your home or online with the most qualified matching tutor.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm relative group hover-3d-card preserve-3d">
                <div className="absolute top-[-20px] h-10 w-10 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-md group-hover:scale-110 transition-transform translate-z-30">
                  3
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-4 mb-5 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 translate-z-30">
                  <Globe2 size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white translate-z-20">Confirm & Start</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-2 leading-relaxed translate-z-20">
                  Approve the tutor after the demo, finalize tuition scheduling, and begin matching classes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                What Parents & Tutors Say
              </h2>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-3">
                Read direct stories of academic growth and client satisfaction.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 perspective-1000">
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/30 glass-morphic shadow-lg hover-3d-card preserve-3d flex flex-col justify-between"
                >
                  <div className="translate-z-20">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-accent-500 text-accent-500" />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-250/30 dark:border-neutral-850 flex items-center gap-3 translate-z-30">
                    <div className="h-10 w-10 rounded-full bg-brand-500/15 flex items-center justify-center font-extrabold text-brand-650 dark:text-brand-350">
                      {t.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">{t.name}</h4>
                      <p className="text-[11px] font-bold text-neutral-400 mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tutor CTA Banner */}
        <section className="py-16 bg-gradient-to-tr from-brand-700 via-brand-550 to-accent-600 text-white select-none relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent)]" />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-4 relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Are You a Passionate Home Tutor?</h2>
            <p className="max-w-xl text-sm text-white/85 leading-relaxed">
              Earn a highly competitive income by teaching students in your preferred areas. Access match support and clear monthly payouts.
            </p>
            <Link href="/tutor-registration" className="mt-4 hover:scale-105 active:scale-98 transition-transform">
              <Button size="lg" className="border-none bg-white text-brand-700 hover:bg-neutral-50 font-extrabold shadow-xl shadow-brand-500/10">
                Join our Tutor Network
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-3">
                Have questions about our service model? Find quick answers below.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/60 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4 text-left font-bold flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <span className="text-sm md:text-base text-neutral-850 dark:text-neutral-100">{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-neutral-450 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? "max-h-[300px] border-t border-neutral-100 dark:border-neutral-800" : "max-h-0"
                      }`}
                    >
                      <p className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/50 dark:bg-neutral-900/30">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
