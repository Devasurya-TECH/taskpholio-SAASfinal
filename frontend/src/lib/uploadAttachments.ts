import api from "@/lib/api";
import { Attachment } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type UploadOptions = {
  imageOnly?: boolean;
  maxSizeBytes?: number;
};

export type UploadFailure = {
  fileName: string;
  reason: string;
};

export type UploadResult = {
  uploaded: Attachment[];
  failed: UploadFailure[];
};

const errorMessageFromUnknown = (error: unknown): string => {
  if (!error) return "Upload failed.";
  if (typeof error === "string") return error;

  const anyError = error as any;
  if (anyError?.response?.data?.message) return String(anyError.response.data.message);
  if (anyError?.response?.data?.error) return String(anyError.response.data.error);
  if (anyError?.message) return String(anyError.message);
  return "Upload failed.";
};

const normalizeAttachment = (payload: any, file: File): Attachment => ({
  fileName: payload?.fileName || file.name,
  fileUrl: payload?.fileUrl || "",
  fileType: payload?.fileType || file.type || "application/octet-stream",
  uploadedAt: new Date().toISOString(),
});

const validateFile = (file: File, options?: UploadOptions): string | null => {
  const sizeLimit = options?.maxSizeBytes || MAX_FILE_SIZE;
  if (file.size > sizeLimit) {
    return `File is too large (max ${Math.round(sizeLimit / 1024 / 1024)}MB).`;
  }

  if (options?.imageOnly && !file.type.startsWith("image/")) {
    return "Only image files are allowed.";
  }

  return null;
};

export const uploadAttachments = async (
  filesInput: FileList | File[] | null | undefined,
  options?: UploadOptions
): Promise<UploadResult> => {
  const files = Array.from(filesInput || []);
  const uploaded: Attachment[] = [];
  const failed: UploadFailure[] = [];

  for (const file of files) {
    const validationError = validateFile(file, options);
    if (validationError) {
      failed.push({ fileName: file.name, reason: validationError });
      continue;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 45000,
      });

      if (!response?.data?.success || !response?.data?.data?.fileUrl) {
        throw new Error(response?.data?.message || "Upload service returned an invalid response.");
      }

      uploaded.push(normalizeAttachment(response.data.data, file));
    } catch (error) {
      failed.push({
        fileName: file.name,
        reason: errorMessageFromUnknown(error),
      });
    }
  }

  return { uploaded, failed };
};

