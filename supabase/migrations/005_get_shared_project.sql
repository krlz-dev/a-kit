-- Public RPC to read a single project without authentication (for share links).
-- Uses SECURITY DEFINER to bypass RLS. Future hardening: add an is_shared column check.
CREATE OR REPLACE FUNCTION get_shared_project(project_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'id',   p.id,
    'name', p.name,
    'type', p.type,
    'data', p.data
  )
  INTO result
  FROM projects p
  WHERE p.id = project_id;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  RETURN result;
END;
$$;
