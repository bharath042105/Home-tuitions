"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
  BookOpen,
  User,
  Mail,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { leadsApi } from "@/lib/api/leads";

const STEPS = ["Academic Details", "Tuition Preferences", "Contact Info"];

const CLASS_OPTIONS = [
  "Nursery / LKG / UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10 (Board)",
  "Class 11 (Intermediate / 1st Year)",
  "Class 12 (Intermediate / 2nd Year)",
  "IIT-JEE Foundation & Advanced",
  "NEET / Medical Prep",
  "Degree / B.Tech / Graduation",
  "Coding & Languages",
  "Other / Competitive Exams"
];

const BOARD_OPTIONS = ["CBSE", "ICSE / ISC", "SSC (State Board)", "IGCSE / IB", "Other"];

const SUBJECT_OPTIONS = [
  "ALL Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "General Science",
  "Social Studies",
  "English & Grammar",
  "Hindi",
  "Telugu",
  "Sanskrit",
  "Computer Science (Python/Java)",
  "Coding (Scratch/Blockly)",
  "Accountancy & Economics"
];

function RequestTutorForm() {
  const searchParams = useSearchParams();

  // Form Step State
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: leadsApi.submitTuitionInquiry,
    onSuccess: () => setIsSubmitted(true),
  });

  // Form Data State
  const [grade, setGrade] = useState("");
  const [board, setBoard] = useState("CBSE");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [tuitionMode, setTuitionMode] = useState("HOME"); // HOME or ONLINE
  const [address, setAddress] = useState("");
  const [timingOption, setTimingOption] = useState("Evening (4 PM - 8 PM)");
  const [customTiming, setCustomTiming] = useState("");
  const [frequency, setFrequency] = useState("5 Days a Week");
  const [parentName, setParentName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("3000 - 5000 / Month");
  const [remarks, setRemarks] = useState("");

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prepopulate from URL query params
  useEffect(() => {
    const urlClass = searchParams.get("class");
    const urlSubject = searchParams.get("subject");
    const urlType = searchParams.get("type");

    if (urlClass) {
      if (urlClass === "Nursery-UKG") setGrade("Nursery / LKG / UKG");
      else if (urlClass === "Class 1-5") setGrade("Class 5");
      else if (urlClass === "Class 6-8") setGrade("Class 8");
      else if (urlClass === "Class 9-10") setGrade("Class 10 (Board)");
      else if (urlClass === "Class 11-12") setGrade("Class 12 (Intermediate / 2nd Year)");
      else if (urlClass === "IIT-JEE/NEET") setGrade("IIT-JEE Foundation & Advanced");
      else setGrade(urlClass);
    }

    if (urlSubject) {
      setSelectedSubjects([urlSubject]);
    }

    if (urlType === "ONLINE" || urlType === "HOME") {
      setTuitionMode(urlType);
    }
  }, [searchParams]);

  // Handle Subject Select
  const toggleSubject = (subject: string) => {
    if (subject === "ALL Subjects") {
      if (selectedSubjects.includes("ALL Subjects")) {
        setSelectedSubjects([]);
      } else {
        setSelectedSubjects(["ALL Subjects"]);
      }
      setErrors((prev) => ({ ...prev, subjects: "" }));
      return;
    }

    setSelectedSubjects((prev) => {
      const filtered = prev.filter((s) => s !== "ALL Subjects");
      return filtered.includes(subject)
        ? filtered.filter((s) => s !== subject)
        : [...filtered, subject];
    });
    setErrors((prev) => ({ ...prev, subjects: "" }));
  };

  const getEffectiveTimings = () => {
    if (timingOption === "Custom Timing") {
      return customTiming.trim() || "Custom Timing (Flexible)";
    }
    return timingOption;
  };

  // Validations
  const validateStep = () => {
    const stepErrors: Record<string, string> = {};
    if (activeStep === 0) {
      if (!grade) stepErrors.grade = "Please select a class/grade";
      if (!board) stepErrors.board = "Please select a board";
      if (selectedSubjects.length === 0) stepErrors.subjects = "Select at least one subject";
    } else if (activeStep === 1) {
      if (tuitionMode === "HOME" && !address.trim()) {
        stepErrors.address = "Address is required for in-person home tuition";
      }
      if (timingOption === "Custom Timing" && !customTiming.trim()) {
        stepErrors.timings = "Please enter your custom preferred timing";
      }
    } else if (activeStep === 2) {
      if (!parentName.trim()) stepErrors.parentName = "Full name is required";
      if (!mobile.trim()) {
        stepErrors.mobile = "Mobile number is required";
      } else if (!/^\d{10}$/.test(mobile.replace(/\s+/g, ""))) {
        stepErrors.mobile = "Please enter a valid 10-digit mobile number";
      }
      if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
        stepErrors.email = "Please enter a valid email address";
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      submitMutation.mutate({
        grade,
        board,
        subjects: selectedSubjects,
        tuitionMode,
        address: tuitionMode === "HOME" ? address : undefined,
        timings: getEffectiveTimings(),
        frequency,
        parentName,
        mobile,
        email: email.trim() || undefined,
        budget,
        remarks: remarks.trim() || undefined,
      });
    }
  };

  if (isSubmitted) {
    const effectiveTimings = getEffectiveTimings();
    const whatsappText = `*New Tutor Request Details - Vidya Home Tuitions*\n\n` +
      `*Parent/Student:* ${parentName}\n` +
      `*Phone:* +91 ${mobile}\n` +
      `*Email:* ${email || "Not specified"}\n` +
      `*Class/Grade:* ${grade}\n` +
      `*Board:* ${board}\n` +
      `*Subject(s):* ${selectedSubjects.join(", ")}\n` +
      `*Mode:* ${tuitionMode === "HOME" ? "Home Tuition" : "Online 1-on-1"}\n` +
      (tuitionMode === "HOME" && address ? `*Location:* ${address}\n` : "") +
      `*Timings:* ${effectiveTimings}\n` +
      `*Frequency:* ${frequency}\n` +
      `*Budget:* ${budget}\n` +
      (remarks ? `*Special Notes:* ${remarks}\n` : "") +
      `\nPlease assist with tutor allocation.`;

    const whatsappUrl = `https://wa.me/918074470640?text=${encodeURIComponent(whatsappText)}`;
    const emailMailto = `mailto:vidyatutorspoint@gmail.com,info@vidyahometuitions.com?subject=${encodeURIComponent(`New Tutor Request: ${parentName} - ${grade}`)}&body=${encodeURIComponent(whatsappText.replace(/\*/g, ""))}`;

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950/20">
        <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Request Submitted!</h2>
            <p className="text-sm text-neutral-550 dark:text-neutral-400 leading-relaxed">
              Thank you, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{parentName}</span>. We have successfully registered your inquiry for <span className="font-semibold text-neutral-800 dark:text-neutral-200">{grade} ({selectedSubjects.join(", ")})</span>.
            </p>
          </div>
          <div className="p-4 w-full rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 text-xs text-left flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Class & Board:</span>
              <span className="font-semibold">{grade} - {board}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Subject(s):</span>
              <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedSubjects.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Tuition Type & Timing:</span>
              <span className="font-semibold">{tuitionMode === "HOME" ? "Home Tuition" : "Online Live 1-on-1"} | {effectiveTimings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Contact Number:</span>
              <span className="font-semibold">+91 {mobile}</span>
            </div>
          </div>

          <div className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              ✅ Your complete request details have been automatically sent to our academic coordinators.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 w-full">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01]"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.983.536 1.83.827 2.796.827 3.182 0 5.768-2.586 5.768-5.766 0-3.18-2.586-5.714-5.768-5.714zm3.385 8.163c-.143.403-.828.74-1.15.787-.323.047-.743.08-2.128-.491-1.63-.672-2.67-2.327-2.752-2.436-.081-.109-.661-.879-.661-1.674 0-.795.419-1.186.568-1.344.15-.157.327-.197.436-.197.109 0 .218.001.314.006.101.005.237-.038.37.284.137.329.467 1.139.508 1.222.041.083.068.181.014.289-.055.109-.082.176-.164.272-.082.096-.173.214-.247.288-.082.082-.168.172-.072.336.096.164.427.705.916 1.141.629.561 1.159.734 1.323.816.164.082.26-.07.356-.179.096-.109.41-.478.52-.642.109-.164.218-.137.368-.082.15.055.956.451 1.12.533.164.082.273.123.314.191.041.069.041.396-.102.8z" />
              </svg>
              Chat on WhatsApp for Instant Support (Optional)
            </a>
          </div>

          <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Sparkles size={14} />
            Our Academic Expert will call you within 4 hours.
          </p>
          <Link href="/" className="w-full">
            <Button className="w-full font-semibold">Back to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Top bar with back to homepage link */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-brand-500 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>
        <span className="text-xs text-neutral-400">Need help? Call +91 80744 70640</span>
      </div>

      {/* Card Frame */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 to-accent-500" />

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Request a Professional Tutor
          </h1>
          <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-2">
            Tell us your requirements and we will match you with verified educators in Hyderabad. First class is free!
          </p>
        </div>

        {/* Stepper Progress */}
        <Stepper steps={STEPS} activeIndex={activeStep} className="mb-10" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* STEP 1: Academic Details */}
          {activeStep === 0 && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    1. Select Grade / Class <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      setErrors((prev) => ({ ...prev, grade: "" }));
                    }}
                    className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                      errors.grade ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                    }`}
                  >
                    <option value="">-- Select Grade --</option>
                    {CLASS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {errors.grade && <p className="text-xs text-danger-500 mt-1">{errors.grade}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    2. Select Board / Syllabus <span className="text-danger-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOARD_OPTIONS.slice(0, 4).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setBoard(opt);
                          setErrors((prev) => ({ ...prev, board: "" }));
                        }}
                        className={`h-11 px-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                          board === opt
                            ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                            : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-850"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                  3. Select Subject(s) <span className="text-danger-500">*</span>
                </label>
                <p className="text-xs text-neutral-400 mb-3">You can select multiple subjects matching your requirements.</p>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-full border transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                            : "border-neutral-200 hover:border-neutral-350 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
                {errors.subjects && <p className="text-xs text-danger-500 mt-2">{errors.subjects}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Tuition Preferences */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-3">
                  1. Tuition Mode <span className="text-danger-500">*</span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTuitionMode("HOME")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      tuitionMode === "HOME"
                        ? "border-brand-500 bg-brand-50/45 ring-2 ring-brand-500/10 dark:bg-brand-500/5"
                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-850"
                    }`}
                  >
                    <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <MapPin size={16} className="text-brand-500" />
                      In-Home Tuition
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Tutor visits your home in Hyderabad for face-to-face coaching.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTuitionMode("ONLINE")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      tuitionMode === "ONLINE"
                        ? "border-brand-500 bg-brand-50/45 ring-2 ring-brand-500/10 dark:bg-brand-500/5"
                        : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-850"
                    }`}
                  >
                    <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <BookOpen size={16} className="text-brand-500" />
                      Online Live 1-on-1
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Interactive lessons via our digital whiteboard portal.
                    </span>
                  </button>
                </div>
              </div>

              {tuitionMode === "HOME" && (
                <div className="animate-fade-in-up">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    2. Home Address & Locality in Hyderabad <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors((prev) => ({ ...prev, address: "" }));
                    }}
                    placeholder="e.g. Flat 302, Sai Enclave, Chanda Nagar, Near Jyothi Theatre"
                    rows={3}
                    className={`w-full p-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                      errors.address ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                    }`}
                  />
                  {errors.address && <p className="text-xs text-danger-500 mt-1">{errors.address}</p>}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    3. Preferred Study Timings <span className="text-danger-500">*</span>
                  </label>
                  <select
                    value={timingOption}
                    onChange={(e) => {
                      setTimingOption(e.target.value);
                      setErrors((prev) => ({ ...prev, timings: "" }));
                    }}
                    className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                    <option value="Late Evening (6 PM - 9 PM)">Late Evening (6 PM - 9 PM)</option>
                    <option value="Morning (6 AM - 9 AM)">Morning (6 AM - 9 AM)</option>
                    <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                    <option value="Weekends Only (Sat & Sun)">Weekends Only (Sat & Sun)</option>
                    <option value="Custom Timing">Custom Timing (Specify your timing)</option>
                  </select>

                  {timingOption === "Custom Timing" && (
                    <div className="mt-2.5 animate-fade-in-up">
                      <input
                        type="text"
                        value={customTiming}
                        onChange={(e) => {
                          setCustomTiming(e.target.value);
                          setErrors((prev) => ({ ...prev, timings: "" }));
                        }}
                        placeholder="e.g. 5:30 PM - 7:00 PM or Early Morning 6 AM"
                        className={`w-full h-10 px-3 rounded-lg border bg-white text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                          errors.timings ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                        }`}
                      />
                      {errors.timings && <p className="text-xs text-danger-500 mt-1">{errors.timings}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    4. Frequency per Week
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="5 Days a Week">5 Days a Week (Mon-Fri)</option>
                    <option value="3 Days a Week">3 Days a Week (Alternate Days)</option>
                    <option value="2 Days a Week">2 Days a Week (Sat & Sun)</option>
                    <option value="Daily">Daily (7 Days)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Contact & Budget Info */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in-up">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    1. Parent / Student Full Name <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/3 text-neutral-400" />
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => {
                        setParentName(e.target.value);
                        setErrors((prev) => ({ ...prev, parentName: "" }));
                      }}
                      placeholder="e.g. Anand Kumar"
                      className={`w-full h-11 pl-10 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                        errors.parentName ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                      }`}
                    />
                  </div>
                  {errors.parentName && <p className="text-xs text-danger-500 mt-1">{errors.parentName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    2. Mobile Number (10 Digit) <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm text-neutral-450 font-semibold">+91</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value);
                        setErrors((prev) => ({ ...prev, mobile: "" }));
                      }}
                      placeholder="98765 43210"
                      className={`w-full h-11 pl-12 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                        errors.mobile ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                      }`}
                    />
                  </div>
                  {errors.mobile && <p className="text-xs text-danger-500 mt-1">{errors.mobile}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    3. Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/3 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="parent@domain.com"
                      className={`w-full h-11 pl-10 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                        errors.email ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                    4. Monthly Budget Range
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="Under 3000 / Month">Under ₹3,000 / Month</option>
                    <option value="3000 - 5000 / Month">₹3,000 - ₹5,000 / Month</option>
                    <option value="5000 - 8000 / Month">₹5,050 - ₹8,000 / Month</option>
                    <option value="8000 - 12000 / Month">₹8,000 - ₹12,000 / Month</option>
                    <option value="Above 12000 / Month">Above ₹12,000 / Month</option>
                    <option value="Per Hour Basis">On Hourly Basis (e.g. ₹300-500/hr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                  5. Any Special Requirements / Topics to Focus
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Student needs extra help in algebra, or prefers a female tutor with 5+ years of experience."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-6 mt-4">
            {activeStep > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="font-semibold text-xs h-10 px-4"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {activeStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="font-semibold text-xs h-10 px-4"
              >
                Next Step
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                loading={submitMutation.isPending}
                className="font-semibold text-xs h-10 px-6 shadow-md shadow-brand-500/10"
              >
                Submit Tutor Request
                <CheckCircle2 size={16} />
              </Button>
            )}
          </div>

          {submitMutation.isError && (
            <p role="alert" className="text-sm text-danger-500">
              Something went wrong submitting your request - please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default function RequestTutorPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 transition-colors flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <p className="text-sm text-neutral-450">Loading request form...</p>
          </div>
        }
      >
        <RequestTutorForm />
      </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
