"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Calculator, Sparkles, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";

// Static Fee Structure Matrix
const FEE_TABLE = [
  {
    grade: "Nursery - Class 5",
    homeMonthly: "₹3,500 - ₹5,000",
    homeHourly: "₹200 - ₹300",
    onlineMonthly: "₹2,800 - ₹4,000",
    onlineHourly: "₹150 - ₹250"
  },
  {
    grade: "Class 6 - Class 8",
    homeMonthly: "₹4,500 - ₹6,000",
    homeHourly: "₹250 - ₹350",
    onlineMonthly: "₹3,600 - ₹4,800",
    onlineHourly: "₹200 - ₹300"
  },
  {
    grade: "Class 9 - Class 10 (Board)",
    homeMonthly: "₹6,000 - ₹8,000",
    homeHourly: "₹350 - ₹450",
    onlineMonthly: "₹4,800 - ₹6,400",
    onlineHourly: "₹300 - ₹400"
  },
  {
    grade: "Class 11 - Class 12 (Intermediate)",
    homeMonthly: "₹8,000 - ₹11,000",
    homeHourly: "₹450 - ₹600",
    onlineMonthly: "₹6,400 - ₹8,800",
    onlineHourly: "₹350 - ₹500"
  },
  {
    grade: "IIT-JEE / NEET Prep",
    homeMonthly: "₹12,000 - ₹18,000",
    homeHourly: "₹600 - ₹900",
    onlineMonthly: "₹9,500 - ₹14,000",
    onlineHourly: "₹500 - ₹750"
  }
];

export default function FeeStructurePage() {
  // Calculator States
  const [selectedGrade, setSelectedGrade] = useState("middle");
  const [selectedBoard, setSelectedBoard] = useState("CBSE");
  const [frequency, setFrequency] = useState(5); // 2, 3, 5
  const [mode, setMode] = useState("HOME"); // HOME or ONLINE

  // Estimated Outputs
  const [estMonthlyMin, setEstMonthlyMin] = useState(4500);
  const [estMonthlyMax, setEstMonthlyMax] = useState(6000);
  const [estHourlyMin, setEstHourlyMin] = useState(250);
  const [estHourlyMax, setEstHourlyMax] = useState(350);

  // Recalculate estimates when parameters change
  useEffect(() => {
    let baseMinMonthly = 4500;
    let baseMaxMonthly = 6000;
    let baseMinHourly = 250;
    let baseMaxHourly = 350;

    // Grade Modifier
    if (selectedGrade === "primary") {
      baseMinMonthly = 3500; baseMaxMonthly = 5000;
      baseMinHourly = 200; baseMaxHourly = 300;
    } else if (selectedGrade === "middle") {
      baseMinMonthly = 4500; baseMaxMonthly = 6000;
      baseMinHourly = 250; baseMaxHourly = 350;
    } else if (selectedGrade === "secondary") {
      baseMinMonthly = 6000; baseMaxMonthly = 8000;
      baseMinHourly = 350; baseMaxHourly = 450;
    } else if (selectedGrade === "higher") {
      baseMinMonthly = 8000; baseMaxMonthly = 11000;
      baseMinHourly = 450; baseMaxHourly = 600;
    } else if (selectedGrade === "competitive") {
      baseMinMonthly = 12000; baseMaxMonthly = 18000;
      baseMinHourly = 600; baseMaxHourly = 900;
    }

    // Board Modifier
    let boardFactor = 1.0;
    if (selectedBoard === "ICSE") boardFactor = 1.1; // ICSE is slightly premium
    if (selectedBoard === "SSC") boardFactor = 0.9;  // State Board slightly lower

    // Frequency Modifier (relative to 5 days standard)
    let frequencyFactor = 1.0;
    if (frequency === 2) frequencyFactor = 0.5; // Weekends
    if (frequency === 3) frequencyFactor = 0.75; // Alternate

    // Mode Modifier
    let modeFactor = 1.0;
    if (mode === "ONLINE") {
      modeFactor = 0.8; // Online is 20% cheaper
    }

    // Compute
    const monthlyMin = Math.round(baseMinMonthly * boardFactor * frequencyFactor * modeFactor);
    const monthlyMax = Math.round(baseMaxMonthly * boardFactor * frequencyFactor * modeFactor);
    const hourlyMin = Math.round(baseMinHourly * boardFactor * modeFactor);
    const hourlyMax = Math.round(baseMaxHourly * boardFactor * modeFactor);

    setEstMonthlyMin(Math.ceil(monthlyMin / 100) * 100);
    setEstMonthlyMax(Math.ceil(monthlyMax / 100) * 100);
    setEstHourlyMin(Math.ceil(hourlyMin / 10) * 10);
    setEstHourlyMax(Math.ceil(hourlyMax / 10) * 10);
  }, [selectedGrade, selectedBoard, frequency, mode]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors flex flex-col">
      <SiteHeader />
      <div className="flex-1 pb-20">
      {/* Header Banner */}
      <section className="relative py-16 bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="absolute -left-20 top-[-100px] h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[100px] dark:bg-brand-500/5" />
        <div className="absolute right-[-50px] top-[-50px] h-[350px] w-[350px] rounded-full bg-accent-500/10 blur-[100px] dark:bg-accent-500/5" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Transparent Tuition Fee Structure
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            No hidden charges. Clear, grade-based rates that depend on syllabus difficulty and tutoring mode.
          </p>
        </div>
      </section>

      {/* Main Grid: Calculator & Table */}
      <section className="py-12 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          
          {/* Left Column: Fee Calculator */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 opacity-20 blur-xl dark:opacity-30" />
            <div className="relative rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-1">
                <Calculator className="text-brand-500" size={20} />
                Interactive Fee Estimate Calculator
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 mb-6">
                Calculate estimated monthly and hourly budgets.
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                    1. Class Group
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="primary">Nursery to Class 5</option>
                    <option value="middle">Class 6 to Class 8</option>
                    <option value="secondary">Class 9 to Class 10</option>
                    <option value="higher">Class 11 to Class 12</option>
                    <option value="competitive">IIT-JEE / NEET Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                    2. Syllabus Board
                  </label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="CBSE">CBSE Board</option>
                    <option value="ICSE">ICSE / ISC Board</option>
                    <option value="SSC">SSC (State Board)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                    3. Weekly Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 5].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className={`h-10 text-xs font-bold rounded-md border transition-all ${
                          frequency === f
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                            : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {f === 2 ? "2 Days (Sat-Sun)" : f === 3 ? "3 Days (Alt)" : "5 Days (Mon-Fri)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                    4. Instruction Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("HOME")}
                      className={`h-10 text-xs font-bold rounded-md border transition-all ${
                        mode === "HOME"
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      }`}
                    >
                      In-Home (Offline)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("ONLINE")}
                      className={`h-10 text-xs font-bold rounded-md border transition-all ${
                        mode === "ONLINE"
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      }`}
                    >
                      Online 1-on-1
                    </button>
                  </div>
                </div>

                {/* Estimate Result Box */}
                <div className="mt-4 p-4 rounded-xl border border-brand-500/25 bg-brand-50/20 dark:bg-brand-500/5 flex flex-col gap-3">
                  <div className="flex justify-between items-baseline border-b border-brand-500/10 pb-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">Monthly Est:</span>
                    <span className="text-xl font-extrabold text-neutral-900 dark:text-white">
                      ₹{estMonthlyMin.toLocaleString()} - ₹{estMonthlyMax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">Hourly Rate:</span>
                    <span className="text-sm font-extrabold text-brand-650 dark:text-brand-450">
                      ₹{estHourlyMin} - ₹{estHourlyMax} / Hr
                    </span>
                  </div>
                </div>

                <Link
                  href={`/request-tutor?class=${
                    selectedGrade === "primary" ? "Class 1-5" : selectedGrade === "middle" ? "Class 6-8" : selectedGrade === "secondary" ? "Class 9-10" : selectedGrade === "higher" ? "Class 11-12" : "IIT-JEE/NEET"
                  }&type=${mode}`}
                  className="mt-2 w-full"
                >
                  <Button className="w-full font-bold shadow-md shadow-brand-500/10">
                    Request Tutor with this Budget
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Complete Matrix Table */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Complete Fee Schedule</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Below are standard ranges assuming full-month tutoring programs (5 days/week) or hourly sessions.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900/60 shadow-sm">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-900 font-semibold text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <th scope="col" className="px-4 py-3 sm:px-6">Class Group</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">Home Tuition (Monthly)</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">Home Tuition (Hourly)</th>
                    <th scope="col" className="px-4 py-3 sm:px-6">Online (Monthly)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                  {FEE_TABLE.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40">
                      <td className="px-4 py-4 sm:px-6 text-neutral-900 dark:text-white font-bold">{row.grade}</td>
                      <td className="px-4 py-4 sm:px-6 text-neutral-800 dark:text-neutral-200">{row.homeMonthly}</td>
                      <td className="px-4 py-4 sm:px-6">{row.homeHourly}</td>
                      <td className="px-4 py-4 sm:px-6 text-neutral-800 dark:text-neutral-200">{row.onlineMonthly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note Vows */}
            <div className="p-4 rounded-xl border border-neutral-100 bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-850 text-xs flex flex-col gap-2 leading-relaxed text-neutral-500 dark:text-neutral-400">
              <span className="font-bold text-neutral-750 dark:text-neutral-200 flex items-center gap-1.5 mb-1 text-xs">
                <Sparkles size={14} className="text-accent-500" />
                Notes on Payment Schedules:
              </span>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Monthly payments are calculated based on ~20 teaching sessions per month (5 sessions per week).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Tutors are paid punctually monthly. Payment releases are overseen by Vidya matching coordinators to avoid parental disputes.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span>Custom packages are available for short-term revisions, exam preps, or specialized entrance schedules.</span>
              </div>
            </div>

          </div>
        </div>
      </section>
      </div>
      <SiteFooter />
    </div>
  );
}
