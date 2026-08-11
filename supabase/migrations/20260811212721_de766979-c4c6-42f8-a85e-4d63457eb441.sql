CREATE EXTENSION IF NOT EXISTS vector;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  authority text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL DEFAULT 'government_website',
  last_verified date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_sources TO anon, authenticated;
GRANT ALL ON public.knowledge_sources TO service_role;
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Knowledge sources are public" ON public.knowledge_sources FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER knowledge_sources_updated_at BEFORE UPDATE ON public.knowledge_sources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.government_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  icon text NOT NULL DEFAULT 'FileText',
  description text NOT NULL,
  eligibility text[] NOT NULL DEFAULT '{}',
  required_documents text[] NOT NULL DEFAULT '{}',
  application_steps text[] NOT NULL DEFAULT '{}',
  fees text,
  processing_time text,
  locations text[] NOT NULL DEFAULT '{}',
  important_notes text[] NOT NULL DEFAULT '{}',
  province text NOT NULL DEFAULT 'National',
  source_authority text NOT NULL,
  source_url text NOT NULL,
  source_id uuid REFERENCES public.knowledge_sources(id) ON DELETE SET NULL,
  last_verified date NOT NULL DEFAULT current_date,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.government_services TO anon, authenticated;
GRANT ALL ON public.government_services TO service_role;
ALTER TABLE public.government_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Government services are public" ON public.government_services FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER government_services_updated_at BEFORE UPDATE ON public.government_services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.faq_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.government_services(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  source_id uuid REFERENCES public.knowledge_sources(id) ON DELETE SET NULL,
  last_verified date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_entries TO anon, authenticated;
GRANT ALL ON public.faq_entries TO service_role;
ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQ entries are public" ON public.faq_entries FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER faq_entries_updated_at BEFORE UPDATE ON public.faq_entries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  message_id text NOT NULL,
  rating text NOT NULL CHECK (rating IN ('helpful','not_helpful')),
  comment text,
  question text,
  answer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.chat_feedback TO anon, authenticated;
GRANT ALL ON public.chat_feedback TO service_role;
ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.chat_feedback FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.knowledge_sources (id, title, authority, source_url, source_type, last_verified) VALUES
 ('11111111-1111-1111-1111-111111111101','Department of Home Affairs — Civic Services','Department of Home Affairs (DHA)','https://www.dha.gov.za/','government_website','2026-08-11'),
 ('11111111-1111-1111-1111-111111111102','South African Government Services Portal','South African Government','https://www.gov.za/services','government_website','2026-08-11'),
 ('11111111-1111-1111-1111-111111111103','SASSA — Social Grants','South African Social Security Agency (SASSA)','https://www.sassa.gov.za/','government_website','2026-08-11'),
 ('11111111-1111-1111-1111-111111111104','Department of Employment and Labour — UIF','Department of Employment and Labour','https://www.labour.gov.za/','government_website','2026-08-11'),
 ('11111111-1111-1111-1111-111111111105','CIPC — Company Registration','Companies and Intellectual Property Commission (CIPC)','https://www.cipc.co.za/','government_website','2026-08-11');

INSERT INTO public.government_services
 (slug, service_name, category, icon, description, eligibility, required_documents, application_steps, fees, processing_time, locations, important_notes, province, source_authority, source_url, source_id, last_verified) VALUES
('smart-id','Smart ID Card','Identity','IdCard','Apply for a Smart ID Card, the chip-based identity document that replaces the green barcoded ID book.',
 ARRAY['South African citizens aged 16 years and older','Permanent residents may apply for a Smart ID Card','First-time applicants apply for an identity document at age 16'],
 ARRAY['Completed Form DHA-9 (obtained at the office)','Your birth certificate or existing green barcoded ID book','Your current ID number','If replacing a lost ID: a completed loss declaration (Form DHA-288/A)'],
 ARRAY['Book an appointment online through the DHA Branch Appointment Booking System, or visit a Home Affairs office or participating bank branch.','Complete the application form at the office.','Have your fingerprints and photograph captured digitally at the office.','Pay the applicable fee (first issue of an ID at age 16 is free).','Collect your Smart ID Card at the office where you applied, or track it using the DHA status check.'],
 'First issue at age 16 is free. Re-issue / replacement fee is published by Home Affairs — confirm the current amount before paying.',
 'Processing times vary by office and application volumes. Use the Home Affairs ID status check for your specific application.',
 ARRAY['Department of Home Affairs offices countrywide','Participating bank branches (selected Absa, FNB, Nedbank and Standard Bank branches)'],
 ARRAY['Fees and turnaround times change — always confirm with Home Affairs before travelling to an office.','You must collect the card in person; a Smart ID Card is not posted to you.'],
 'National','Department of Home Affairs (DHA)','https://www.dha.gov.za/index.php/civic-services/identity-documents','11111111-1111-1111-1111-111111111101','2026-08-11'),

('passport','South African Passport','Travel','Plane','Apply for or renew a South African passport for international travel.',
 ARRAY['South African citizens','Applicants under 18 must apply with parental consent and be accompanied by a parent or legal guardian'],
 ARRAY['Completed Form DHA-73 (passport application)','Your Smart ID Card or green barcoded ID book','For minors: unabridged birth certificate and consent of both parents/guardians','Proof of payment of the application fee'],
 ARRAY['Book an appointment through the DHA online booking system where available.','Visit a Home Affairs office or a participating bank branch that offers passport services.','Complete the application and have your fingerprints and photograph captured.','Pay the applicable passport fee at the office.','Track your application using the Home Affairs passport status check and collect it in person.'],
 'Different passport types (tourist passport, maxi passport, emergency travel certificate) carry different fees. Confirm the current fee with Home Affairs.',
 'Turnaround times differ between offices and application types. Check the official status tracking service.',
 ARRAY['Department of Home Affairs offices','Selected bank branches offering Home Affairs services','South African missions abroad for citizens outside the country'],
 ARRAY['Many countries require at least 30 days validity beyond your travel dates and blank visa pages — check the entry requirements of your destination.','Apply well before your travel date; expedited processing is not guaranteed.'],
 'National','Department of Home Affairs (DHA)','https://www.dha.gov.za/index.php/travel-documents','11111111-1111-1111-1111-111111111101','2026-08-11'),

('learners-licence','Learner''s Licence','Transport','BookOpen','Apply to write the learner''s licence test, the first step before you may learn to drive on public roads.',
 ARRAY['Code 1 (motorcycles): from 16 years','Code 2 (light motor vehicles): from 17 years','Code 3 (heavy vehicles): from 18 years','You must pass an eye test and the written learner''s test'],
 ARRAY['Your identity document (Smart ID Card, ID book or valid passport for foreign nationals)','Two black-and-white ID photographs (confirm the number required with your testing centre)','Completed Form LL1 (application for learner''s licence)','Proof of residential address','Proof of payment of the booking fee'],
 ARRAY['Visit your nearest Driving Licence Testing Centre (DLTC) or use your province''s online booking service to book a test date.','Complete Form LL1 and submit it with your documents.','Pay the booking fee and receive your test date and time.','Take an eye test at the centre on or before your test date.','Write the learner''s test (rules of the road, road signs and vehicle controls).','Collect your learner''s licence at the centre if you pass.'],
 'A booking fee and issuing fee apply and are set provincially. Confirm the current amounts with your DLTC.',
 'The result of the test is given on the same day at most centres.',
 ARRAY['Driving Licence Testing Centres (DLTCs) countrywide','Some municipalities offer online booking through their own portals'],
 ARRAY['A learner''s licence is valid for 24 months and cannot be renewed — you must rewrite the test if it expires.','You may only drive with a licensed driver in the vehicle and the required L sign displayed.'],
 'National','South African Government','https://www.gov.za/services/services-residents/transport/driving-licence','11111111-1111-1111-1111-111111111102','2026-08-11'),

('drivers-licence','Driving Licence','Transport','Car','Apply for a first driving licence after passing your driving test, or renew an existing driving licence card.',
 ARRAY['You must hold a valid learner''s licence for the relevant vehicle code','You must pass the practical driving test for that code','Renewals: holders of a South African driving licence card that is expiring or has expired'],
 ARRAY['Your identity document','Your valid learner''s licence (for a first licence)','Your current driving licence card (for a renewal)','Completed Form DL1 (application for driving licence) or Form DL1 for renewal','ID photographs as required by the centre','Proof of payment'],
 ARRAY['Book a practical driving test at a DLTC, or book a renewal appointment if you are renewing.','Bring your documents and pay the applicable fee.','For a first licence: take the practical (yard and road) test on your test date.','If you pass, apply for the driving licence card at the same centre — fingerprints, photograph and eye test are captured there.','Wait for notification that the card is ready and collect it in person.'],
 'Test booking, card issuing and renewal fees are set provincially. Confirm the current amounts with your DLTC.',
 'Driving licence card production times vary. Your centre issues a temporary driving licence where needed.',
 ARRAY['Driving Licence Testing Centres (DLTCs)','Selected municipal licensing offices'],
 ARRAY['Renew your card before it expires — driving on an expired licence is an offence.','A temporary driving licence is issued separately and carries its own fee.'],
 'National','South African Government','https://www.gov.za/services/services-residents/transport/driving-licence','11111111-1111-1111-1111-111111111102','2026-08-11'),

('vehicle-licence','Motor Vehicle Licence Renewal','Transport','CarFront','Renew the licence disc of a registered motor vehicle so it remains legally licensed on public roads.',
 ARRAY['The registered owner (title holder) of the vehicle, or an authorised representative with a signed authorisation letter'],
 ARRAY['The renewal notice (MVL2) posted to you, or Form ALV if you did not receive one','Your identity document','Proof of residential address','For a company vehicle: a letter of authorisation and company registration documents','Proof of payment'],
 ARRAY['Wait for the renewal notice, which is usually posted about a month before expiry.','Renew at a licensing office, participating Post Office branch, or through your province''s online renewal service where available.','Submit the notice and your documents.','Pay the licence fee (plus any arrears or penalties).','Receive your new licence disc and display it on the windscreen.'],
 'Vehicle licence fees depend on the vehicle''s tare (mass) and the province. Late renewal attracts penalties. Confirm the amount on your renewal notice.',
 'Renewal is usually completed the same day at the counter; online renewals are posted or collected.',
 ARRAY['Provincial and municipal motor vehicle licensing offices','Participating South African Post Office branches','Provincial online renewal portals where available'],
 ARRAY['You may renew from 3 months before expiry; a grace period applies after expiry but penalties accumulate.','Do not drive an unlicensed vehicle on a public road.'],
 'National','South African Government','https://www.gov.za/services/services-residents/transport/vehicle-licence','11111111-1111-1111-1111-111111111102','2026-08-11'),

('social-grants','Social Grants (SASSA)','Social Services','HeartHandshake','Understand the social grants administered by SASSA, including who may apply and how the application works.',
 ARRAY['South African citizens, permanent residents or recognised refugees','You must live in South Africa','You must pass the means test for the specific grant','You may not be maintained in a state institution','Specific grants have their own age, disability or care conditions'],
 ARRAY['Your 13-digit bar-coded identity document or Smart ID Card','Proof of marital status where applicable','Proof of income and assets (bank statements, payslips, pension slips)','Medical assessment report for disability and care dependency grants','Child''s birth certificate and school certificate for child-related grants','Bank details for payment'],
 ARRAY['Identify the grant you may qualify for (older persons, disability, child support, foster child, care dependency, war veterans, grant-in-aid, or social relief of distress).','Visit your nearest SASSA office, or apply online through the SASSA services portal where the grant supports it.','Complete the application form in the presence of a SASSA officer — applications must be made by you, or by a nominated person if you are unable to travel.','Submit your supporting documents and receive a dated receipt.','Wait for the outcome; if declined you have the right to appeal to the Minister of Social Development.'],
 'Applying for a grant is free. You should never pay anyone to submit a SASSA application on your behalf.',
 'SASSA notifies applicants of the outcome in writing. Timeframes differ by grant type and office.',
 ARRAY['SASSA local offices in all nine provinces','SASSA online services portal for supported grant types'],
 ARRAY['Grant amounts and means-test thresholds are adjusted regularly — check the current values with SASSA.','Beware of scams: SASSA does not charge application fees and does not ask for your PIN.'],
 'National','South African Social Security Agency (SASSA)','https://www.sassa.gov.za/','11111111-1111-1111-1111-111111111103','2026-08-11'),

('uif','Unemployment Insurance Fund (UIF) Benefits','Social Services','Briefcase','Understand UIF benefits for workers who lose income, including unemployment, illness, maternity, adoption and dependants'' benefits.',
 ARRAY['You must have contributed to the UIF while employed','Unemployment benefits: you must have lost your job through dismissal, retrenchment or contract expiry — not resignation in most cases','You must be capable of and available for work','You must claim within the period prescribed for the benefit type'],
 ARRAY['Your identity document','Form UI-19 completed by your employer','Your service certificate from the employer','Proof of banking details','Form UI-2.8 for bank details and the relevant application form for your benefit type','Medical certificate for illness or maternity benefits'],
 ARRAY['Register on the uFiling online service, or visit your nearest Department of Employment and Labour labour centre.','Complete the application form for the specific benefit you are claiming.','Submit your documents, including the UI-19 from your employer.','Sign the register (for unemployment benefits) when required.','Track your claim through uFiling or the labour centre and respond to any request for further documents.'],
 'There is no fee to apply for UIF benefits.',
 'Payment timeframes depend on how complete your claim is. Follow up with the labour centre or uFiling if documents are outstanding.',
 ARRAY['Department of Employment and Labour labour centres countrywide','uFiling online service'],
 ARRAY['Claim as soon as possible after your employment ends — late claims may be rejected.','Your employer is legally required to give you a completed UI-19 and service certificate.'],
 'National','Department of Employment and Labour','https://www.labour.gov.za/','11111111-1111-1111-1111-111111111104','2026-08-11'),

('business-registration','Business (Company) Registration','Business','Building2','Register a company with the CIPC, including name reservation and the documents you need.',
 ARRAY['Any person may register a private company; a private company needs at least one director and one incorporator','Directors must not be disqualified in terms of the Companies Act','Foreign nationals may register a company using a valid passport'],
 ARRAY['Certified copies of the identity documents of all directors and incorporators','Certified copy of the applicant''s ID','Proposed company names (for a name reservation)','Completed CoR14.1 (Notice of Incorporation) and CoR15.1A (Memorandum of Incorporation) — generated through the CIPC platform','A valid email address and physical business address'],
 ARRAY['Create a customer profile on the CIPC eServices platform (or use a participating bank''s business registration service).','Reserve a company name, or register with a name consisting of the registration number if you do not need a specific name.','Complete the incorporation application and upload the certified supporting documents.','Pay the applicable CIPC fee from your CIPC deposit balance or through the platform.','Receive your registration certificate (CoR14.3) and Memorandum of Incorporation by email once approved.','Register the company for tax with SARS and, where applicable, for UIF, COIDA and PAYE.'],
 'CIPC charges separate fees for name reservation and for company registration. Confirm the current amounts on the CIPC website.',
 'Turnaround depends on whether a name reservation is required and whether documents are complete.',
 ARRAY['CIPC eServices online platform','Selected commercial bank business-registration services','CIPC self-service terminals'],
 ARRAY['Registering a company does not register you for tax — complete your SARS registration separately.','Only use official CIPC channels; third parties charging large service fees are not required.'],
 'National','Companies and Intellectual Property Commission (CIPC)','https://www.cipc.co.za/','11111111-1111-1111-1111-111111111105','2026-08-11');

INSERT INTO public.faq_entries (service_id, question, answer, source_id, last_verified)
SELECT s.id, f.q, f.a, s.source_id, '2026-08-11'::date FROM public.government_services s
JOIN (VALUES
 ('smart-id','Is the first Smart ID Card free?','Your first identity document at age 16 is issued free of charge. Replacements and re-issues carry a fee published by Home Affairs.'),
 ('smart-id','Can I apply for a Smart ID at my bank?','Yes. Selected Absa, FNB, Nedbank and Standard Bank branches offer Home Affairs Smart ID and passport services. Book through the Home Affairs online booking system.'),
 ('passport','How long is a South African passport valid?','A standard tourist passport is issued with a 10-year validity for adults. Passports for children have a shorter validity. Confirm the validity printed in your passport.'),
 ('learners-licence','How long is a learner''s licence valid?','A learner''s licence is valid for 24 months and cannot be renewed. If it expires you must write the test again.'),
 ('drivers-licence','What happens if my driving licence card expires?','Driving on an expired card is an offence. Apply for renewal before expiry; a temporary driving licence can be issued while you wait for the new card.'),
 ('vehicle-licence','What if I did not receive my vehicle licence renewal notice?','You can still renew. Complete Form ALV at a licensing office and bring your ID and proof of address. Not receiving the notice does not excuse late renewal penalties.'),
 ('social-grants','Do I have to pay to apply for a SASSA grant?','No. Applying for a social grant is free, and SASSA officials will never ask you for a fee or your card PIN.'),
 ('uif','Can I claim UIF if I resigned?','Unemployment benefits are generally for people who lost work through dismissal, retrenchment or the end of a contract. Resignation usually does not qualify — confirm your situation with a labour centre.'),
 ('business-registration','Do I need a company name to register?','No. You can register a company without reserving a name, in which case the registration number becomes the company name. You can reserve a name later.')
) AS f(slug,q,a) ON f.slug = s.slug;