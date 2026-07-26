-- Synthetic seed data for local development ONLY.
-- Companies and listings are invented (SECURITY.md: never seed with
-- production data; never point previews at production).

insert into public.employers (id, name, slug, city, website, description) values
  ('11111111-1111-4111-8111-111111111101', 'Datenwerk Berlin GmbH', 'datenwerk-berlin', 'Berlin', 'https://example.com', 'Small analytics consultancy in Kreuzberg. Twelve people, mostly engineers. We build reporting pipelines for mid-size retailers.'),
  ('11111111-1111-4111-8111-111111111102', 'Kaffeehaus Anker', 'kaffeehaus-anker', 'Berlin', null, 'Neighborhood cafe in Neukölln with a small bakery. Open seven days a week.'),
  ('11111111-1111-4111-8111-111111111103', 'Nordlicht Events UG', 'nordlicht-events', 'Berlin', 'https://example.com', 'We staff and run conferences and trade fairs across Berlin and Brandenburg.'),
  ('11111111-1111-4111-8111-111111111104', 'Stadtrad Logistik', 'stadtrad-logistik', 'Berlin', null, 'Cargo-bike delivery for local shops. Depot in Wedding.'),
  ('11111111-1111-4111-8111-111111111105', 'Lernraum Tutoring', 'lernraum-tutoring', 'Berlin', 'https://example.com', 'After-school tutoring in math and physics, two locations in Charlottenburg.'),
  ('11111111-1111-4111-8111-111111111106', 'Pixelgrund Studio', 'pixelgrund-studio', 'Berlin', 'https://example.com', 'Design studio for public-sector web projects. Accessibility is our niche.');

insert into public.listings
  (employer_id, title, slug, type, description, city, remote, hourly_wage_cents, hours_per_week, status, published_at)
values
  ('11111111-1111-4111-8111-111111111101',
   'Working student: data engineering',
   'datenwerk-working-student-data-engineering',
   'werkstudent',
   E'You build and maintain Python ETL jobs with one senior engineer as your mentor.\n\nWhat you do:\n- Write and review Python (pandas, dbt) transformations\n- Keep our Airflow jobs healthy\n- Document pipelines so the next person understands them\n\nWhat you need:\n- Enrolled in computer science or similar\n- Python basics; SQL you can read and write\n- German or English is fine, the team speaks both',
   'Berlin', true, 1750, 18, 'active', now() - interval '2 days'),

  ('11111111-1111-4111-8111-111111111101',
   'Working student: QA and test automation',
   'datenwerk-working-student-qa',
   'werkstudent',
   E'You write end-to-end tests for our reporting products and hunt flaky ones.\n\nWhat you do:\n- Maintain Playwright suites\n- Reproduce and document bugs\n- Sit in on release reviews\n\nWhat you need:\n- Any technical degree program\n- First contact with JavaScript or TypeScript',
   'Berlin', false, 1600, 16, 'active', now() - interval '6 days'),

  ('11111111-1111-4111-8111-111111111102',
   'Barista, weekend shifts',
   'kaffeehaus-anker-barista-weekend',
   'minijob',
   E'Saturday and Sunday shifts behind the bar. We train you on the machine.\n\nWhat you do:\n- Espresso drinks, counter service, closing cleanup\n- Some bakery handover work on Sunday mornings\n\nWhat you need:\n- Reliable weekend availability\n- Basic German helps with regulars, but the team switches to English easily',
   'Berlin', false, 1450, 9, 'active', now() - interval '1 day'),

  ('11111111-1111-4111-8111-111111111103',
   'Event crew: trade fair season',
   'nordlicht-event-crew-messe',
   'kurzfristig',
   E'Setup, badge desk, and floor support for the autumn trade fair season. Blocks of 3-6 working days per event.\n\nWhat you do:\n- Build and strike booths\n- Staff registration desks\n- Guide visitors\n\nWhat you need:\n- You can lift 20 kg and stand for a shift\n- English required, German or another language a plus',
   'Berlin', false, 1550, 35, 'active', now() - interval '3 days'),

  ('11111111-1111-4111-8111-111111111104',
   'Cargo-bike courier, morning tours',
   'stadtrad-courier-morning',
   'minijob',
   E'Fixed morning tours, Tuesday to Friday, delivering for local shops.\n\nWhat you do:\n- Ride a fixed 2-hour tour from the Wedding depot\n- Handle handover scans in our app\n\nWhat you need:\n- Confident cycling in city traffic\n- Punctuality — shops wait for you',
   'Berlin', false, 1500, 8, 'active', now() - interval '4 days'),

  ('11111111-1111-4111-8111-111111111105',
   'Working student: math tutor',
   'lernraum-math-tutor',
   'werkstudent',
   E'You tutor small groups (2-4 students) in secondary-school math, afternoons.\n\nWhat you do:\n- Prepare and run two afternoon sessions per week\n- Track progress notes per student\n\nWhat you need:\n- Enrolled in math, physics, engineering, or education\n- Patience and clear German (B2 or better) — the pupils are locals',
   'Berlin', false, 1700, 12, 'active', now() - interval '8 days'),

  ('11111111-1111-4111-8111-111111111106',
   'Working student: frontend accessibility',
   'pixelgrund-working-student-frontend',
   'werkstudent',
   E'You make public-sector sites keyboard-navigable and screen-reader-friendly.\n\nWhat you do:\n- Audit components against WCAG 2.2\n- Fix focus order, labels, and contrast in React code\n- Pair with our designers on accessible patterns\n\nWhat you need:\n- Enrolled, any program — we care about the skill\n- Solid HTML/CSS; React basics',
   'Berlin', true, 1800, 20, 'active', now() - interval '12 hours'),

  ('11111111-1111-4111-8111-111111111103',
   'Warehouse support, festival build-up',
   'nordlicht-warehouse-festival',
   'kurzfristig',
   E'Two-week block in September packing and loading stage equipment.\n\nWhat you do:\n- Pick, pack, and load event gear\n- Inventory checks with a scanner\n\nWhat you need:\n- Full-day availability in the block\n- Safety shoes (we provide them if needed)',
   'Berlin', false, 1480, 38, 'active', now() - interval '5 days'),

  ('11111111-1111-4111-8111-111111111102',
   'Kitchen help, weekday mornings',
   'kaffeehaus-anker-kitchen-help',
   'minijob',
   E'Weekday morning prep in the bakery kitchen, 6:30 to 9:00.\n\nWhat you do:\n- Prep sandwiches and salads\n- Keep the station clean\n\nWhat you need:\n- Early-riser reliability\n- Food-handling certificate (Belehrung) — we help you get it',
   'Berlin', false, 1420, 10, 'draft', null);
