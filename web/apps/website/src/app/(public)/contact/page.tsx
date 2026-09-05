"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SiteHeader } from "@/components/features/marketing/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { leadsApi } from "@/lib/api/leads";

export default function ContactPage() {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submitMutation = useMutation({
    mutationFn: leadsApi.submitContactMessage,
    onSuccess: () => setSubmitted(true),
    onError: () => setError("Something went wrong sending your message - please try again."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Please fill out all required fields marked with *");
      return;
    }

    setError("");
    submitMutation.mutate({ name, phone, email: email.trim() || undefined, message });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors flex flex-col">
      <SiteHeader />
      <div className="flex-1 pb-20">
      {/* Header */}
      <section className="relative py-16 bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="absolute -left-20 top-[-100px] h-[350px] w-[350px] rounded-full bg-brand-500/10 blur-[100px]" />
        <div className="absolute right-[-50px] top-[-50px] h-[350px] w-[350px] rounded-full bg-accent-500/10 blur-[100px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Get in Touch with Our Coordinators
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Have questions about fees, demo classes, or tutor matches? We are available 7 days a week to support you.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-12 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-lg relative overflow-hidden">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Send Us a Message</h2>

              {submitted ? (
                <div className="p-8 text-center flex flex-col items-center gap-4 bg-emerald-50/20 dark:bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Message Sent!</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                    Thank you for reaching out. A coordinator has received your message and will contact you shortly.
                  </p>
                  
                  {/* Direct WhatsApp CTA Button */}
                  <a
                    href={`https://wa.me/918074470640?text=${encodeURIComponent(
                      `Hello Vidya Home Tuitions! My name is ${name} (Phone: ${phone}). Message: "${message}"`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <span>📱 Send Details to WhatsApp Directly</span>
                  </a>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setMessage("");
                    }}
                    className="mt-1 font-semibold text-xs h-9 px-4"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && (
                    <div className="p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-500/20 rounded-lg text-xs text-danger-500 flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                        Full Name <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                        Mobile Number <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 98765 43210"
                        className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@domain.com"
                      className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">
                      Message <span className="text-danger-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your inquiry, feedback, or custom requests..."
                      rows={5}
                      className="w-full p-3 rounded-lg border border-neutral-200 bg-white text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>

                  <Button type="submit" loading={submitMutation.isPending} className="font-bold self-start mt-2 h-10 px-6">
                    Send Message
                    <Send size={15} />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Contact Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Quick Details */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-lg flex flex-col gap-6">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Our Contact Info
              </h2>

              <ul className="flex flex-col gap-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                <li className="flex items-start gap-3.5">
                  <Phone size={20} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs uppercase tracking-wider">Call or WhatsApp (Primary)</span>
                    <a href="tel:+918074470640" className="hover:text-brand-500 text-base font-bold text-neutral-900 dark:text-white transition-colors mt-0.5 block">
                      +91 80744 70640
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <Phone size={20} className="text-accent-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs uppercase tracking-wider">Call or WhatsApp (Support Desk)</span>
                    <a href="tel:+916303619089" className="hover:text-brand-500 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors mt-0.5 block">
                      +91 63036 19089
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <Phone size={20} className="text-accent-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs uppercase tracking-wider">Call or WhatsApp (Support Desk)</span>
                    <a href="tel:+918143241349" className="hover:text-brand-500 text-sm font-semibold text-neutral-800 dark:text-neutral-200 transition-colors mt-0.5 block">
                      +91 81432 41349
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <Mail size={20} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs uppercase tracking-wider">General & Academic Support</span>
                    <a href="mailto:vidyatutorspoint@gmail.com" className="hover:text-brand-500 text-sm font-semibold text-brand-600 dark:text-brand-400 transition-colors mt-0.5 block">
                      vidyatutorspoint@gmail.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <Clock size={20} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs uppercase tracking-wider">Coordinating Hours</span>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block mt-0.5">
                      Mon - Sun: 9:00 AM - 9:00 PM (IST)
                    </span>
                  </div>
                </li>
              </ul>

              {/* Direct Quick WhatsApp Button */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <a
                  href="https://wa.me/918074470640?text=Hello%20Vidya%20Home%20Tuitions!%20I%20would%20like%20to%20inquire%20about%20a%20home%20tutor."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-98"
                >
                  <span>💬 Chat Directly on WhatsApp</span>
                </a>
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
