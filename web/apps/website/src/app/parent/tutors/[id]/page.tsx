"use client";

import { useParams } from "next/navigation";
import { TutorProfileDetail } from "@/components/features/tutor-search/TutorProfileDetail";

export default function ParentTutorProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <TutorProfileDetail tutorId={id} bookingRole="parent" />;
}
