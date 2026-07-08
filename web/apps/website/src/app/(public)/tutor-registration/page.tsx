"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CheckCircle2,
  Phone,
  User,
  Mail,
  GraduationCap,
  Sparkles,
  MapPin,
  Upload,
  ArrowRight,
  BookOpen,
  Briefcase,
  Award,
  Lock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";

const STEP_HEADERS = [
  { id: 1, title: "Step 1 : Personal Details" },
  { id: 2, title: "Step 2 : Location Details" },
  { id: 3, title: "Step 3 : Tutoring Profile" },
  { id: 4, title: "Step 4 : Contact Information" },
  { id: 5, title: "Step 5 : Additional Information" },
  { id: 6, title: "Step 6 : Upload Documents" }
];

const GRADE_LEVELS = [
  "Nursery - UKG",
  "Class 1 - 5",
  "Class 6 - 8",
  "Class 9 - 10 (Secondary)",
  "Class 11 - 12 (Intermediate)",
  "IIT-JEE Prep",
  "NEET Prep",
  "Coding & Programming"
];

const BOARD_OPTIONS = ["CBSE", "ICSE / ISC", "SSC (Telangana Board)", "IGCSE / IB"];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "General Science",
  "Social Studies",
  "English Literature & Grammar",
  "Hindi / Sanskrit",
  "Telugu",
  "Python / Java Programming",
  "Web Development"
];

export default function TutorRegistrationPage() {
  const [activeStep, setActiveStep] = useState(0); // 0 to 5
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State - Step 1: Personal
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [qualification, setQualification] = useState("");
  const [college, setCollege] = useState("");
  const [percentage, setPercentage] = useState("");
  const [passYear, setPassYear] = useState("");
  const [interCollege, setInterCollege] = useState("");
  const [interPercentage, setInterPercentage] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolPercentage, setSchoolPercentage] = useState("");

  // Form State - Step 2: Location
  const [localities, setLocalities] = useState("");
  const [commuteDistance, setCommuteDistance] = useState("Within 5 km");

  // Form State - Step 3: Tutoring Profile
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [medium, setMedium] = useState("English");
  const [mode, setMode] = useState("BOTH"); // HOME, ONLINE, BOTH

  // Form State - Step 4: Contact
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [alternativePhone, setAlternativePhone] = useState("");
  const [email, setEmail] = useState("");

  // Form State - Step 5: Additional
  const [occupation, setOccupation] = useState("SCHOOL");
  const [experience, setExperience] = useState("Fresher");
  const [expectedRate, setExpectedRate] = useState("");
  const [timings, setTimings] = useState("Evening (4 PM - 8 PM)");
  const [bio, setBio] = useState("");

  // Form State - Step 6: Uploads (File names placeholders)
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [degreeFile, setDegreeFile] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(null);

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 0) {
      if (!name.trim()) stepErrors.name = "Full name is required";
      if (!fatherName.trim()) stepErrors.fatherName = "Father's name is required";
      if (!qualification.trim()) stepErrors.qualification = "Highest qualification is required";
      if (!college.trim()) stepErrors.college = "College/University is required";
      if (!percentage.trim()) stepErrors.percentage = "Percentage is required";
      if (!passYear.trim() || !/^\d{4}$/.test(passYear)) stepErrors.passYear = "Enter a valid passing year";
      if (!interCollege.trim()) stepErrors.interCollege = "Intermediate college name is required";
      if (!interPercentage.trim()) stepErrors.interPercentage = "Intermediate percentage is required";
      if (!schoolName.trim()) stepErrors.schoolName = "10th Class school name is required";
      if (!schoolPercentage.trim()) stepErrors.schoolPercentage = "10th Class percentage is required";
    } else if (step === 1) {
      if (!localities.trim()) stepErrors.localities = "Preferred localities are required";
    } else if (step === 2) {
      if (selectedGrades.length === 0) stepErrors.grades = "Select at least one class grade";
      if (selectedSubjects.length === 0) stepErrors.subjects = "Select at least one subject to teach";
      if (selectedBoards.length === 0) stepErrors.boards = "Select at least one target board";
    } else if (step === 3) {
      if (!mobile.trim() || !/^\d{10}$/.test(mobile)) stepErrors.mobile = "Valid 10-digit mobile is required";
      if (!whatsapp.trim() || !/^\d{10}$/.test(whatsapp)) stepErrors.whatsapp = "Valid 10-digit WhatsApp number is required";
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) stepErrors.email = "Valid email address is required";
    } else if (step === 4) {
      if (!expectedRate.trim()) stepErrors.expectedRate = "Expected rate is required";
    } else if (step === 5) {
      if (!photoFile) stepErrors.photo = "Please upload profile photo";
      if (!aadhaarFile) stepErrors.aadhaar = "Please upload Aadhaar card (front & back)";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSaveAndContinue = (step: number) => {
    if (validateStep(step)) {
      if (!completedSteps.includes(step)) {
        setCompletedSteps((prev) => [...prev, step]);
      }
      setActiveStep(step + 1);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(5)) {
      setIsSubmitted(true);
    }
  };

  const handleHeaderClick = (stepIndex: number) => {
    // Tutors can jump back to edit any step they have already unlocked/completed, or if it is the current step
    if (stepIndex <= activeStep || completedSteps.includes(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Registration Submitted!</h2>
            <p className="text-sm text-neutral-550 dark:text-neutral-400 leading-relaxed">
              Congratulations, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</span>. Your detailed academic profile is in the queue.
            </p>
          </div>

          <div className="w-full text-left rounded-xl border border-neutral-100 bg-neutral-50/50 p-5 dark:border-neutral-850 dark:bg-neutral-900/50">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-accent-500" />
              Next Onboarding Stages
            </h3>
            <ol className="flex flex-col gap-3.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Credentials Screening</span>
                  <p className="mt-0.5">We will review your educational transcripts and certificate uploads.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Demo Lecture Call</span>
                  <p className="mt-0.5">A coordinating manager will schedule a 15-minute mock teaching session on your chosen topics.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">Local matching</span>
                  <p className="mt-0.5">Get matched with local home students or online 1-on-1 requirements in Hyderabad.</p>
                </div>
              </li>
            </ol>
          </div>

          <Link href="/" className="w-full">
            <Button className="w-full font-semibold">Back to Homepage</Button>
          </Link>
        </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950/20 transition-colors flex flex-col">
      <SiteHeader />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Top Link */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-brand-500 transition-colors">
            <ChevronLeft size={16} />
            Back to Home
          </Link>
          <span className="text-xs text-neutral-450">Hyderabad's Elite Tutor Network</span>
        </div>

        {/* Info Banner */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
            Tutor Registration Form
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Complete the 6 steps below. We require qualification percentages and documents to verify background standards.
          </p>
        </div>

        {/* 6-Step Accordion Stack */}
        <div className="flex flex-col gap-3">
          {STEP_HEADERS.map((step, idx) => {
            const isOpen = activeStep === idx;
            const isCompleted = completedSteps.includes(idx);
            const isLocked = idx > activeStep && !isCompleted;

            return (
              <div
                key={step.id}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? "border-brand-500 bg-white shadow-md dark:border-brand-500 dark:bg-neutral-900"
                    : isLocked
                    ? "border-neutral-200 bg-neutral-50/55 dark:border-neutral-850 dark:bg-neutral-900/30 opacity-70"
                    : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/80 cursor-pointer"
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleHeaderClick(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-sm sm:text-base text-neutral-900 dark:text-white focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <span className={`h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 border ${
                        isOpen ? "bg-brand-500 border-brand-500 text-white" : "border-neutral-400 text-neutral-450"
                      }`}>
                        {step.id}
                      </span>
                    )}
                    {step.title}
                  </span>
                  {!isLocked && (
                    <ChevronDown
                      size={18}
                      className={`text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`}
                    />
                  )}
                </button>

                {/* Accordion Content Panel */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[1400px] border-t border-neutral-100 dark:border-neutral-800" : "max-h-0"
                  }`}
                >
                  <div className="p-6">
                    {/* STEP 1: Personal Details */}
                    {idx === 0 && (
                      <div className="flex flex-col gap-5 animate-fade-in-up">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Tutor Full Name *</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }}
                              placeholder="Name as in Aadhaar card"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Father's Name *</label>
                            <input
                              type="text"
                              value={fatherName}
                              onChange={(e) => { setFatherName(e.target.value); setErrors(prev => ({ ...prev, fatherName: "" })); }}
                              placeholder="Father's Name"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.fatherName && <p className="text-xs text-danger-500 mt-1">{errors.fatherName}</p>}
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Highest Qualification *</label>
                            <input
                              type="text"
                              value={qualification}
                              onChange={(e) => { setQualification(e.target.value); setErrors(prev => ({ ...prev, qualification: "" })); }}
                              placeholder="e.g. M.Sc Chemistry, B.Tech CSE"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.qualification && <p className="text-xs text-danger-500 mt-1">{errors.qualification}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">College / University *</label>
                            <input
                              type="text"
                              value={college}
                              onChange={(e) => { setCollege(e.target.value); setErrors(prev => ({ ...prev, college: "" })); }}
                              placeholder="University / Institute name"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.college && <p className="text-xs text-danger-500 mt-1">{errors.college}</p>}
                          </div>
                        </div>

                        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Graduation Pass Percentage *</label>
                            <input
                              type="text"
                              value={percentage}
                              onChange={(e) => { setPercentage(e.target.value); setErrors(prev => ({ ...prev, percentage: "" })); }}
                              placeholder="e.g. 78.5% or 8.2 CGPA"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.percentage && <p className="text-xs text-danger-500 mt-1">{errors.percentage}</p>}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Year of Passing Out *</label>
                            <input
                              type="text"
                              value={passYear}
                              onChange={(e) => { setPassYear(e.target.value); setErrors(prev => ({ ...prev, passYear: "" })); }}
                              placeholder="e.g. 2024"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.passYear && <p className="text-xs text-danger-500 mt-1">{errors.passYear}</p>}
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Intermediate College Name *</label>
                            <input
                              type="text"
                              value={interCollege}
                              onChange={(e) => { setInterCollege(e.target.value); setErrors(prev => ({ ...prev, interCollege: "" })); }}
                              placeholder="College Name"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.interCollege && <p className="text-xs text-danger-500 mt-1">{errors.interCollege}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Intermediate Percentage *</label>
                            <input
                              type="text"
                              value={interPercentage}
                              onChange={(e) => { setInterPercentage(e.target.value); setErrors(prev => ({ ...prev, interPercentage: "" })); }}
                              placeholder="e.g. 91% or 950/1000"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.interPercentage && <p className="text-xs text-danger-500 mt-1">{errors.interPercentage}</p>}
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">10th Class School Name *</label>
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => { setSchoolName(e.target.value); setErrors(prev => ({ ...prev, schoolName: "" })); }}
                              placeholder="School Name"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.schoolName && <p className="text-xs text-danger-500 mt-1">{errors.schoolName}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">10th Class Percentage / GPA *</label>
                            <input
                              type="text"
                              value={schoolPercentage}
                              onChange={(e) => { setSchoolPercentage(e.target.value); setErrors(prev => ({ ...prev, schoolPercentage: "" })); }}
                              placeholder="e.g. 92% or 9.5 GPA"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.schoolPercentage && <p className="text-xs text-danger-500 mt-1">{errors.schoolPercentage}</p>}
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(0)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 2: Location Details */}
                    {idx === 1 && (
                      <div className="flex flex-col gap-5 animate-fade-in-up">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Preferred Areas in Hyderabad *</label>
                          <textarea
                            value={localities}
                            onChange={(e) => { setLocalities(e.target.value); setErrors(prev => ({ ...prev, localities: "" })); }}
                            placeholder="Type localities where you can teach offline (e.g. Chanda Nagar, Miyapur, Kukatpally, Madhapur)"
                            rows={3}
                            className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          />
                          {errors.localities && <p className="text-xs text-danger-500 mt-1">{errors.localities}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 font-bold">Max Comuting Range</label>
                          <select
                            value={commuteDistance}
                            onChange={(e) => setCommuteDistance(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                            <option value="Within 5 km">Within 5 km from my home</option>
                            <option value="Within 10 km">Within 10 km from my home</option>
                            <option value="Within 15 km">Within 15 km from my home</option>
                            <option value="Anywhere in Hyderabad">Anywhere in Hyderabad</option>
                            <option value="No travel">No travel - Online tutoring only</option>
                          </select>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(1)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 3: Tutoring Profile */}
                    {idx === 2 && (
                      <div className="flex flex-col gap-5 animate-fade-in-up">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 mb-2 uppercase tracking-wide">1. Classes you can Teach *</label>
                          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                            {GRADE_LEVELS.map((g) => {
                              const isSel = selectedGrades.includes(g);
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                  className={`h-9 text-xs font-semibold rounded-lg border text-left px-3 transition-all ${
                                    isSel ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                          {errors.grades && <p className="text-xs text-danger-500 mt-1">{errors.grades}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 mb-2 uppercase tracking-wide">2. Subjects *</label>
                          <div className="flex flex-wrap gap-2">
                            {SUBJECT_OPTIONS.map((sub) => {
                              const isSel = selectedSubjects.includes(sub);
                              return (
                                <button
                                  key={sub}
                                  type="button"
                                  onClick={() => setSelectedSubjects(prev => prev.includes(sub) ? prev.filter(x => x !== sub) : [...prev, sub])}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                    isSel ? "border-brand-500 bg-brand-500 text-white" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                  }`}
                                >
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                          {errors.subjects && <p className="text-xs text-danger-500 mt-1">{errors.subjects}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 mb-2 uppercase tracking-wide">3. Boards Syllabus *</label>
                          <div className="flex flex-wrap gap-2">
                            {BOARD_OPTIONS.map((b) => {
                              const isSel = selectedBoards.includes(b);
                              return (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => setSelectedBoards(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                                    isSel ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50"
                                  }`}
                                >
                                  {b}
                                </button>
                              );
                            })}
                          </div>
                          {errors.boards && <p className="text-xs text-danger-500 mt-1">{errors.boards}</p>}
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Medium of Instruction</label>
                            <select
                              value={medium}
                              onChange={(e) => setMedium(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="English">English</option>
                              <option value="Telugu">Telugu</option>
                              <option value="Hindi">Hindi</option>
                              <option value="English & Telugu">English & Telugu</option>
                              <option value="English & Hindi">English & Hindi</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Instruction Mode</label>
                            <select
                              value={mode}
                              onChange={(e) => setMode(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="HOME">Offline (Visit student home)</option>
                              <option value="ONLINE">Online 1-on-1 classes</option>
                              <option value="BOTH">Flexible (Both Offline & Online)</option>
                            </select>
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(2)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 4: Contact Information */}
                    {idx === 3 && (
                      <div className="flex flex-col gap-5 animate-fade-in-up">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Primary Mobile Number *</label>
                            <input
                              type="tel"
                              value={mobile}
                              onChange={(e) => { setMobile(e.target.value); setErrors(prev => ({ ...prev, mobile: "" })); }}
                              placeholder="10 digit phone number"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.mobile && <p className="text-xs text-danger-500 mt-1">{errors.mobile}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">WhatsApp Mobile Number *</label>
                            <input
                              type="tel"
                              value={whatsapp}
                              onChange={(e) => { setWhatsapp(e.target.value); setErrors(prev => ({ ...prev, whatsapp: "" })); }}
                              placeholder="10 digit Whatsapp number"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.whatsapp && <p className="text-xs text-danger-500 mt-1">{errors.whatsapp}</p>}
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Alternative Phone Number</label>
                            <input
                              type="tel"
                              value={alternativePhone}
                              onChange={(e) => setAlternativePhone(e.target.value)}
                              placeholder="Alternative phone number"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Email Address *</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                              placeholder="tutor@domain.com"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(3)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 5: Additional Information */}
                    {idx === 4 && (
                      <div className="flex flex-col gap-5 animate-fade-in-up">
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Current Occupation</label>
                            <select
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="SCHOOL">School Teacher</option>
                              <option value="COLLEGE">College Lecturer</option>
                              <option value="TUTOR">Full-time Private Tutor</option>
                              <option value="STUDENT">College Student (M.Sc/B.Tech)</option>
                              <option value="OTHER">Other Professional</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Teaching Experience</label>
                            <select
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="Fresher">Fresher (Under 1 year)</option>
                              <option value="1-2 Years">1 to 2 Years</option>
                              <option value="3-5 Years">3 to 5 Years</option>
                              <option value="6-10 Years">6 to 10 Years</option>
                              <option value="10+ Years">More than 10 Years</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Expected Pay Rate *</label>
                            <input
                              type="text"
                              value={expectedRate}
                              onChange={(e) => { setExpectedRate(e.target.value); setErrors(prev => ({ ...prev, expectedRate: "" })); }}
                              placeholder="e.g. ₹5,000/month or ₹400/hour"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                            {errors.expectedRate && <p className="text-xs text-danger-500 mt-1">{errors.expectedRate}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-350 mb-1.5">Available timings</label>
                            <select
                              value={timings}
                              onChange={(e) => setTimings(e.target.value)}
                              className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                              <option value="Late Evening (6 PM - 9 PM)">Late Evening (6 PM - 9 PM)</option>
                              <option value="Morning (7 AM - 9 AM)">Morning (7 AM - 9 AM)</option>
                              <option value="Weekends Only">Weekends Only</option>
                              <option value="Flexible timings">Flexible / Any timings</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 font-bold">Short Bio / Teaching Philosophy</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Introduce yourself to parents..."
                            rows={3}
                            className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-xs sm:text-sm focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          />
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(4)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 6: Upload Documents */}
                    {idx === 5 && (
                      <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="grid gap-6 sm:grid-cols-2">
                          {/* File 1: Profile Photo */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">1. Recent Profile Photo *</span>
                            <span className="text-[10px] text-neutral-500">Max size 2MB (JPEG/PNG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPhotoFile(file.name);
                                  setErrors(prev => ({ ...prev, photo: "" }));
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {photoFile && <span className="text-xs text-emerald-500 font-semibold">{photoFile}</span>}
                            {errors.photo && <p className="text-[11px] text-danger-500 font-semibold">{errors.photo}</p>}
                          </div>

                          {/* File 2: Aadhaar Card */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">2. Aadhaar Card (Front & Back) *</span>
                            <span className="text-[10px] text-neutral-500">Max size 4MB (PDF/JPEG)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setAadhaarFile(file.name);
                                  setErrors(prev => ({ ...prev, aadhaar: "" }));
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {aadhaarFile && <span className="text-xs text-emerald-500 font-semibold">{aadhaarFile}</span>}
                            {errors.aadhaar && <p className="text-[11px] text-danger-500 font-semibold">{errors.aadhaar}</p>}
                          </div>

                          {/* File 3: Degree Certificate */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">3. Graduation Certificate / Marksheet</span>
                            <span className="text-[10px] text-neutral-500">Max size 4MB (PDF/JPEG)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setDegreeFile(file.name);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {degreeFile && <span className="text-xs text-emerald-500 font-semibold">{degreeFile}</span>}
                          </div>

                          {/* File 4: Resume */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">4. Latest Resume / Curriculum Vitae</span>
                            <span className="text-[10px] text-neutral-500">Max size 3MB (PDF/Word)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setResumeFile(file.name);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {resumeFile && <span className="text-xs text-emerald-500 font-semibold">{resumeFile}</span>}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800 pt-5 mt-2">
                          <span className="text-[10px] text-neutral-450 flex items-center gap-1">
                            <Lock size={12} /> Encrypted, background check secured upload channel.
                          </span>
                          <Button type="submit" className="px-6 font-bold shadow-md shadow-brand-500/10">
                            Complete Registration
                            <CheckCircle2 size={16} />
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      </div>
      <SiteFooter />
    </div>
  );
}
