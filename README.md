# ScholarMatch AI

## Supabase setup

1. Create a Supabase project and open **SQL Editor**.
2. Run [`supabase/schema.sql`](scholar-match-ai/supabase/schema.sql). It creates the profile table, Auth profile trigger, RLS policies, and private document bucket.
3. Copy `scholar-match-ai/.env.example` to `scholar-match-ai/.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings > API**.
4. In Supabase **Authentication > URL Configuration**, add the Vercel URL to **Site URL** and add `https://YOUR-VERCEL-DOMAIN/auth/callback` to **Redirect URLs**.
5. Enable Google or GitHub under **Authentication > Providers** if those OAuth buttons are needed, then configure each provider's callback URL from Supabase.

Only the public URL and anon key belong in Vercel environment variables. Never put a Supabase service-role key in this Next.js client or in a `NEXT_PUBLIC_*` variable.

The current scholarship catalog and matching demo still use seeded data. Auth, user profiles, and private document storage are now ready for Supabase; catalog ingestion, application records, and server-side AI calls should be added as separate protected tables/functions.