import type { Attachment } from "@/lib/types";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getTodayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function formatThaiDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function formatNote(note: string): string {
  return note.trim() || "—";
}

export function isImageAttachment(type: string): boolean {
  return type.startsWith("image/");
}

export function removeAttachmentGroup(attachments: Attachment[], target: Attachment): Attachment[] {
  return attachments.filter(file => file.name !== target.name || file.size !== target.size);
}
