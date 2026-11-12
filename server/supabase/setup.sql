-- Run this complete script once in Supabase Dashboard > SQL Editor.
-- Safe to rerun for this SKIDS schema; existing rows are preserved.
BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  "_id" UUID PRIMARY KEY,
  "googleId" TEXT UNIQUE,
  "passwordHash" TEXT NOT NULL DEFAULT '',
  "authProvider" TEXT NOT NULL DEFAULT 'google' CHECK ("authProvider" IN ('google', 'password', 'both')),
  email TEXT NOT NULL UNIQUE CHECK (length(trim(email)) > 0 AND email = lower(trim(email))),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  avatar TEXT NOT NULL DEFAULT '',
  "avatarPublicId" TEXT NOT NULL DEFAULT '',
  "avatarMetadata" JSONB NOT NULL DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  barangay TEXT NOT NULL DEFAULT 'Masagui',
  profile JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(profile) = 'object'),
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  "lastLoginAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.youth_profiles (
  "_id" UUID PRIMARY KEY,
  "userId" UUID UNIQUE REFERENCES public.users("_id") ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  age INTEGER CHECK (age BETWEEN 15 AND 30),
  barangay TEXT NOT NULL DEFAULT 'Masagui' CHECK (length(trim(barangay)) > 0),
  contact TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '' CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say', '')),
  "civilStatus" TEXT NOT NULL DEFAULT '' CHECK ("civilStatus" IN ('Single', 'Married', 'Widowed', 'Separated', '')),
  "voterStatus" TEXT NOT NULL DEFAULT '' CHECK ("voterStatus" IN ('Registered', 'Not Registered', '')),
  "workStatus" TEXT NOT NULL DEFAULT '' CHECK ("workStatus" IN ('Student', 'Employed', 'Unemployed', 'Self-employed', '')),
  "createdBy" UUID REFERENCES public.users("_id"),
  "updatedBy" UUID REFERENCES public.users("_id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.announcements (
  "_id" UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  author UUID NOT NULL REFERENCES public.users("_id"),
  "authorName" TEXT NOT NULL CHECK (length(trim("authorName")) > 0),
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Archived')),
  "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.events (
  "_id" UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  date TIMESTAMPTZ NOT NULL,
  time TEXT NOT NULL CHECK (length(trim(time)) > 0),
  location TEXT NOT NULL CHECK (length(trim(location)) > 0),
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  "createdBy" UUID NOT NULL REFERENCES public.users("_id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.budget_reports (
  "_id" UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'PHP',
  category TEXT NOT NULL CHECK (length(trim(category)) > 0),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  "reportDate" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT NOT NULL DEFAULT '',
  "fileUrl" TEXT NOT NULL DEFAULT '',
  "fileKey" TEXT NOT NULL DEFAULT '',
  "fileSize" DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("fileSize" >= 0),
  cloudinary JSONB NOT NULL DEFAULT '{}',
  "createdBy" UUID NOT NULL REFERENCES public.users("_id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.documents (
  "_id" UUID PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  type TEXT NOT NULL DEFAULT 'Other' CHECK (type IN ('Resolution', 'Report', 'Plan', 'Form', 'Other')),
  "fileUrl" TEXT NOT NULL DEFAULT '',
  "fileKey" TEXT NOT NULL DEFAULT '',
  cloudinary JSONB NOT NULL DEFAULT '{}',
  "fileSize" DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK ("fileSize" >= 0),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Filed', 'Approved', 'Archived')),
  "uploadedBy" UUID NOT NULL REFERENCES public.users("_id"),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.messages (
  "_id" UUID PRIMARY KEY,
  sender UUID NOT NULL REFERENCES public.users("_id"),
  "senderName" TEXT NOT NULL CHECK (length(trim("senderName")) > 0),
  "senderEmail" TEXT NOT NULL CHECK (length(trim("senderEmail")) > 0),
  subject TEXT NOT NULL CHECK (length(trim(subject)) > 0),
  message TEXT NOT NULL CHECK (length(trim(message)) > 0),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.message_replies (
  "_id" UUID PRIMARY KEY,
  "messageId" UUID NOT NULL REFERENCES public.messages("_id") ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (length(trim(message)) > 0),
  sender UUID NOT NULL REFERENCES public.users("_id"),
  "senderName" TEXT NOT NULL CHECK (length(trim("senderName")) > 0),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  "_id" UUID PRIMARY KEY,
  actor UUID NOT NULL REFERENCES public.users("_id"),
  "actorName" TEXT NOT NULL CHECK (length(trim("actorName")) > 0),
  "actorRole" TEXT NOT NULL DEFAULT '',
  "actionType" TEXT NOT NULL DEFAULT 'other' CHECK ("actionType" IN ('login', 'logout', 'create', 'update', 'delete', 'profile_update', 'other')),
  action TEXT NOT NULL CHECK (length(trim(action)) > 0),
  "resourceType" TEXT NOT NULL DEFAULT '',
  "resourceId" UUID,
  details TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  "ipAddress" TEXT NOT NULL DEFAULT '',
  "userAgent" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS youth_profiles_email_idx ON public.youth_profiles(email);
CREATE INDEX IF NOT EXISTS announcements_status_date_idx ON public.announcements(status, "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS events_status_date_idx ON public.events(status, date);
CREATE INDEX IF NOT EXISTS budget_reports_date_idx ON public.budget_reports("reportDate" DESC);
CREATE INDEX IF NOT EXISTS documents_status_date_idx ON public.documents(status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS messages_sender_date_idx ON public.messages(sender, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS message_replies_message_idx ON public.message_replies("messageId", "createdAt");
CREATE INDEX IF NOT EXISTS activity_logs_filters_idx ON public.activity_logs("createdAt" DESC, "actionType", "resourceType");

CREATE OR REPLACE FUNCTION public.skids_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['users','youth_profiles','announcements','events','budget_reports','documents','messages','message_replies','activity_logs']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "_id" SET DEFAULT gen_random_uuid()', table_name);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role', table_name);
    EXECUTE format('DROP TRIGGER IF EXISTS skids_updated_at ON public.%I', table_name);
    EXECUTE format('CREATE TRIGGER skids_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.skids_touch_updated_at()', table_name);
  END LOOP;
END;
$$;
GRANT USAGE ON SCHEMA public TO service_role;

-- Internal helper; executable only by the server role, like the RPCs below.
CREATE OR REPLACE FUNCTION public.skids_sync_youth(
  p_user public.users, p_details jsonb DEFAULT '{}', p_create_only boolean DEFAULT false
) RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
  previous public.youth_profiles;
  candidate public.youth_profiles;
  base jsonb;
BEGIN
  SELECT * INTO previous FROM public.youth_profiles WHERE "userId" = p_user."_id";
  IF FOUND AND p_create_only THEN RETURN; END IF;
  IF previous."_id" IS NOT NULL THEN
    base := to_jsonb(previous);
  ELSE
    base := jsonb_build_object(
      '_id', gen_random_uuid(), 'userId', p_user."_id", 'name', p_user.name,
      'age', null, 'barangay', p_user.barangay, 'contact', '', 'email', p_user.email,
      'gender', '', 'civilStatus', '', 'voterStatus', '', 'workStatus', '',
      'createdBy', p_user."_id", 'updatedBy', p_user."_id",
      'createdAt', now(), 'updatedAt', now()
    );
  END IF;
  candidate := jsonb_populate_record(NULL::public.youth_profiles, base || p_details ||
    jsonb_build_object('_id', base->'_id', 'userId', p_user."_id", 'updatedAt', now()));
  IF p_create_only THEN
    INSERT INTO public.youth_profiles SELECT candidate.* ON CONFLICT ("userId") DO NOTHING;
  ELSE
    INSERT INTO public.youth_profiles SELECT candidate.*
    ON CONFLICT ("userId") DO UPDATE SET
      name = EXCLUDED.name, age = EXCLUDED.age, barangay = EXCLUDED.barangay,
      contact = EXCLUDED.contact, email = EXCLUDED.email, gender = EXCLUDED.gender,
      "civilStatus" = EXCLUDED."civilStatus", "voterStatus" = EXCLUDED."voterStatus",
      "workStatus" = EXCLUDED."workStatus", "updatedBy" = EXCLUDED."updatedBy";
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_register(p_user jsonb, p_youth jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account public.users;
BEGIN
  INSERT INTO public.users (email, "passwordHash", "authProvider", name, role, barangay, profile)
  VALUES (lower(trim(p_user->>'email')), p_user->>'passwordHash', 'password',
    p_user->>'name', 'user', coalesce(p_user->>'barangay', 'Masagui'), coalesce(p_user->'profile', '{}'))
  RETURNING * INTO account;
  PERFORM public.skids_sync_youth(account, p_youth, false);
  RETURN to_jsonb(account) - 'passwordHash';
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_google_sign_in(p_identity jsonb, p_admin boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account public.users;
BEGIN
  SELECT * INTO account FROM public.users
  WHERE "googleId" = p_identity->>'googleId' OR email = lower(p_identity->>'email')
  FOR UPDATE;
  IF account."_id" IS NOT NULL AND (NOT account."isActive" OR account.status IN ('pending','suspended')) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'Account is not active';
  END IF;
  IF account."_id" IS NULL THEN
    INSERT INTO public.users ("googleId", email, name, avatar, role, "authProvider", "lastLoginAt")
    VALUES (p_identity->>'googleId', lower(p_identity->>'email'), p_identity->>'name',
      coalesce(p_identity->>'avatar',''), CASE WHEN p_admin THEN 'admin' ELSE 'user' END, 'google', now())
    RETURNING * INTO account;
  ELSE
    UPDATE public.users SET
      "googleId" = p_identity->>'googleId', email = lower(p_identity->>'email'),
      name = p_identity->>'name',
      avatar = CASE WHEN account.avatar <> '' THEN account.avatar ELSE coalesce(p_identity->>'avatar','') END,
      role = CASE WHEN p_admin THEN 'admin' WHEN account.role = 'manager' THEN 'manager' ELSE 'user' END,
      "authProvider" = CASE WHEN account."passwordHash" <> '' THEN 'both' ELSE 'google' END,
      "lastLoginAt" = now()
    WHERE "_id" = account."_id" RETURNING * INTO account;
  END IF;
  IF account.role = 'user' THEN
    PERFORM public.skids_sync_youth(account, '{}', true);
  END IF;
  RETURN to_jsonb(account) - 'passwordHash';
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_update_profile(p_user_id uuid, p_changes jsonb, p_youth jsonb)
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account public.users;
BEGIN
  UPDATE public.users SET
    name = coalesce(p_changes->>'name', name), avatar = coalesce(p_changes->>'avatar', avatar),
    "avatarPublicId" = coalesce(p_changes->>'avatarPublicId', "avatarPublicId"),
    "avatarMetadata" = coalesce(p_changes->'avatarMetadata', "avatarMetadata"),
    barangay = coalesce(p_changes->>'barangay', barangay),
    profile = coalesce(p_changes->'profile', profile)
  WHERE "_id" = p_user_id RETURNING * INTO account;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  PERFORM public.skids_sync_youth(account, p_youth, false);
  RETURN to_jsonb(account) - 'passwordHash';
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_reply(p_message_id uuid, p_reply text, p_sender uuid, p_sender_name text)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  INSERT INTO public.message_replies ("messageId", message, sender, "senderName")
  VALUES (p_message_id, trim(p_reply), p_sender, p_sender_name);
  UPDATE public.messages SET status = 'read' WHERE "_id" = p_message_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_remove_manager(p_user_id uuid, p_actor uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account public.users;
BEGIN
  UPDATE public.users SET role = 'user' WHERE "_id" = p_user_id AND role = 'manager' RETURNING * INTO account;
  IF NOT FOUND THEN RETURN false; END IF;
  PERFORM public.skids_sync_youth(account,
    jsonb_build_object('createdBy', p_actor, 'updatedBy', p_actor), true);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_bootstrap_admin(p_email text, p_name text, p_password_hash text)
RETURNS jsonb LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE account public.users;
BEGIN
  SELECT * INTO account FROM public.users WHERE email = lower(trim(p_email)) FOR UPDATE;
  IF account."_id" IS NOT NULL AND account."passwordHash" <> '' THEN
    RETURN jsonb_build_object('bootstrapped', false);
  END IF;
  IF account."_id" IS NULL THEN
    INSERT INTO public.users (email, name, "passwordHash", "authProvider", role)
    VALUES (lower(trim(p_email)), trim(p_name), p_password_hash, 'password', 'admin');
  ELSE
    UPDATE public.users SET "passwordHash" = p_password_hash, role = 'admin',
      "authProvider" = CASE WHEN "googleId" IS NOT NULL THEN 'both' ELSE 'password' END,
      "isActive" = true, status = 'active' WHERE "_id" = account."_id";
  END IF;
  RETURN jsonb_build_object('bootstrapped', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.skids_history(
  p_search text DEFAULT '', p_action_type text DEFAULT '', p_resource_type text DEFAULT '',
  p_date_from timestamptz DEFAULT NULL, p_date_to timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 25, p_offset integer DEFAULT 0
) RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  WITH filtered AS (
    SELECT * FROM public.activity_logs
    WHERE (p_search = '' OR strpos(lower("actorName"), lower(p_search)) > 0
      OR strpos(lower(action), lower(p_search)) > 0 OR strpos(lower(details), lower(p_search)) > 0)
      AND (p_action_type = '' OR "actionType" = p_action_type)
      AND (p_resource_type = '' OR "resourceType" = p_resource_type)
      AND (p_date_from IS NULL OR "createdAt" >= p_date_from)
      AND (p_date_to IS NULL OR "createdAt" <= p_date_to)
  ), page AS (
    SELECT * FROM filtered ORDER BY "createdAt" DESC, "_id" DESC
    LIMIT greatest(1, least(p_limit,100)) OFFSET greatest(p_offset,0)
  )
  SELECT jsonb_build_object(
    'logs', coalesce((SELECT jsonb_agg(to_jsonb(page) ORDER BY "createdAt" DESC, "_id" DESC) FROM page), '[]'),
    'total', (SELECT count(*) FROM filtered),
    'resourceTypes', coalesce((SELECT jsonb_agg("resourceType" ORDER BY "resourceType")
      FROM (SELECT DISTINCT "resourceType" FROM public.activity_logs WHERE "resourceType" <> '') resources), '[]')
  );
$$;

CREATE OR REPLACE FUNCTION public.skids_status()
RETURNS jsonb LANGUAGE sql SET search_path = '' AS $$
  SELECT jsonb_build_object('version', 1);
$$;

-- Application JWTs are checked by Express. Public Supabase roles receive no
-- table access or function execution; only the backend secret key can use these.
DO $$
DECLARE routine record;
BEGIN
  FOR routine IN
    SELECT p.oid::regprocedure AS signature FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'skids_touch_updated_at','skids_sync_youth','skids_register','skids_google_sign_in',
      'skids_update_profile','skids_reply','skids_remove_manager','skids_bootstrap_admin',
      'skids_history','skids_status'
    )
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', routine.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', routine.signature);
  END LOOP;
END;
$$;
NOTIFY pgrst, 'reload schema';
COMMIT;
