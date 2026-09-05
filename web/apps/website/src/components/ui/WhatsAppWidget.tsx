"use client";

import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const phone1 = "918074470640";
  const phone2 = "916303619089";
  const phone3 = "918143241349";

  const defaultMessage = encodeURIComponent(
    "Hello Vidya Home Tuitions! I would like to inquire about booking a home / online tutor."
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Popover Card */}
      {isOpen && (
        <div className="w-80 rounded-2xl border border-emerald-500/20 bg-white p-4 shadow-2xl dark:border-emerald-500/30 dark:bg-neutral-900 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Chat on WhatsApp</h4>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Instant Reply
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={16} />
            </button>
          </div>

          <p className="py-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Need a verified tutor in Hyderabad or online? Connect with our academic coordinators directly:
          </p>

          <div className="flex flex-col gap-2">
            <a
              href={`https://wa.me/${phone1}?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-emerald-500 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all active:scale-98"
            >
              <span className="flex items-center gap-2">
                <MessageCircle size={16} />
                WhatsApp: +91 80744 70640
              </span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Primary</span>
            </a>

            <a
              href={`https://wa.me/${phone2}?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-all active:scale-98"
            >
              <span className="flex items-center gap-2">
                <Phone size={15} />
                WhatsApp: +91 63036 19089
              </span>
              <span className="text-[10px] bg-emerald-500/15 px-1.5 py-0.5 rounded">Support</span>
            </a>

            <a
              href={`https://wa.me/${phone3}?text=${defaultMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-all active:scale-98"
            >
              <span className="flex items-center gap-2">
                <Phone size={15} />
                WhatsApp: +91 81432 41349
              </span>
              <span className="text-[10px] bg-emerald-500/15 px-1.5 py-0.5 rounded">Support</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 items-center gap-2.5 rounded-full bg-emerald-500 pl-4 pr-5 text-white shadow-lg shadow-emerald-500/35 transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-xl active:scale-95"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400" />
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <MessageCircle size={18} className="transition-transform group-hover:rotate-12" />
        </div>
        <span className="text-xs font-bold tracking-wide">WhatsApp Us</span>
      </button>
    </div>
  );
}
