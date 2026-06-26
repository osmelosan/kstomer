-- Allow server functions acting on behalf of the authenticated user to
-- insert and update their own subscription rows. Data integrity is enforced
-- server-side: values come directly from the Stripe API, not from the client.
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
