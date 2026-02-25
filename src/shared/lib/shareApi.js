import { supabase } from './supabase';

export async function fetchSharedProject(id) {
  const { data, error } = await supabase.rpc('get_shared_project', { project_id: id });
  if (error) throw error;
  return data;
}
