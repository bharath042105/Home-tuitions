import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui";

const COMPANY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/request-tutor", label: "Request a Tutor" },
  { href: "/tutor-registration", label: "Join as a Tutor" },
  { href: "/login", label: "Log in" },
];

const LEGAL_LINKS = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms & Conditions" },
  { href: "#", label: "Refunds & Cancellations" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/60 transition-colors">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo size="md" />
          <p className="mt-4 max-w-xs text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Hyderabad's trusted home tutoring network. Connecting students and parents with top-tier, background-verified educators for 1-on-1 personalized home and online tuitions.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Get in Touch</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <span>Chanda Nagar, Hyderabad,<br />Telangana, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-brand-500" />
              <a href="tel:+919059746820" className="hover:text-brand-500 transition-colors">+91 90597 46820</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-brand-500" />
              <a href="mailto:info@vidyahometuitions.com" className="hover:text-brand-500 transition-colors">info@vidyahometuitions.com</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Company</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition-colors hover:text-brand-500">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Legal</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-neutral-500 dark:text-neutral-400">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors hover:text-brand-500">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-200 px-4 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        &copy; {new Date().getFullYear()} Vidya Home Tuitions. All rights reserved. Built with excellence.
      </div>
    </footer>
  );
}
