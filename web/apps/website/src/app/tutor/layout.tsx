import { TutorShell } from "@/components/features/tutor/TutorShell";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <TutorShell>{children}</TutorShell>;
}
