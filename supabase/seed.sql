-- ============================================================
-- LaborLink seed data: 8 platform verified demo jobs.
-- Run AFTER 001_init.sql. Safe to run twice (fixed ids, upsert).
-- Platform jobs have owner_id NULL and verified = true; RLS lets
-- clients read them but never modify them.
-- ============================================================

insert into public.jobs
  (id, owner_id, title, employer_name, city, pay_eur, hours_per_week, job_type, description, tasks, verified, status)
values
  (
    'a1000000-0000-4000-8000-000000000001', null,
    'Barista, weekend shifts', 'Kaffeewerk Mitte', 'Berlin Mitte',
    14.50, '8 – 10', 'minijob',
    'Specialty coffee shop near Hackescher Markt looking for a weekend barista. Latte art appreciated, reliability required.',
    array['Prepare espresso drinks and filter coffee', 'Run the counter and card payments', 'Keep the bar area clean and stocked'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000002', null,
    'Working student, frontend', 'Novabank', 'Berlin Kreuzberg',
    17.00, '16 – 20', 'werkstudent',
    'Fintech team building customer onboarding in React and TypeScript. You ship real features with code review from senior engineers.',
    array['Build UI components in React and TypeScript', 'Write tests alongside your features', 'Join weekly planning and reviews'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000003', null,
    'Warehouse assistant', 'Stadtlogistik', 'Berlin Lichtenberg',
    14.00, '6 – 12', 'minijob',
    'Sustainable delivery startup needs help with evening sorting shifts. Flexible days, near the Ringbahn.',
    array['Sort incoming parcels by route', 'Scan and log packages', 'Load cargo bikes for the morning tours'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000004', null,
    'Working student, marketing', 'Studio Brandt', 'Prenzlauer Berg',
    15.50, '15 – 20', 'werkstudent',
    'Design studio looking for support with social content and client newsletters. Portfolio over grades.',
    array['Plan and schedule social media posts', 'Draft newsletters and case study texts', 'Track basic campaign metrics'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000005', null,
    'Event staff, trade fair', 'Messe Crew Berlin', 'Charlottenburg',
    15.00, '2 days', 'oneoff',
    'Two day tech trade fair at Messe Berlin. Badge checks, guest guidance and booth support. Paid out through payroll, not cash.',
    array['Check badges at the hall entrance', 'Guide guests to stages and booths', 'Support exhibitors with materials'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000006', null,
    'Math tutor', 'LernRaum', 'Berlin Neukölln',
    18.00, '4 – 8', 'minijob',
    'Tutoring center for grades 7 to 13. Small groups of two to four students, materials provided, afternoons only.',
    array['Teach small groups in math', 'Prepare short practice sets', 'Give feedback to parents once a month'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000007', null,
    'Working student, customer support', 'Campusfy', 'Berlin Friedrichshain',
    16.00, '12 – 20', 'werkstudent',
    'Edtech platform needs German and English support for student users. Remote friendly after onboarding.',
    array['Answer user questions via chat and mail', 'Document common issues for the FAQ', 'Escalate bugs to the product team'],
    true, 'live'
  ),
  (
    'a1000000-0000-4000-8000-000000000008', null,
    'Bike courier, organic boxes', 'Grünkorb', 'Berlin Schöneberg',
    14.80, '6 – 10', 'minijob',
    'Deliver organic vegetable boxes by cargo bike in the city west. Fixed routes, tips are yours, gear provided.',
    array['Ride fixed delivery routes by cargo bike', 'Hand over boxes and collect empties', 'Report route issues in the app'],
    true, 'live'
  )
on conflict (id) do update set
  title = excluded.title,
  employer_name = excluded.employer_name,
  city = excluded.city,
  pay_eur = excluded.pay_eur,
  hours_per_week = excluded.hours_per_week,
  job_type = excluded.job_type,
  description = excluded.description,
  tasks = excluded.tasks,
  status = excluded.status;
