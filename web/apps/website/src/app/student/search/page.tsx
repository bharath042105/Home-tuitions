import { CalendarCheck, Search, User } from "lucide-react";
import { TutorSearchExperience } from "@/components/features/tutor-search/TutorSearchExperience";
import { IconTile } from "@/components/ui";

export default function StudentTutorSearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <IconTile icon={Search} title="Find a tutor" description="Browse & book" color="brand" href="/student/search" />
        <IconTile icon={CalendarCheck} title="My Bookings" description="Upcoming sessions" color="accent" href="/student/bookings" />
        <IconTile icon={User} title="Profile" description="Your details" color="success" href="/student/profile" />
      </div>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Find a tutor</h1>
      <TutorSearchExperience tutorHrefPrefix="/student/tutors" />
    </div>
  );
}
