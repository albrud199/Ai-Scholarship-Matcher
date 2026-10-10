import { supabase } from '@/lib/supabase';
import type { Application, Scholarship } from '@/types';

/**
 * Data access for the application tracker.
 * All queries hit RLS-protected Supabase tables (02-schema.sql) with the
 * user's own session, so users can only ever read/write their own rows.
 */

export interface TrackerApplication extends Omit<Application, 'scholarship'> {
  scholarship: Scholarship | null;
}

function isConfigured(): boolean {
  return supabase !== null;
}

export async function fetchApplications(): Promise<TrackerApplication[]> {
  if (!isConfigured()) return [];
  const { data, error } = await supabase!
    .from('applications')
    .select(
      `id, user_id, scholarship_id, status, readiness_score, sop_content, notes,
       submitted_at, created_at, updated_at,
       scholarship:scholarships (*)`
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    ...row,
    scholarship: Array.isArray(row.scholarship) ? row.scholarship[0] : row.scholarship,
  })) as TrackerApplication[];
}

export async function createApplication(scholarshipId: string): Promise<TrackerApplication> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Not signed in');

  const { data, error } = await supabase!
    .from('applications')
    .insert({ user_id: userData.user.id, scholarship_id: scholarshipId, status: 'draft' })
    .select(
      `id, user_id, scholarship_id, status, readiness_score, sop_content, notes,
       submitted_at, created_at, updated_at,
       scholarship:scholarships (*)`
    )
    .single();

  if (error) throw new Error(error.message);
  return {
    ...data,
    scholarship: Array.isArray(data.scholarship) ? data.scholarship[0] : data.scholarship,
  } as TrackerApplication;
}

export async function updateApplicationStatus(id: string, status: TrackerApplication['status']): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const patch: Record<string, unknown> = { status };
  if (status === 'submitted') patch.submitted_at = new Date().toISOString();

  const { error } = await supabase.from('applications').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateApplicationNotes(id: string, notes: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('applications').update({ notes }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteApplication(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchCatalogScholarships(): Promise<Scholarship[]> {
  if (!isConfigured()) return [];
  const { data, error } = await supabase!
    .from('scholarships')
    .select('*')
    .eq('status', 'active')
    .order('deadline', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Scholarship[];
}
