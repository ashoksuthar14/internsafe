-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  college text,
  default_resume_text text,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create analyses table
CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_listing_text text NOT NULL,
  job_title text,
  company_name text,
  listing_url text,
  resume_text text,
  linkedin_url text,
  github_url text,
  safety_score integer,
  fit_score integer,
  verdict text,
  agent_results jsonb,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON public.analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analyses" ON public.analyses FOR DELETE USING (auth.uid() = user_id);

-- Create scam_reports table
CREATE TABLE public.scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid REFERENCES public.analyses(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name text,
  listing_snippet text,
  red_flags text[],
  safety_score integer,
  created_at timestamp with time zone default now()
);

ALTER TABLE public.scam_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scam reports" ON public.scam_reports FOR SELECT USING (true);
CREATE POLICY "Users can insert scam reports" ON public.scam_reports FOR INSERT WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Users can delete their own scam reports" ON public.scam_reports FOR DELETE USING (auth.uid() = reported_by);