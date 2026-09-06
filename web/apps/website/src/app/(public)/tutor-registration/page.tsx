"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Upload,
  User,
  GraduationCap,
  MapPin,
  BookOpen,
  Phone,
  Briefcase,
  Sparkles,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { leadsApi } from "@/lib/api/leads";
import { ApiError } from "@hometuitions/shared";

const STEPS = [
  { title: "Personal & Academic Info", icon: GraduationCap },
  { title: "Preferred Localities", icon: MapPin },
  { title: "Subjects & Classes", icon: BookOpen },
  { title: "Contact Numbers", icon: Phone },
  { title: "Experience & Pay", icon: Briefcase },
  { title: "Upload Documents", icon: Upload },
];

const GRADES = [
  "Class 1 - 5 (Primary)",
  "Class 6 - 8 (Middle School)",
  "Class 9 - 10 (Secondary / Board)",
  "Class 11 - 12 (Intermediate / +2)",
  "IIT-JEE / NEET Foundation",
  "Degree / Engineering Subjects",
  "Coding & Programming",
  "Spoken English & Languages",
];

const BOARDS = [
  "CBSE",
  "ICSE / ISC",
  "SSC (State Board)",
  "IGCSE / IB (International)",
];

const SUBJECTS = [
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
  "Accountancy & Economics",
  "Commerce / Civics",
  "Engineering Maths / Core",
];

export default function TutorRegistrationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State - Step 1: Personal & Education
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

  // Form State - Step 2: Localities
  const [localities, setLocalities] = useState("");
  const [commuteDistance, setCommuteDistance] = useState("Up to 5 km");

  // Form State - Step 3: Teaching Preferences
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
  const [timingOption, setTimingOption] = useState("Evening (4 PM - 8 PM)");
  const [customTiming, setCustomTiming] = useState("");
  const [bio, setBio] = useState("");

  // Form State - Step 6: Document Uploads & URLs
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [aadhaarUrl, setAadhaarUrl] = useState<string | null>(null);
  const [aadhaarName, setAadhaarName] = useState<string | null>(null);
  const [isUploadingAadhaar, setIsUploadingAadhaar] = useState(false);

  const [degreeUrl, setDegreeUrl] = useState<string | null>(null);
  const [degreeName, setDegreeName] = useState<string | null>(null);
  const [isUploadingDegree, setIsUploadingDegree] = useState(false);

  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Error States
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: leadsApi.submitTutorApplication,
    onSuccess: () => {
      setIsSubmitted(true);
      setErrorMessage(null);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.fieldErrors) {
          setErrors(err.fieldErrors);
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong submitting your application. Please check your details and try again.");
      }
    },
  });

  const getEffectiveTimings = () => {
    if (timingOption === "Custom Timing") {
      return customTiming.trim() || "Custom Timing (Flexible)";
    }
    return timingOption;
  };

  const toggleSubject = (sub: string) => {
    if (sub === "ALL Subjects") {
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
      return filtered.includes(sub)
        ? filtered.filter((s) => s !== sub)
        : [...filtered, sub];
    });
    setErrors((prev) => ({ ...prev, subjects: "" }));
  };

  const handleFileUpload = async (
    file: File,
    docType: "photo" | "aadhaar" | "degree" | "resume"
  ) => {
    // Set uploading state immediately
    if (docType === "photo") { setIsUploadingPhoto(true); setPhotoName(null); setPhotoUrl(null); }
    if (docType === "aadhaar") { setIsUploadingAadhaar(true); setAadhaarName(null); setAadhaarUrl(null); }
    if (docType === "degree") { setIsUploadingDegree(true); setDegreeName(null); setDegreeUrl(null); }
    if (docType === "resume") { setIsUploadingResume(true); setResumeName(null); setResumeUrl(null); }
    setErrors((prev) => ({ ...prev, [docType]: "" }));

    try {
      const url = await leadsApi.uploadDocumentFile(file, docType);

      // Only show the green checkmark AFTER upload succeeds
      if (docType === "photo") { setPhotoUrl(url); setPhotoName(file.name); }
      else if (docType === "aadhaar") { setAadhaarUrl(url); setAadhaarName(file.name); }
      else if (docType === "degree") { setDegreeUrl(url); setDegreeName(file.name); }
      else if (docType === "resume") { setResumeUrl(url); setResumeName(file.name); }
    } catch (e) {
      console.error("Document upload error:", e);
      const errorMsg = e instanceof Error ? e.message : "Failed to upload file. Please try again.";
      setErrors((prev) => ({
        ...prev,
        [docType]: errorMsg,
      }));
      // Clear any stale state on failure
      if (docType === "photo") { setPhotoName(null); setPhotoUrl(null); }
      if (docType === "aadhaar") { setAadhaarName(null); setAadhaarUrl(null); }
      if (docType === "degree") { setDegreeName(null); setDegreeUrl(null); }
      if (docType === "resume") { setResumeName(null); setResumeUrl(null); }
    } finally {
      if (docType === "photo") setIsUploadingPhoto(false);
      if (docType === "aadhaar") setIsUploadingAadhaar(false);
      if (docType === "degree") setIsUploadingDegree(false);
      if (docType === "resume") setIsUploadingResume(false);
    }
  };

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 0) {
      if (!name.trim()) stepErrors.name = "Full name is required";
      if (!qualification.trim()) stepErrors.qualification = "Highest qualification is required";
      if (!college.trim()) stepErrors.college = "College/University is required";
      if (!percentage.trim()) stepErrors.percentage = "Graduation score/percentage is required";
      if (!passYear.trim() || !/^\d{4}$/.test(passYear)) stepErrors.passYear = "Enter a valid 4-digit passing year (e.g. 2022)";
    } else if (step === 1) {
      if (!localities.trim()) stepErrors.localities = "Preferred teaching localities are required";
    } else if (step === 2) {
      if (selectedGrades.length === 0) stepErrors.grades = "Select at least one class / grade";
      if (selectedSubjects.length === 0) stepErrors.subjects = "Select at least one subject";
      if (selectedBoards.length === 0) stepErrors.boards = "Select at least one education board";
    } else if (step === 3) {
      const cleanMobile = mobile.replace(/\s+/g, "");
      const cleanWhatsapp = whatsapp.replace(/\s+/g, "");
      const cleanAlt = alternativePhone.replace(/\s+/g, "");

      if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
        stepErrors.mobile = "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9";
      }
      if (!cleanWhatsapp || !/^[6-9]\d{9}$/.test(cleanWhatsapp)) {
        stepErrors.whatsapp = "Enter a valid 10-digit Indian WhatsApp number starting with 6, 7, 8, or 9";
      }
      if (cleanAlt && !/^[6-9]\d{9}$/.test(cleanAlt)) {
        stepErrors.alternativePhone = "Alternative number must be a valid 10-digit number starting with 6-9";
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        stepErrors.email = "Please enter a valid email address";
      }
    } else if (step === 4) {
      if (!expectedRate.trim()) stepErrors.expectedRate = "Expected fee rate is required";
      if (timingOption === "Custom Timing" && !customTiming.trim()) {
        stepErrors.timings = "Please specify your custom available timing";
      }
    } else if (step === 5) {
      if (isUploadingPhoto || isUploadingAadhaar || isUploadingDegree || isUploadingResume) {
        stepErrors.photo = stepErrors.photo || "";
        stepErrors.aadhaar = stepErrors.aadhaar || "";
        // Show a generic message if any upload is still in progress
        if (isUploadingPhoto) stepErrors.photo = "Photo is still uploading, please wait...";
        if (isUploadingAadhaar) stepErrors.aadhaar = "Aadhaar is still uploading, please wait...";
        if (isUploadingDegree) stepErrors.degree = "Degree certificate is still uploading, please wait...";
        if (isUploadingResume) stepErrors.resume = "Resume is still uploading, please wait...";
      }
      if (!photoUrl) stepErrors.photo = stepErrors.photo || "Please upload profile photo";
      if (!aadhaarUrl) stepErrors.aadhaar = stepErrors.aadhaar || "Please upload Aadhaar card (front & back)";
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

  const isAnyUploadInProgress = isUploadingPhoto || isUploadingAadhaar || isUploadingDegree || isUploadingResume;

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyUploadInProgress) {
      setErrorMessage("Please wait for all document uploads to complete before submitting.");
      return;
    }
    if (validateStep(5)) {
      setErrorMessage(null);
      submitMutation.mutate({
        name,
        fatherName: fatherName.trim() || undefined,
        qualification,
        college,
        percentage,
        passYear,
        interCollege: interCollege.trim() || undefined,
        interPercentage: interPercentage.trim() || undefined,
        schoolName: schoolName.trim() || undefined,
        schoolPercentage: schoolPercentage.trim() || undefined,
        localities,
        commuteDistance,
        grades: selectedGrades,
        subjects: selectedSubjects,
        boards: selectedBoards,
        medium,
        mode,
        mobile: mobile.replace(/\s+/g, ""),
        whatsapp: whatsapp.replace(/\s+/g, ""),
        alternativePhone: alternativePhone.replace(/\s+/g, "") || undefined,
        email,
        occupation,
        experience,
        expectedRate,
        timings: getEffectiveTimings(),
        bio: bio.trim() || undefined,
        photoUrl: photoUrl || undefined,
        aadhaarUrl: aadhaarUrl || undefined,
        degreeUrl: degreeUrl || undefined,
        resumeUrl: resumeUrl || undefined,
      });
    }
  };

  const handleHeaderClick = (stepIndex: number) => {
    if (stepIndex <= activeStep || completedSteps.includes(stepIndex)) {
      setActiveStep(stepIndex);
    }
  };

  if (isSubmitted) {
    const effectiveTimings = getEffectiveTimings();
    let whatsappText = `*New Tutor Application - Vidya Home Tuitions*\n\n` +
      `*Tutor Name:* ${name}\n` +
      `*Qualification:* ${qualification} (${percentage}% - ${passYear})\n` +
      `*College:* ${college}\n` +
      `*Phone:* +91 ${mobile}\n` +
      `*WhatsApp:* +91 ${whatsapp}\n` +
      `*Email:* ${email}\n` +
      `*Localities:* ${localities} (${commuteDistance})\n` +
      `*Classes/Grades:* ${selectedGrades.join(", ")}\n` +
      `*Subjects:* ${selectedSubjects.join(", ")}\n` +
      `*Boards:* ${selectedBoards.join(", ")}\n` +
      `*Mode:* ${mode} | *Medium:* ${medium}\n` +
      `*Experience:* ${experience}\n` +
      `*Expected Pay:* ${expectedRate}\n` +
      `*Timings:* ${effectiveTimings}\n`;

    if (photoUrl || aadhaarUrl || degreeUrl || resumeUrl) {
      whatsappText += `\n*Attached Documents:*\n`;
      if (photoUrl) whatsappText += `• Photo: ${photoUrl}\n`;
      if (aadhaarUrl) whatsappText += `• Aadhaar: ${aadhaarUrl}\n`;
      if (degreeUrl) whatsappText += `• Degree: ${degreeUrl}\n`;
      if (resumeUrl) whatsappText += `• Resume: ${resumeUrl}\n`;
    }

    whatsappText += `\nPlease review credentials for onboarding.`;

    const whatsappUrl = `https://wa.me/918074470640?text=${encodeURIComponent(whatsappText)}`;

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
                Thank you, <span className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</span>. Your application and credentials have been submitted for verification.
              </p>
            </div>

            <div className="p-4 w-full rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 text-xs text-left flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Tutor:</span>
                <span className="font-semibold">{name} ({qualification})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Teaching Classes:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedGrades.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Subjects:</span>
                <span className="font-semibold">{selectedSubjects.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Localities:</span>
                <span className="font-semibold">{localities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Documents Attached:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {[photoUrl && "Photo", aadhaarUrl && "Aadhaar", degreeUrl && "Degree", resumeUrl && "Resume"].filter(Boolean).join(", ") || "Uploaded"}
                </span>
              </div>
            </div>

            <div className="w-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3.5 text-center">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                ✅ Your tutor application has been automatically registered and sent to our verification team.
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
                Send Documents to Admin on WhatsApp (Optional)
              </a>
            </div>

            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles size={14} />
              Our Tutor Verification Coordinator will contact you within 24 hours.
            </p>
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
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-brand-500 transition-colors"
            >
              <ChevronLeft size={16} />
              Back to Home
            </Link>
            <span className="text-xs text-neutral-400">Tutor Support: +91 80744 70640</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
              Teacher Registration & Profile Onboarding
            </h1>
            <p className="text-sm text-neutral-550 dark:text-neutral-400 mt-2">
              Join Hyderabad’s top network of verified home & online educators. Fill your profile to start receiving direct tuition inquiries.
            </p>
          </div>

          {/* Stepper Accordion List */}
          <div className="flex flex-col gap-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isCompleted = completedSteps.includes(idx);

              return (
                <div
                  key={step.title}
                  className={`bg-white dark:bg-neutral-900 border rounded-2xl transition-all overflow-hidden ${
                    isActive
                      ? "border-brand-500 shadow-md ring-2 ring-brand-500/10"
                      : isCompleted
                      ? "border-emerald-300 dark:border-emerald-800/50"
                      : "border-neutral-200 dark:border-neutral-800 opacity-80"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleHeaderClick(idx)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isActive
                            ? "bg-brand-500 text-white shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-neutral-400 block">Step {idx + 1}</span>
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{step.title}</span>
                      </div>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isActive ? "max-h-[3000px] opacity-100 p-6 pt-0 border-t border-neutral-100 dark:border-neutral-800/80" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {/* STEP 1: Personal & Education */}
                    {idx === 0 && (
                      <div className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Full Name <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                              <User size={16} className="absolute left-3.5 top-1/3 text-neutral-400" />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  setName(e.target.value);
                                  setErrors((prev) => ({ ...prev, name: "" }));
                                }}
                                placeholder="e.g. Dr. Priya Sharma"
                                className={`w-full h-11 pl-10 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                  errors.name ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                                }`}
                              />
                            </div>
                            {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Father's / Guardian's Name
                            </label>
                            <input
                              type="text"
                              value={fatherName}
                              onChange={(e) => setFatherName(e.target.value)}
                              placeholder="e.g. Ramesh Sharma"
                              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Highest Degree / Qualification <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={qualification}
                              onChange={(e) => {
                                setQualification(e.target.value);
                                setErrors((prev) => ({ ...prev, qualification: "" }));
                              }}
                              placeholder="e.g. M.Sc Physics / B.Tech CSE / B.Ed"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.qualification ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.qualification && <p className="text-xs text-danger-500 mt-1">{errors.qualification}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              College / University <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={college}
                              onChange={(e) => {
                                setCollege(e.target.value);
                                setErrors((prev) => ({ ...prev, college: "" }));
                              }}
                              placeholder="e.g. Osmania University / JNTU Hyderabad"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.college ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.college && <p className="text-xs text-danger-500 mt-1">{errors.college}</p>}
                          </div>
                        </div>

                        <div className="grid gap-6 grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Graduation % / CGPA <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={percentage}
                              onChange={(e) => {
                                setPercentage(e.target.value);
                                setErrors((prev) => ({ ...prev, percentage: "" }));
                              }}
                              placeholder="e.g. 85% or 8.5 CGPA"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.percentage ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.percentage && <p className="text-xs text-danger-500 mt-1">{errors.percentage}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Year of Passing <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="text"
                              maxLength={4}
                              value={passYear}
                              onChange={(e) => {
                                setPassYear(e.target.value);
                                setErrors((prev) => ({ ...prev, passYear: "" }));
                              }}
                              placeholder="e.g. 2022"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.passYear ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.passYear && <p className="text-xs text-danger-500 mt-1">{errors.passYear}</p>}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                          <div>
                            <label className="block text-xs font-semibold text-neutral-500 mb-1">
                              Intermediate / 12th College & % (Optional)
                            </label>
                            <input
                              type="text"
                              value={interCollege}
                              onChange={(e) => setInterCollege(e.target.value)}
                              placeholder="e.g. Narayana Junior College (92%)"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-500 mb-1">
                              10th School & % (Optional)
                            </label>
                            <input
                              type="text"
                              value={schoolName}
                              onChange={(e) => setSchoolName(e.target.value)}
                              placeholder="e.g. St. Ann's High School (9.8 GPA)"
                              className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(0)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 2: Preferred Localities */}
                    {idx === 1 && (
                      <div className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            Preferred Areas / Localities in Hyderabad <span className="text-danger-500">*</span>
                          </label>
                          <textarea
                            value={localities}
                            onChange={(e) => {
                              setLocalities(e.target.value);
                              setErrors((prev) => ({ ...prev, localities: "" }));
                            }}
                            placeholder="e.g. Madhapur, Hitec City, Kondapur, Gachibowli, Kukatpally, Jubilee Hills"
                            rows={3}
                            className={`w-full p-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                              errors.localities ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                            }`}
                          />
                          {errors.localities && <p className="text-xs text-danger-500 mt-1">{errors.localities}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            Maximum Travel Radius
                          </label>
                          <select
                            value={commuteDistance}
                            onChange={(e) => setCommuteDistance(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                            <option value="Up to 3 km">Up to 3 km (Walking / Short ride)</option>
                            <option value="Up to 5 km">Up to 5 km (Standard commute)</option>
                            <option value="Up to 10 km">Up to 10 km (Willing to travel with vehicle)</option>
                            <option value="Anywhere in Hyderabad">Anywhere in Hyderabad</option>
                            <option value="Online Only (0 km)">Online Only (No travel)</option>
                          </select>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(1)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 3: Subjects & Classes */}
                    {idx === 2 && (
                      <div className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            1. Select Teaching Grades / Classes <span className="text-danger-500">*</span>
                          </label>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {GRADES.map((g) => {
                              const isSelected = selectedGrades.includes(g);
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => {
                                    setSelectedGrades((prev) =>
                                      isSelected ? prev.filter((x) => x !== g) : [...prev, g]
                                    );
                                    setErrors((prev) => ({ ...prev, grades: "" }));
                                  }}
                                  className={`p-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 shadow-sm"
                                      : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-850"
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                          {errors.grades && <p className="text-xs text-danger-500 mt-1.5">{errors.grades}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            2. Select Boards <span className="text-danger-500">*</span>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {BOARDS.map((b) => {
                              const isSelected = selectedBoards.includes(b);
                              return (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBoards((prev) =>
                                      isSelected ? prev.filter((x) => x !== b) : [...prev, b]
                                    );
                                    setErrors((prev) => ({ ...prev, boards: "" }));
                                  }}
                                  className={`p-3 text-xs font-semibold rounded-lg border text-left transition-all ${
                                    isSelected
                                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 shadow-sm"
                                      : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-850"
                                  }`}
                                >
                                  {b}
                                </button>
                              );
                            })}
                          </div>
                          {errors.boards && <p className="text-xs text-danger-500 mt-1.5">{errors.boards}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            3. Select Teaching Subject(s) <span className="text-danger-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {SUBJECTS.map((sub) => {
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

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Medium of Instruction
                            </label>
                            <select
                              value={medium}
                              onChange={(e) => setMedium(e.target.value)}
                              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="English">English Only</option>
                              <option value="English & Telugu">English & Telugu</option>
                              <option value="English & Hindi">English & Hindi</option>
                              <option value="Telugu Only">Telugu Only</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Tutoring Mode
                            </label>
                            <select
                              value={mode}
                              onChange={(e) => setMode(e.target.value)}
                              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="BOTH">Both Home Tuition & Online</option>
                              <option value="HOME">Home Tuition Only (Offline)</option>
                              <option value="ONLINE">Online 1-on-1 Only</option>
                            </select>
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(2)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 4: Contact Numbers */}
                    {idx === 3 && (
                      <div className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Mobile Number (Primary) <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3 text-sm text-neutral-450 font-semibold">+91</span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={mobile}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setMobile(val);
                                  setErrors((prev) => ({ ...prev, mobile: "" }));
                                }}
                                placeholder="9876543210"
                                className={`w-full h-11 pl-12 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                  errors.mobile ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                                }`}
                              />
                            </div>
                            {errors.mobile && <p className="text-xs text-danger-500 mt-1">{errors.mobile}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              WhatsApp Number <span className="text-danger-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3 text-sm text-neutral-450 font-semibold">+91</span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={whatsapp}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setWhatsapp(val);
                                  setErrors((prev) => ({ ...prev, whatsapp: "" }));
                                }}
                                placeholder="9876543210"
                                className={`w-full h-11 pl-12 pr-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                  errors.whatsapp ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                                }`}
                              />
                            </div>
                            {errors.whatsapp && <p className="text-xs text-danger-500 mt-1">{errors.whatsapp}</p>}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Email Address <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((prev) => ({ ...prev, email: "" }));
                              }}
                              placeholder="tutor@gmail.com"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.email ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-neutral-500 mb-2">
                              Alternative Emergency Phone (Optional)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-3 text-sm text-neutral-450 font-semibold">+91</span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={alternativePhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  setAlternativePhone(val);
                                  setErrors((prev) => ({ ...prev, alternativePhone: "" }));
                                }}
                                placeholder="9876543210"
                                className={`w-full h-11 pl-12 pr-3 rounded-lg border bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                  errors.alternativePhone ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                                }`}
                              />
                            </div>
                            {errors.alternativePhone && <p className="text-xs text-danger-500 mt-1">{errors.alternativePhone}</p>}
                          </div>
                        </div>

                        <Button type="button" onClick={() => handleSaveAndContinue(3)} className="self-end px-6 font-semibold mt-4">
                          Save and Continue
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    )}

                    {/* STEP 5: Experience & Pay */}
                    {idx === 4 && (
                      <div className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Current Occupation
                            </label>
                            <select
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="Full-time Home Tutor">Full-time Home Tutor</option>
                              <option value="School / College Teacher">School / College Teacher</option>
                              <option value="Software Engineer / Working Professional">Software Engineer / Working Professional</option>
                              <option value="Graduation / Post-Graduation Student">Graduation / Post-Graduation Student</option>
                              <option value="Retired Educator">Retired Educator</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Teaching Experience
                            </label>
                            <select
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                              <option value="Fresher">Fresher (Passionate to teach)</option>
                              <option value="1 - 3 Years">1 - 3 Years</option>
                              <option value="3 - 5 Years">3 - 5 Years</option>
                              <option value="5 - 10 Years">5 - 10 Years</option>
                              <option value="10+ Years">10+ Years (Senior Educator)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Expected Monthly Pay / Rate <span className="text-danger-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={expectedRate}
                              onChange={(e) => {
                                setExpectedRate(e.target.value);
                                setErrors((prev) => ({ ...prev, expectedRate: "" }));
                              }}
                              placeholder="e.g. ₹5,000 / Month or ₹400 / Hour"
                              className={`w-full h-11 px-3 rounded-lg border bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.expectedRate ? "border-danger-500 ring-2 ring-danger-500/10" : "border-neutral-200"
                              }`}
                            />
                            {errors.expectedRate && <p className="text-xs text-danger-500 mt-1">{errors.expectedRate}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                              Available Timings <span className="text-danger-500">*</span>
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
                              <option value="Morning (6 AM - 9 AM)">Morning (6 AM - 9 AM)</option>
                              <option value="Afternoon (1 PM - 4 PM)">Afternoon (1 PM - 4 PM)</option>
                              <option value="Weekends Only">Weekends Only (Sat & Sun)</option>
                              <option value="Full Day Flexible">Full Day Flexible</option>
                              <option value="Custom Timing">Custom Timing</option>
                            </select>

                            {timingOption === "Custom Timing" && (
                              <input
                                type="text"
                                value={customTiming}
                                onChange={(e) => {
                                  setCustomTiming(e.target.value);
                                  setErrors((prev) => ({ ...prev, timings: "" }));
                                }}
                                placeholder="Specify custom hours (e.g. 6:30 PM - 8:30 PM)"
                                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-xs mt-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-350 uppercase tracking-wider mb-2">
                            Short Teaching Bio & Methodology (Optional)
                          </label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Briefly describe your teaching approach, strengths, and previous student score improvements."
                            rows={3}
                            className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
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
                      <form onSubmit={handleSubmitRegistration} className="flex flex-col gap-6 animate-fade-in-up mt-4">
                        <div className="grid gap-6 sm:grid-cols-2">
                          {/* File 1: Profile Photo */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            {isUploadingPhoto ? (
                              <Loader2 className="animate-spin text-brand-500" size={24} />
                            ) : (
                              <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            )}
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">1. Recent Profile Photo *</span>
                            <span className="text-[10px] text-neutral-500">Max size 4MB (JPEG/PNG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingPhoto}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "photo");
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {photoName && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                <CheckCircle2 size={13} />
                                <span className="truncate max-w-[160px]">{photoName}</span>
                                {photoUrl && (
                                  <a href={photoUrl} target="_blank" rel="noreferrer" className="text-brand-500 underline ml-1">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}
                            {errors.photo && <p className="text-[11px] text-danger-500 font-semibold">{errors.photo}</p>}
                          </div>

                          {/* File 2: Aadhaar Card */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            {isUploadingAadhaar ? (
                              <Loader2 className="animate-spin text-brand-500" size={24} />
                            ) : (
                              <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            )}
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">2. Aadhaar Card (Front & Back) *</span>
                            <span className="text-[10px] text-neutral-500">Max size 5MB (PDF/JPEG)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={isUploadingAadhaar}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "aadhaar");
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {aadhaarName && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                <CheckCircle2 size={13} />
                                <span className="truncate max-w-[160px]">{aadhaarName}</span>
                                {aadhaarUrl && (
                                  <a href={aadhaarUrl} target="_blank" rel="noreferrer" className="text-brand-500 underline ml-1">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}
                            {errors.aadhaar && <p className="text-[11px] text-danger-500 font-semibold">{errors.aadhaar}</p>}
                          </div>

                          {/* File 3: Degree Certificate */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            {isUploadingDegree ? (
                              <Loader2 className="animate-spin text-brand-500" size={24} />
                            ) : (
                              <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            )}
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">3. Graduation Certificate / Marksheet</span>
                            <span className="text-[10px] text-neutral-500">Max size 5MB (PDF/JPEG)</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              disabled={isUploadingDegree}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "degree");
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {degreeName && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                <CheckCircle2 size={13} />
                                <span className="truncate max-w-[160px]">{degreeName}</span>
                                {degreeUrl && (
                                  <a href={degreeUrl} target="_blank" rel="noreferrer" className="text-brand-500 underline ml-1">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* File 4: Resume */}
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50 flex flex-col items-center gap-2 text-center relative group">
                            {isUploadingResume ? (
                              <Loader2 className="animate-spin text-brand-500" size={24} />
                            ) : (
                              <Upload className="text-neutral-400 group-hover:text-brand-500 transition-colors" size={24} />
                            )}
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">4. Latest Resume / Curriculum Vitae</span>
                            <span className="text-[10px] text-neutral-500">Max size 5MB (PDF/Word)</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              disabled={isUploadingResume}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "resume");
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            {resumeName && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                <CheckCircle2 size={13} />
                                <span className="truncate max-w-[160px]">{resumeName}</span>
                                {resumeUrl && (
                                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-brand-500 underline ml-1">
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800 pt-5 mt-2">
                          <span className="text-[10px] text-neutral-450 flex items-center gap-1">
                            <Lock size={12} /> Encrypted, background check secured upload channel.
                          </span>
                          <Button
                            type="submit"
                            loading={submitMutation.isPending || isUploadingPhoto || isUploadingAadhaar || isUploadingDegree || isUploadingResume}
                            className="px-6 font-bold shadow-md shadow-brand-500/10"
                          >
                            Complete Registration
                            <CheckCircle2 size={16} />
                          </Button>
                        </div>

                        {errorMessage && (
                          <div role="alert" className="p-3.5 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-xs font-medium">
                            ⚠️ {errorMessage}
                          </div>
                        )}
                      </form>
                    )}
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
