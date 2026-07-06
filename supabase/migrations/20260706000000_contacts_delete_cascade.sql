-- Allow permanently deleting a contact: cascade the delete to every
-- dependent row instead of failing with a foreign-key violation.
alter table public.notes
  drop constraint notes_contact_id_fkey,
  add constraint notes_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.note_edit_history
  drop constraint note_edit_history_note_id_fkey,
  add constraint note_edit_history_note_id_fkey foreign key (note_id) references public.notes(id) on delete cascade;

alter table public.stage_history
  drop constraint stage_history_contact_id_fkey,
  add constraint stage_history_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.subscription_details
  drop constraint subscription_details_contact_id_fkey,
  add constraint subscription_details_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.reminders
  drop constraint reminders_contact_id_fkey,
  add constraint reminders_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.reseller_contacts
  drop constraint reseller_contacts_contact_id_fkey,
  add constraint reseller_contacts_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.reseller_contact_history
  drop constraint reseller_contact_history_contact_id_fkey,
  add constraint reseller_contact_history_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.ai_insights
  drop constraint ai_insights_contact_id_fkey,
  add constraint ai_insights_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;

alter table public.ai_prompt_cache
  drop constraint ai_prompt_cache_contact_id_fkey,
  add constraint ai_prompt_cache_contact_id_fkey foreign key (contact_id) references public.contacts(id) on delete cascade;
