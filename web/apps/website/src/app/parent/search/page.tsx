import { TutorSearchExperience } from "@/components/features/tutor-search/TutorSearchExperience";

export default function ParentTutorSearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Find a tutor</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Search on behalf of your child - once booking is available, you&apos;ll choose
        which child the session is for.
      </p>
      <TutorSearchExperience tutorHrefPrefix="/parent/tutors" />
    </div>
  );
}
