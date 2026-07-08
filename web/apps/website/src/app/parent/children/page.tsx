"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { childProfileSchema, type ChildProfileInput, type StudentProfileDto } from "@hometuitions/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck, Search, User, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Card, FormField, IconTile, Input } from "@/components/ui";
import { parentApi } from "@/lib/api/parent";

export default function ChildrenPage() {
  const queryClient = useQueryClient();
  const childrenQuery = useQuery({ queryKey: ["parent", "children"], queryFn: parentApi.listChildren });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: parentApi.addChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent", "children"] });
      setShowAddForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ChildProfileInput }) => parentApi.updateChild(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent", "children"] });
      setEditingId(null);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <IconTile icon={Users} title="My Children" description="Manage profiles" color="brand" href="/parent/children" />
        <IconTile icon={Search} title="Find a tutor" description="Browse & book" color="accent" href="/parent/search" />
        <IconTile icon={CalendarCheck} title="Bookings" description="Upcoming sessions" color="success" href="/parent/bookings" />
        <IconTile icon={User} title="Profile" description="Your details" color="info" href="/parent/profile" />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">My children</h1>
        {!showAddForm && <Button onClick={() => setShowAddForm(true)}>Add a child</Button>}
      </div>

      {showAddForm && (
        <ChildForm
          submitLabel="Add child"
          onCancel={() => setShowAddForm(false)}
          onSubmit={(values) => addMutation.mutate(values)}
          isPending={addMutation.isPending}
          error={addMutation.error?.message}
        />
      )}

      <div className="flex flex-col gap-3">
        {(childrenQuery.data ?? []).map((child) =>
          editingId === child.id ? (
            <Card key={child.id}>
              <ChildForm
                submitLabel="Save"
                defaultValues={child}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) => updateMutation.mutate({ id: child.id, input: values })}
                isPending={updateMutation.isPending}
                error={updateMutation.error?.message}
              />
            </Card>
          ) : (
            <Card key={child.id} className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{child.displayName}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {[child.grade, child.subjectsOfInterest, child.city].filter(Boolean).join(" · ") || "No details yet"}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditingId(child.id)}>
                Edit
              </Button>
            </Card>
          ),
        )}
        {childrenQuery.data?.length === 0 && !showAddForm && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No children added yet. Add one to start booking tutors on their behalf.
          </p>
        )}
      </div>
    </div>
  );
}

function ChildForm({
  submitLabel,
  defaultValues,
  onCancel,
  onSubmit,
  isPending,
  error,
}: {
  submitLabel: string;
  defaultValues?: StudentProfileDto;
  onCancel: () => void;
  onSubmit: (values: ChildProfileInput) => void;
  isPending: boolean;
  error?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChildProfileInput>({
    resolver: zodResolver(childProfileSchema),
    defaultValues: defaultValues
      ? {
          displayName: defaultValues.displayName,
          grade: defaultValues.grade ?? "",
          subjectsOfInterest: defaultValues.subjectsOfInterest ?? "",
          city: defaultValues.city ?? "",
        }
      : undefined,
  });

  return (
    <Card>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Name" error={errors.displayName?.message}>
          <Input {...register("displayName")} />
        </FormField>
        <FormField label="Grade / class" error={errors.grade?.message}>
          <Input {...register("grade")} placeholder="e.g. Grade 6" />
        </FormField>
        <FormField label="Subjects of interest" error={errors.subjectsOfInterest?.message}>
          <Input {...register("subjectsOfInterest")} placeholder="e.g. Math, Science" />
        </FormField>
        <FormField label="City" error={errors.city?.message}>
          <Input {...register("city")} />
        </FormField>

        <div className="flex gap-2">
          <Button type="submit" loading={isPending}>
            {submitLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger-500">
            {error}
          </p>
        )}
      </form>
    </Card>
  );
}
