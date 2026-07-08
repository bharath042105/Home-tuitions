"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { tutorSearchFiltersSchema, type TutorSearchFiltersInput } from "@hometuitions/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SearchX, Star } from "lucide-react";
import { Badge, Button, Card, EmptyState, FormField, Input, Spinner } from "@/components/ui";
import { studentApi } from "@/lib/api/student";

interface Coords {
  lat: number;
  lng: number;
}

/**
 * Shared by /student/search and /parent/search (Phase 1 IA: "Search tutors (on
 * behalf of child) → same flow as Student") - only the result link target
 * differs between the two contexts, so that's the one thing callers configure.
 * Takes a string prefix rather than a function - the caller pages are Server
 * Components, and a function prop can't cross the server/client boundary ("Functions
 * cannot be passed directly to Client Components").
 */
export function TutorSearchExperience({ tutorHrefPrefix }: { tutorHrefPrefix: string }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TutorSearchFiltersInput>({});

  const { register, handleSubmit } = useForm<TutorSearchFiltersInput>({
    resolver: zodResolver(tutorSearchFiltersSchema),
  });

  function useMyLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Your browser doesn't support location detection.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setLocationError("Couldn't get your location - please allow location access and retry."),
    );
  }

  const searchQuery = useQuery({
    queryKey: ["tutor-search", coords, filters],
    queryFn: () =>
      studentApi.searchTutors({
        lat: coords!.lat,
        lng: coords!.lng,
        radiusKm: filters.radiusKm,
        subject: filters.subject,
        mode: filters.mode,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
      }),
    enabled: coords !== null,
  });

  return (
    <div className="flex flex-col gap-6">
      {!coords ? (
        <Card className="max-w-md">
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            Share your location to see tutors near you.
          </p>
          <Button onClick={useMyLocation}>Use my location</Button>
          {locationError && <p className="mt-2 text-sm text-danger-500">{locationError}</p>}
        </Card>
      ) : (
        <>
          <Card>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={handleSubmit((values) => setFilters(values))}
            >
              <FormField label="Subject">
                <Input {...register("subject")} placeholder="e.g. Math" className="w-40" />
              </FormField>
              <FormField label="Mode">
                <select
                  {...register("mode")}
                  className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="">Any</option>
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline</option>
                </select>
              </FormField>
              <FormField label="Min price">
                <Input {...register("minPrice")} type="number" min={0} className="w-24" />
              </FormField>
              <FormField label="Max price">
                <Input {...register("maxPrice")} type="number" min={0} className="w-24" />
              </FormField>
              <FormField label="Min rating">
                <Input {...register("minRating")} type="number" min={0} max={5} step={0.5} className="w-20" />
              </FormField>
              <FormField label="Radius (km)">
                <Input {...register("radiusKm")} type="number" min={1} placeholder="25" className="w-24" />
              </FormField>
              <Button type="submit">Apply filters</Button>
            </form>
          </Card>

          {searchQuery.isLoading && (
            <div className="flex justify-center py-12">
              <Spinner size={28} />
            </div>
          )}

          {searchQuery.data && searchQuery.data.content.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No verified tutors found nearby"
              description="Try widening the radius or loosening your filters."
            />
          )}

          {searchQuery.data && searchQuery.data.content.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {searchQuery.data.content.map((tutor) => (
                <Link key={tutor.id} href={`${tutorHrefPrefix}/${tutor.id}`}>
                  <Card interactive className="flex h-full flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                        {tutor.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-semibold text-neutral-900 dark:text-neutral-100">
                          {tutor.displayName}
                        </h2>
                        <div className="mt-0.5 flex items-center gap-1 text-sm text-amber-500">
                          <Star size={14} fill="currentColor" strokeWidth={0} />
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            {tutor.avgRating.toFixed(1)}
                          </span>
                          <span className="text-neutral-400 dark:text-neutral-500">
                            ({tutor.reviewCount})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                          ₹{tutor.hourlyRate}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">per hour</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {tutor.subjects.slice(0, 4).map((subject) => (
                        <Badge key={subject} color="neutral">
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3 text-sm dark:border-neutral-800">
                      <Badge color="info">{tutor.teachingMode}</Badge>
                      {tutor.distanceKm !== null && (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {tutor.distanceKm} km away
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
