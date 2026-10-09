# VIT Lost & Found Portal — Setup & Verification Guide

This web application is built for the **DBMS Project** using:
- **React 18 & Vite**
- **Tailwind CSS**
- **Supabase (@supabase/supabase-js)**: PostgreSQL, Auth, and Storage.

---

## 1. Quick Database Setup in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and navigate to your project.
2. Go to the **SQL Editor**.
3. Copy and run the entire idempotent script located in `supabase_schema.sql` (in this project root).
   - This sets up all **6 relational tables**: `students`, `admins`, `lost_requests`, `found_items`, `item_matches`, `notifications`.
   - Creates the `handle_new_student()` trigger on `auth.users`.
   - Creates the `is_admin()` function.
   - Creates the atomic `create_match(p_request_id, p_found_id)` stored procedure / RPC.
   - Applies strict **Row Level Security (RLS)** policies.
   - Creates the `item-photos` storage bucket with public read and authenticated write access.

---

## 2. Admin Account Setup

To adhere to the requirement of having **NO admin signup UI** and keeping admin credentials secure:

1. In the Supabase Dashboard, go to **Authentication -> Users**.
2. Click **Add User -> Create User**.
3. Enter your desired Admin Email and Password (e.g. `admin@vit.ac.in` and your secure password).
4. Copy the generated **User UID** for this new admin.
5. In the **SQL Editor**, run:
   ```sql
   insert into public.admins (admin_id, name, email)
   values ('<PASTE_COPIED_UID_HERE>', 'Chief Proctor / Admin', 'admin@vit.ac.in')
   on conflict (admin_id) do nothing;
   ```
6. Now you can log in at `/admin/login` using `admin@vit.ac.in` (or username `admin`) and your password!

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` if not already done:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...
```

---

## 4. Running the Application

In your terminal:
```bash
npm run dev
```

Visit:
- **Student Portal**: `http://localhost:5173/` or `http://localhost:5173/login`
  - Register as a new student at `/student/signup` (Roll No, Department, Name, Phone, Password).
  - Report lost items with pictures (uploaded to Supabase Storage).
  - Browse recovered found items.
  - Track progression (`Pending` -> `Under Review` -> `Matched` -> `Collected`).
  - View notifications triggered upon matches.
- **Admin Ops Console**: `http://localhost:5173/admin/login`
  - Real-time statistics telemetry (live counts from PostgreSQL).
  - Review student requests and assign `reviewed_by`.
  - Log found items into custody.
  - Run the `create_match()` atomic pairing workbench.
  - View registered students directory (no password exposure).
