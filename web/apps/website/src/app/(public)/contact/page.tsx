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
                    Thank you for reaching out. A matching coordinator has received your message and will contact you shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setPhone("");
                      setMessage("");
                    }}
                    className="mt-2 font-semibold text-xs h-9 px-4"
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

          {/* Right Column: Contact Details & Location Pin */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Quick Details */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/60 shadow-sm flex flex-col gap-4">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
                Our Office Info
              </h2>

              <ul className="flex flex-col gap-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                <li className="flex items-start gap-3">
                  <Phone size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs">Call or WhatsApp</span>
                    <a href="tel:+919059746820" className="hover:text-brand-500 text-sm font-semibold transition-colors mt-0.5 block">
                      +91 90597 46820
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs">General Support</span>
                    <a href="mailto:info@vidyahometuitions.com" className="hover:text-brand-500 text-sm font-semibold transition-colors mt-0.5 block">
                      info@vidyahometuitions.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs">Coordinating Hours</span>
                    <span className="text-xs font-semibold block mt-0.5">
                      Mon - Sun: 9:00 AM - 9:00 PM (IST)
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-xs">Office Address</span>
                    <span className="text-xs font-semibold block mt-0.5 leading-relaxed">
                      Jyothi Nagar, Chanda Nagar, Hyderabad, Telangana 500050, India
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Stylized Google Map Pin Simulation */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-800 dark:bg-neutral-900/60 overflow-hidden shadow-sm flex flex-col gap-2 relative">
              <div className="h-[200px] w-full bg-neutral-200 dark:bg-neutral-900 rounded-xl relative flex items-center justify-center overflow-hidden border border-neutral-300 dark:border-neutral-800">
                {/* SVG Mock Map */}
                <svg className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 40h300M0 120h300M0 200h300M80 0v300M180 0v300M260 0v300" stroke="currentColor" strokeWidth="2"/>
                  <path d="M30 40 L180 120 M120 200 L260 40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                {/* Ping pointer */}
                <div className="absolute top-[80px] left-[140px] flex flex-col items-center">
                  <div className="h-6 w-6 rounded-full bg-brand-500/30 flex items-center justify-center animate-ping absolute" />
                  <MapPin size={26} className="text-brand-600 fill-white dark:fill-neutral-900 filter drop-shadow-md z-10" />
                </div>
              </div>
              <div className="px-2 py-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-600 dark:text-brand-400">Location Map</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100 block">Chanda Nagar, Hyderabad</span>
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
