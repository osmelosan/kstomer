ALTER TABLE public.profiles
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

-- Existing users must not be forced back into the onboarding flow.
UPDATE public.profiles SET onboarding_completed = true;
