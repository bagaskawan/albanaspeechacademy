-- Seed / Update trainer data from proposal
UPDATE public.trainers
SET 
  bio = 'Alan Albana, S.Kom.I., M.I.Kom. adalah praktisi dan trainer komunikasi dengan pengalaman lebih dari 10 tahun sebagai Master of Ceremony, penyiar Radio Republik Indonesia (RRI), dan Founder Albana Speech Academy. Menyelesaikan S1 Komunikasi Penyiaran Islam STAIPI Bandung dan S2 Komunikasi Pendidikan UNISBA. Memegang sertifikasi Certified Master Trainer BNSP dan Certified Public Speaker BNSP, serta penulis buku Ice Breaking. Telah menjadi narasumber pelatihan komunikasi di berbagai kementerian, BUMN, perbankan, dan institusi nasional seperti Kemenhan, Kemenhub, Telkom Indonesia, PT KAI, BAPENDA Jabar, Bank BNI, dan Bank BJB.',
  expertise = ARRAY['Founder', 'Master Trainer BNSP', 'Public Speaking', 'Master of Ceremony', 'Broadcasting']
WHERE slug = 'alan-albana';

UPDATE public.trainers
SET 
  bio = 'Nurachman, S.Pd., S.Ag., MM., M.Pd. adalah pendidik, motivator pendidikan, konsultan grafologi, dan penulis produktif dengan lebih dari 50 judul buku. Menempuh pendidikan di bidang Manajemen SDM (STIE Pasundan Bandung & Universitas Padjadjaran) serta Psikologi Islam di International Open University. Tersertifikasi dalam Public Speaking Profesional, NLP for Teaching & Therapy, Stress Management, dan Hypnosis. Berpengalaman luas sebagai pemateri pelatihan komunikasi dan motivasi bagi korporasi dan institusi seperti Bank Indonesia, Bank Mandiri, Bank BRI, PT Angkasa Pura, PT KAI, Polres Bandung, Universitas Indonesia, dan Universitas Padjadjaran.',
  expertise = ARRAY['Motivator Pendidikan', 'Penulis 50 Buku', 'Public Speaking', 'Grafologi', 'Manajemen SDM']
WHERE slug = 'nurachman';

UPDATE public.trainers
SET 
  bio = 'Andhan Indah adalah trainer public speaking, komunikasi, dan Master of Ceremony profesional lulusan Public Relations Fakultas Ilmu Komunikasi Universitas Padjadjaran. Meraih penghargaan Female MC of The Year dari Hipapi Indonesia. Berpengalaman sebagai trainer komunikasi di LIPI, pengajar etiket dan pengembangan diri, serta pelatih komunikasi Albana Speech Academy. Telah membawakan pelatihan dan memandu agenda resmi untuk kementerian, BUMN, dan organisasi seperti Kemendiknas, PT Telkom, PT PLN, Pertamina, Bank BJB, Perum Bulog, serta universitas terkemuka.',
  expertise = ARRAY['Trainer Public Speaking', 'Female MC of The Year', 'Komunikasi LIPI', 'Etiquette & Self Development']
WHERE slug = 'andhan-indah';

UPDATE public.trainers
SET 
  bio = 'Abo Priatna adalah trainer MC, pembawa acara nasional dan internasional, announcer, serta podcaster. Lulusan LP3I Office Management dengan sertifikasi Certified Public Speaker oleh Albana Speech Academy dan Certified Bilingual MC oleh Bayu Adhitama & Azzarumi. Memiliki keahlian mendalam dalam MC all-event formal dan nonformal, hosting presentasi, live streaming, dan komunikasi panggung, serta dipercaya memandu ratusan acara korporat, institusi, dan pernikahan nasional lintas vendor ternama.',
  expertise = ARRAY['Trainer MC & Host', 'MC Nasional & Internasional', 'Certified Bilingual MC', 'Announcer & Podcaster']
WHERE slug = 'abo-priatna';
