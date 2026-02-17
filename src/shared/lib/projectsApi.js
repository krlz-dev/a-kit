import { supabase } from './supabase';

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, type, created_at, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProject(name, type, data) {
  const { data: { user } } = await supabase.auth.getUser();
  const result = await supabase
    .from('projects')
    .insert({ user_id: user.id, name, type, data })
    .select()
    .single();
  return result;
}

export async function updateProjectData(id, data) {
  const { error } = await supabase
    .from('projects')
    .update({ data })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function renameProject(id, name) {
  const { error } = await supabase
    .from('projects')
    .update({ name })
    .eq('id', id);
  if (error) throw error;
}
