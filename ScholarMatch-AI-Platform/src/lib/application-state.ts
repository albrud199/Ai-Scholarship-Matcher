import { useEffect, useState } from "react";
import type { Scholarship } from "./scholarship-data";

export type ApplicationStatus =
  "Saved" | "Preparing" | "Submitted" | "Interview" | "Accepted" | "Rejected";

export type ApplicationRecord = {
  saved: boolean;
  status: ApplicationStatus;
  updatedAt: string;
};

const storageKey = "scholarmatch-applications";

function readApplications(): Record<string, ApplicationRecord> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, ApplicationRecord>)
      : {};
  } catch {
    return {};
  }
}

export function useApplicationState() {
  const [applications, setApplications] = useState<Record<string, ApplicationRecord>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setApplications(readApplications());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(applications));
    }
  }, [applications, hydrated]);

  const updateApplication = (id: string, update: Partial<ApplicationRecord>) => {
    setApplications((current) => ({
      ...current,
      [id]: {
        saved: false,
        status: "Saved",
        updatedAt: new Date().toISOString(),
        ...current[id],
        ...update,
      },
    }));
  };

  return { applications, updateApplication };
}

export function applicationRecord(
  applications: Record<string, ApplicationRecord>,
  scholarship: Scholarship,
) {
  return (
    applications[scholarship.id] ?? {
      saved: false,
      status: "Saved" as ApplicationStatus,
      updatedAt: "",
    }
  );
}

export const applicationStatuses: ApplicationStatus[] = [
  "Saved",
  "Preparing",
  "Submitted",
  "Interview",
  "Accepted",
  "Rejected",
];
