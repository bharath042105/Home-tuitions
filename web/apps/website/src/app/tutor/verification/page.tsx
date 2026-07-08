"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileBadge, IdCard } from "lucide-react";
import { useRef, useState } from "react";
import { documentStatusColor, type TutorDocumentDto } from "@hometuitions/shared";
import { Badge, Button, Card } from "@/components/ui";
import { tutorApi, uploadToPresignedUrl } from "@/lib/api/tutor";

const DOC_TYPES: { value: TutorDocumentDto["docType"]; label: string; icon: typeof IdCard }[] = [
  { value: "ID_PROOF", label: "Government ID proof", icon: IdCard },
  { value: "QUALIFICATION", label: "Qualification certificate", icon: FileBadge },
];

export default function VerificationPage() {
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({ queryKey: ["tutor", "documents"], queryFn: tutorApi.listDocuments });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDocType, setPendingDocType] = useState<TutorDocumentDto["docType"] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: async ({ docType, file }: { docType: TutorDocumentDto["docType"]; file: File }) => {
      const { uploadUrl, s3Key } = await tutorApi.requestUploadUrl({
        docType,
        filename: file.name,
        contentType: file.type,
      });
      await uploadToPresignedUrl(uploadUrl, file);
      return tutorApi.submitDocument({ docType, s3Key });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tutor", "documents"] }),
    onError: () => setErrorMessage("Upload failed - please try again"),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingDocType) return;
    setErrorMessage(null);
    submitMutation.mutate({ docType: pendingDocType, file });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Verification</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Upload an ID proof and a qualification document. You can&apos;t receive booking
        requests until an admin verifies your submission.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {DOC_TYPES.map((docType) => {
          const existing = documentsQuery.data?.filter((d) => d.docType === docType.value) ?? [];
          return (
            <Card key={docType.value}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <docType.icon size={18} strokeWidth={1.75} />
                </div>
                <h2 className="font-medium text-neutral-900 dark:text-neutral-100">{docType.label}</h2>
              </div>

              {existing.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Not yet submitted</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {existing.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </span>
                      <Badge color={documentStatusColor[doc.status] ?? "neutral"}>{doc.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                loading={submitMutation.isPending && pendingDocType === docType.value}
                onClick={() => {
                  setPendingDocType(docType.value);
                  fileInputRef.current?.click();
                }}
              >
                Upload
              </Button>
            </Card>
          );
        })}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-danger-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
