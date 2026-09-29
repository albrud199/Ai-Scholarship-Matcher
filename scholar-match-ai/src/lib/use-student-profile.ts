'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { studentProfile } from '@/lib/mock-data';
import type { Profile } from '@/types';

/** Map a `profiles` row onto the Profile type, filling in safe defaults for new students. */
export function rowToProfile(row: Partial<Profile>): Profile {
  return {
    ...studentProfile,
    ...row,
    other_language_scores: row.other_language_scores ?? {},
    research_experience: row.research_experience ?? [],
    work_experience: row.work_experience ?? [],
    leadership_experience: row.leadership_experience ?? [],
    publications: row.publications ?? [],
    awards: row.awards ?? [],
    constraints: { ...studentProfile.constraints, ...(row.constraints ?? {}) },
  };
}

export interface StudentProfileState {
  /** The signed-in student's saved profile, or the blank starter profile. */
  profile: Profile;
  loading: boolean;
  /** True when a saved profile was found in the database. */
  hasSavedProfile: boolean;
}

/**
 * Read the profile the student filled in on /dashboard/profile.
 * Without it the match engine sees an empty profile and every score would look near-zero.
 */
export function useStudentProfile(): StudentProfileState {
  const [profile, setProfile] = useState<Profile>(studentProfile);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data: authData } = await supabase!.auth.getUser();
        if (cancelled || !authData.user) return;

        const { data, error } = await supabase!
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (cancelled || error || !data) return;

        setProfile(rowToProfile(data as Partial<Profile>));
        setHasSavedProfile(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading, hasSavedProfile };
}
