-- Migration 07: Seed state-specific filing requirements
-- Real homeschool compliance requirements by state

INSERT INTO state_filing_types (state_abbreviation, filing_name, description, frequency, typical_due_description, is_required, notes) VALUES

-- Oregon
('OR', 'Notification of Intent to Homeschool', 'Notify your local ESD (Education Service District) that you intend to homeschool.', 'once', 'Before beginning homeschool or within 10 days of withdrawal', true, 'Must be filed with the local ESD, not the school district.'),
('OR', 'Annual Assessment / Test', 'Students must be assessed at grades 3, 5, 8, and 10 using an approved standardized test.', 'as_needed', 'At the end of the school year for grades 3, 5, 8, 10', true, 'If scores fall below the 15th percentile, additional steps may be required.'),
('OR', 'Transfer Request (Withdrawal)', 'If transferring from a public/private school, you must formally withdraw the child.', 'once', 'Before starting homeschool', true, 'Contact the school directly to initiate transfer/withdrawal.'),

-- Maryland
('MD', 'Notice of Consent (Portfolio Review)', 'File a notice with the local superintendent that you will homeschool under portfolio review.', 'annual', 'At least 15 days before homeschool begins, then annually', true, 'Option 1: Supervised by a qualified person who reviews portfolio twice per year.'),
('MD', 'Notice of Consent (Church-Exempt)', 'File notice for religious-exemption homeschooling.', 'annual', 'At least 15 days before homeschool begins, then annually', false, 'Option 2: Provide regular, thorough instruction under bona fide church umbrella.'),
('MD', 'Portfolio Review', 'Have your portfolio reviewed by a qualified reviewer at least twice during the school year.', 'annual', 'Mid-year and end-of-year', true, 'Only required under Portfolio Review option. Reviewer must hold a teaching certificate or be approved.'),

-- Texas
('TX', 'Letter of Withdrawal', 'Notify the school that you are withdrawing your child to homeschool.', 'once', 'Before beginning homeschool', true, 'Texas does not require notification to the state. Keep a copy of the letter.'),

-- California
('CA', 'Private School Affidavit (PSA)', 'File the PSA with the California Department of Education to register as a private school.', 'annual', 'Between October 1 and October 15 each year', true, 'Most common option for homeschoolers: file as a private school.'),

-- New York
('NY', 'Individualized Home Instruction Plan (IHIP)', 'Submit an IHIP to your local school district for each child.', 'annual', 'By July 1 or within 14 days of starting homeschool', true, 'Must include planned instruction in required subjects for the grade.'),
('NY', 'Quarterly Report', 'Submit quarterly reports showing hours and topics covered.', 'quarterly', 'Every 90 days from start of homeschool year', true, 'Must document at least 900 hours (grades 1-6) or 990 hours (grades 7-12).'),
('NY', 'Annual Assessment', 'Submit an annual assessment — either a standardized test or written narrative evaluation.', 'annual', 'By June 30 each year', true, 'Test must be from an approved list; evaluation must be by a certified teacher or peer review panel.'),

-- Virginia
('VA', 'Notice of Intent', 'File a notice of intent with your local school superintendent.', 'annual', 'By August 15 each year', true, 'Must include evidence of parent qualifications or use a correspondence course.'),
('VA', 'Evidence of Progress (Annual)', 'Submit evidence of progress: standardized test scores or evaluation.', 'annual', 'By August 1 following the school year', true, 'Composite score must be at or above the 23rd percentile on a national norm.'),

-- Pennsylvania
('PA', 'Notarized Affidavit', 'File a notarized affidavit with the local school superintendent.', 'annual', 'By August 1 each year', true, 'Must include objectives for each subject, evidence of immunizations, and health/dental records.'),
('PA', 'Portfolio Review & Evaluation', 'Have an annual portfolio evaluation by a certified teacher evaluator.', 'annual', 'By June 30 each year', true, 'Evaluator must certify that education is appropriate for the child''s age and abilities.'),
('PA', 'Standardized Testing', 'Students must take standardized tests in grades 3, 5, and 8.', 'as_needed', 'In the spring of grades 3, 5, and 8', true, 'Results must be included in the portfolio for the evaluator.'),

-- Florida
('FL', 'Notice of Intent to Homeschool', 'File notice with the county school superintendent within 30 days of starting.', 'once', 'Within 30 days of beginning homeschool', true, 'Must be filed in the county where you reside.'),
('FL', 'Annual Evaluation', 'Submit an annual evaluation to the school superintendent.', 'annual', 'By the end of the school year', true, 'Options: certified teacher evaluation, standardized test, or other approved methods.'),
('FL', 'Notice of Termination', 'File notice when you stop homeschooling.', 'once', 'Within 30 days of ending homeschool', true, 'Required if child re-enrolls in school or you move out of county.'),

-- Wisconsin
('WI', 'PI-1206 Form (Statement of Enrollment)', 'File the PI-1206 form with the Wisconsin DPI.', 'annual', 'By October 15 each year', true, 'Filed online through the DPI website. Must be filed annually.'),

-- Georgia
('GA', 'Declaration of Intent', 'File a declaration of intent with the local school superintendent.', 'annual', 'By September 1 or within 30 days of starting homeschool', true, 'Must include list of students and their ages.'),
('GA', 'Annual Progress Assessment', 'Provide a written report of educational progress every 3 years.', 'as_needed', 'At the end of every third year of homeschooling', true, 'Must demonstrate satisfactory academic progress.'),
('GA', 'Attendance Report', 'Submit monthly attendance reports to the superintendent.', 'annual', 'Monthly during the school year', true, 'Must provide a minimum of 180 days of instruction.')

ON CONFLICT DO NOTHING;
