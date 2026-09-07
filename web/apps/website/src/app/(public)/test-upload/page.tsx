"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { Button } from "@/components/ui/Button";
import { leadsApi } from "@/lib/api/leads";
import { Upload, CheckCircle2, AlertCircle, Loader2, ExternalLink, ArrowRight, ShieldCheck } from "lucide-react";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("photo");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    key?: string;
    publicUrl?: string;
    isR2?: boolean;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResult(null);

    try {
      const publicUrl = await leadsApi.uploadDocumentFile(file, docType);
      const isR2 = publicUrl ? publicUrl.includes("r2.cloudflarestorage.com") || publicUrl.includes("tutor-applications") : false;

      setResult({
        publicUrl: publicUrl,
        isR2: isR2,
      });
    } catch (err: any) {
      setResult({
        error: err?.message || "Upload failed. Check backend connectivity.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Storage & Document Upload Tester
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Test direct document upload to Cloudflare R2 / Backend without filling multi-step forms
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Document Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                1. Select Document Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "photo", label: "Profile Photo" },
                  { id: "aadhaar", label: "Aadhaar Card" },
                  { id: "degree", label: "Degree Certificate" },
                  { id: "resume", label: "Resume / CV" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDocType(item.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      docType === item.id
                        ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                2. Choose File to Upload:
              </label>
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 text-center hover:border-brand-500/50 transition-colors">
                <input
                  type="file"
                  id="test-file-input"
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                />
                <label
                  htmlFor="test-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    {file ? file.name : "Click to select any image or PDF (Max 10MB)"}
                  </span>
                  {file && (
                    <span className="text-xs text-neutral-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "file"}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-3.5 text-base font-semibold shadow-lg shadow-brand-500/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Uploading to Storage...
                </>
              ) : (
                <>
                  Upload Document Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Results Display */}
            {result && (
              <div
                className={`p-6 rounded-2xl border ${
                  result.error
                    ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {result.error ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold">Upload Failed</h3>
                      <p className="text-sm mt-1">{result.error}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Document Uploaded Successfully!
                    </div>

                    <div className="space-y-1 text-xs font-mono bg-white/60 dark:bg-black/30 p-3 rounded-xl border border-emerald-500/20 break-all">
                      {result.key && (
                        <div>
                          <span className="font-bold text-neutral-700 dark:text-neutral-300">Storage Key: </span>
                          {result.key}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">Storage Target: </span>
                        {result.isR2 ? "Cloudflare R2 Bucket (hometuitions-documents)" : "Database Document Storage"}
                      </div>
                    </div>

                    {result.publicUrl && (
                      <div className="pt-2">
                        <a
                          href={result.publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Open / View Uploaded Document
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
