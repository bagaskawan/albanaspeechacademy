# Graph Report - albanaspeechacademy  (2026-11-17)

## Corpus Check
- Large corpus: 769 files · ~465,552 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2780 nodes · 7835 edges · 200 communities (122 shown, 78 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 69 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Landing Module
- Actions Module
- Ui Module
- Ui Module
- Home Module
- Registration Form Module
- Partner Module
- Api Module
- Article Module
- Settings Module
- Community Module
- Media Module
- Ui Module
- Program Module
- Plans Module
- Member Module
- Ui Module
- Dashboard Module
- Ui Module
- Home Module
- Ui Module
- Admins Module
- Myprofile Module
- Cms Module
- (Form) Module
- Ui Module
- Home Module
- Server Module
- Ui Module
- Server Module
- Myprofile Module
- Archive Module
- Acara Module
- Community Module
- Server Module
- Layout Module
- Registration Module
- Types Module
- Ui Module
- Billing Module
- Admin Export Module
- Auth Module
- Settings Module
- Package.Json Module
- Actions Module
- (Form) Module
- Venue Module
- (Form) Module
- Components.Json Module
- Api Module
- Ui Module
- Tsconfig.Json Module
- Rekening Module
- Formvalidation Module
- Architecture Module
- Myprofile Module
- Server Module
- Package.Json Module
- Api Module
- Ui Module
- Stats Module
- Package.Json Module
- Content Module
- Actions Module
- Program Module
- Register Module
- Project Module
- Members Module
- Members Module
- Myprofile Module
- Archive Module
- Data Module
- Acara Module
- Media Prepare Module
- Registration Input Module
- Affiliate Payout Module
- Galeri Module
- Pendaftar Module
- (Form) Module
- (Form) Module
- Admin List Module
- Attendance Module
- Progress Module
- Create Admin.Js Module
- Admin Modules Module
- Auth Module
- Motion Module
- Referral Module
- Api Module
- Myprofile Module
- Albana Routes Module
- Acara Module
- Artikel Module
- Artikel Module
- Community Module
- Ui Module
- Archive Module
- Aktivitas Module
- Auth Module
- Myprofile Module
- Admin Nav Module
- Funnel Module
- Ui Module
- Ui Module
- Package.Json Module
- Cms Key Module
- Claude Module
- Architecture Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Attendance Module
- Package.Json Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Galeri Module
- Tentang Module
- Public Module
- Architecture Module
- Architecture Module
- Archive Module
- Archive Module
- Project Module
- Tentang Module
- Admin Page Registry Module
- Package.Json Module
- Architecture Module
- Architecture Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Archive Module
- Data Module
- Project Module
- Project Module
- Project Module
- Project Module
- Registration Module
- Registration Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Package.Json Module
- Postcss.Config.Mjs Module
- Legacy Community Admin Routes
- Proposed Public Navigation (Program, Car
- Path A: Public Read (Anon Key + RLS)
- Client Discovery Brief (result-brief.md)
- Batch 9 Pricing & 20% DP Matrix (BCA 449
- Migration add_batch_offer_and_article_me
- Admin Write RLS Allowlist (admin_users)
- Trigger set_catalog_slug
- Public Program Detail Route (/program/[s
- Series (01) Question Mapping (A1–D20)
- Registration Intake Key (32-byte Base64 
- Client Revision Notes (2026-11-11)
- public.trainers Table
- 70/20/10 Experiential Learning Model
- Albana Speech Academy (CV Asa Albana)
- Program: Inhouse Training
- Alan Albana (Founder & Trainer)
- DP 20% Rounding & Remainder Calculation
- Panggung Kreator Affiliate Flow Presenta
- Next.js Bootstrap README (front/README.m

## God Nodes (most connected - your core abstractions)
1. `react` - 341 edges
2. `cn()` - 209 edges
3. `next` - 196 edges
4. `lucide-react` - 160 edges
5. `createClient()` - 114 edges
6. `createClient()` - 78 edges
7. `requireAdminMember()` - 64 edges
8. `useScrollAnimations()` - 57 edges
9. `sonner` - 56 edges
10. `createServiceRoleClient()` - 53 edges

## Surprising Connections (you probably didn't know these)
- `POST /api/registrations & receive_academy_registration RPC` --semantically_similar_to--> `receive_registration RPC Contract`  [INFERRED] [semantically similar]
  front/AGENTS.md → docs/albana-docs/registration/registration-contract.md
- `Media HD Minimum Upload & Auto-Compression Spec` --conceptually_related_to--> `Media Upload & Dual Storage Pipeline (/api/upload & /api/media/[id])`  [INFERRED]
  docs/albana-docs/project/website-revision-specification.md → front/AGENTS.md
- `Panggung Kreator Legacy Affiliate & Referral System` --conceptually_related_to--> `Panggung Kreator Legacy Cleanup`  [INFERRED]
  front/public/html/flow-affiliate/index.html → docs/albana-docs/project/website-revision-specification.md
- `ProfileLayoutProps` --references--> `MemberProfile`  [EXTRACTED]
  front/app/myprofile/components/ProfileLayout.tsx → front/lib/types/member.ts
- `ProfileNavbarProps` --references--> `MemberProfile`  [EXTRACTED]
  front/app/myprofile/components/ProfileNavbar.tsx → front/lib/types/member.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Albana Registration & Manual Payment Verification Flow** — docs_albana_docs_architecture_api_reference_post_api_registrations, docs_albana_docs_architecture_api_reference_receive_academy_registration, docs_albana_docs_architecture_system_architecture_registration_db_invariants, docs_albana_docs_architecture_api_reference_resolve_academy_invoice, docs_albana_docs_architecture_registration_backend_flow_diagram [EXTRACTED 1.00]
- **Albana Three Data Access Paths (Public, Direct CMS, Privileged Service Role)** — docs_albana_docs_architecture_system_architecture_path_a_public_read, docs_albana_docs_architecture_system_architecture_path_b_direct_cms_write, docs_albana_docs_architecture_system_architecture_path_c_privileged_service_role, docs_albana_docs_architecture_cms_data_flow_dual_cms_write_paths [EXTRACTED 1.00]
- **Albana Archived Visual Design Evolution (Classic vs Soft Reference)** — docs_albana_docs_archive_design_backup_readme_index, docs_albana_docs_archive_design_backup_classic_design_asa_box_minimalist, docs_albana_docs_archive_design_backup_visual_design_2026_11_08_asa_soft_reference [EXTRACTED 1.00]
- **End-to-End Registration & WhatsApp Verification Flow** — docs_albana_docs_archive_legacy_user_flow_four_step_registration_wizard, docs_albana_docs_archive_plans_2026_11_11_admin_program_batch_article_registration_registration_intake_api, docs_albana_docs_archive_plans_2026_11_11_step_1_data_contract_audit_receive_registration_rpc, docs_albana_docs_archive_legacy_user_flow_whatsapp_proof_verification, docs_albana_docs_archive_plans_2026_11_11_step_1_data_contract_audit_payments_verification_table [EXTRACTED 1.00]
- **Admin Shell Accessibility & Design System Upgrade** — docs_albana_docs_archive_plans_2026_11_11_admin_program_batch_article_registration_admin_shell, docs_albana_docs_archive_plans_2026_11_11_step_2_admin_inventory_style_line_accessibility, docs_albana_docs_archive_plans_2026_11_11_step_2_admin_inventory_radix_select_migration, docs_albana_docs_archive_plans_2026_11_11_step_2_admin_inventory_albana_admin_design_tokens, docs_albana_docs_archive_plans_2026_11_11_step_2_admin_inventory_cms_collection_error_focus [EXTRACTED 1.00]
- **Static Program & JSONB Batch Catalog Model** — docs_albana_docs_archive_plans_2026_11_11_admin_program_batch_article_registration_two_static_programs, docs_albana_docs_archive_legacy_user_flow_single_source_catalog, docs_albana_docs_archive_legacy_user_flow_server_batch_selection, docs_albana_docs_archive_plans_2026_11_11_step_1_data_contract_audit_batches_sessions_jsonb, docs_albana_docs_archive_plans_2026_11_11_step_1_data_contract_audit_add_batch_offer_and_article_metadata [EXTRACTED 1.00]
- **Albana Speech Academy Core Training Programs** — docs_albana_docs_archive_proposals_academy_proposal_public_speaking, docs_albana_docs_archive_proposals_academy_proposal_professional_presentation, docs_albana_docs_archive_proposals_academy_proposal_mc_event_communication, docs_albana_docs_archive_proposals_academy_proposal_moderator_host_training, docs_albana_docs_archive_proposals_academy_proposal_leadership_communication, docs_albana_docs_archive_proposals_academy_proposal_service_excellence, docs_albana_docs_archive_proposals_academy_proposal_training_of_trainer [EXTRACTED 1.00]
- **Albana Speech Academy Trainer Roster** — docs_albana_docs_archive_proposals_academy_proposal_albana_speech_academy, docs_albana_docs_archive_proposals_academy_proposal_alan_albana, docs_albana_docs_archive_proposals_academy_proposal_nurachman, docs_albana_docs_archive_proposals_academy_proposal_andhan_indah, docs_albana_docs_archive_proposals_academy_proposal_abo_priatna [EXTRACTED 1.00]
- **CV Asa Albana Legal Registration Documents** — docs_albana_docs_archive_proposals_academy_proposal_cv_asa_albana, docs_albana_docs_archive_proposals_academy_proposal_akta_pendirian_cv, docs_albana_docs_archive_proposals_academy_proposal_nib_cv_asa_albana, docs_albana_docs_archive_proposals_academy_proposal_skt_cv_asa_albana, docs_albana_docs_archive_proposals_academy_proposal_npwp_cv_asa_albana [EXTRACTED 1.00]
- **Seven-Chapter Landing Page & Content Architecture** — docs_albana_docs_archive_requirements_2026_11_11_revision_notes_seven_visitor_priorities, docs_albana_docs_content_home_page_content_doc, docs_albana_docs_design_academy_landing_layout_seven_chapter_rhythm, docs_albana_docs_design_academy_design_system_doc [EXTRACTED 1.00]
- **On-Site Registration Wizard & Invoice Pipeline** — docs_albana_docs_archive_working_notes_superpowers_plans_2026_11_09_form_wizard_registration_steps, docs_albana_docs_archive_working_notes_superpowers_specs_2026_11_09_form_pendaftaran_design_form_variants, docs_albana_docs_data_database_schema_academy_registrations_table, docs_albana_docs_data_database_schema_academy_invoices_table, docs_albana_docs_data_database_schema_bank_accounts_table, docs_albana_docs_data_database_schema_receive_academy_registration_rpc, docs_albana_docs_content_home_page_content_register_confirmation_page [INFERRED 0.95]
- **Albana CMS Admin Architecture & Security Boundary** — docs_albana_docs_archive_working_notes_superpowers_specs_2026_11_10_admin_restructure_design_twelve_cms_modules, docs_albana_docs_archive_working_notes_superpowers_specs_2026_11_10_sidebar_visibility_design_global_sidebar_visibility, docs_albana_docs_data_database_schema_admin_users_table, docs_albana_docs_data_access_control_rls_and_column_grants, docs_albana_docs_data_database_schema_schema_cleanup_2026_11_15 [INFERRED 0.85]
- **Admin CMS Design System Evolution (Blue Soft UI -> Monochrome Soft -> Reference Form Audit)** — docs_albana_docs_design_admin_design_system_admin_design_system_doc, docs_albana_docs_design_admin_ui_patterns_admin_ui_patterns_doc, docs_albana_docs_plans_2026_11_16_redesign_restructure_implementation_plan_redesign_restructure_plan_doc, docs_albana_docs_plans_2026_11_17_admin_ui_audit_refactor_plan_admin_ui_audit_refactor_plan_doc [EXTRACTED 1.00]
- **Program-Owned Pricing, Single Open Batch, and Bidirectional Bundling Architecture** — docs_albana_docs_plans_2026_11_16_program_batch_bundling_design_program_batch_bundling_design_doc, docs_albana_docs_plans_2026_11_17_program_batch_bundling_implementation_plan_program_batch_bundling_plan_doc, docs_albana_docs_plans_2026_11_16_program_batch_bundling_design_program_owns_price_concept, docs_albana_docs_plans_2026_11_16_program_batch_bundling_design_bidirectional_bundle_offer, docs_albana_docs_plans_2026_11_17_program_batch_bundling_implementation_plan_single_open_batch_rpc [EXTRACTED 1.00]
- **Release Governance, Hosting Limits, and Staged Execution Gates** — docs_albana_docs_project_2026_11_13_release_audit_release_audit_doc, docs_albana_docs_plans_2026_11_13_staged_llm_prompt_strategy_staged_llm_prompt_strategy_doc, docs_albana_docs_project_cleanup_candidates_cleanup_candidates_doc, docs_albana_docs_project_2026_11_13_release_audit_hostinger_unlimited_constraints, docs_albana_docs_project_2026_11_13_release_audit_release_no_go_gates [EXTRACTED 1.00]
- **Albana Speech Academy Four Fixed Programs Catalog** — docs_albana_docs_project_product_requirements_public_speaking_series, docs_albana_docs_project_product_requirements_public_speaking_for_speakers, docs_albana_docs_project_product_requirements_sertifikasi_bnsp, docs_albana_docs_project_product_requirements_inhouse_training [EXTRACTED 1.00]
- **Albana Registration Form Specifications & Contract** — docs_albana_docs_registration_registration_contract_doc, docs_albana_docs_registration_forms_00_tahap_awal_doc, docs_albana_docs_registration_forms_01_public_speaking_series_doc, docs_albana_docs_registration_forms_02_speaker_training_doc, docs_albana_docs_registration_forms_03_professional_speakers_certification_doc [EXTRACTED 1.00]
- **Albana MVP Core Runtime & Security Architecture** — front_agents_nextjs_app, docs_albana_docs_project_environment_setup_supabase_project, front_agents_proxy_allowlist, front_agents_require_admin_member, front_agents_receive_academy_registration, front_agents_media_upload_pipeline [EXTRACTED 1.00]

## Communities (200 total, 78 thin omitted)

### Community 0 - "Landing Module"
Cohesion: 0.06
Nodes (41): ibmPlexMono, metadata, metadata, AdminEditBar(), EditorContext, EditorContextType, EditorProvider(), LandingSection (+33 more)

### Community 1 - "Actions Module"
Cohesion: 0.08
Nodes (59): adminAssignAffiliateAction(), deleteMemberAction(), CreatePackagePage(), PackagesClient(), PackagesClientProps, dynamic, PackagesPage(), VoucherManagement() (+51 more)

### Community 2 - "Ui Module"
Cohesion: 0.05
Nodes (55): Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent() (+47 more)

### Community 3 - "Ui Module"
Cohesion: 0.07
Nodes (52): AcaraListClient(), AcaraListClientProps, AttendeeItem, EVENT_TYPE_MAP, EventCard(), EventGalleryItem, EventItem, getEventTypeInfo() (+44 more)

### Community 4 - "Home Module"
Cohesion: 0.09
Nodes (41): dynamic, Page(), AboutSection(), alanPoints, missions, AlanIntroSection(), alanPoints, BenefitBand() (+33 more)

### Community 5 - "Registration Form Module"
Cohesion: 0.08
Nodes (52): BundleOfferCard(), RegistrationForm(), goNext(), handleSubmit(), showErrors(), SubmitState, RegistrationStepFields(), RegistrationStepFieldsProps (+44 more)

### Community 6 - "Partner Module"
Cohesion: 0.09
Nodes (47): AddGalleryClient(), AddGalleryClientProps, Album, CATEGORIES, EventItem, ExistingGalleryItem, getStoragePathFromUrl(), MediaLibraryClient() (+39 more)

### Community 7 - "Api Module"
Cohesion: 0.06
Nodes (39): AcaraCreatePage(), dynamic, AcaraPage(), dynamic, AddGalleryPage(), dynamic, PageProps, AddMentoringPage() (+31 more)

### Community 8 - "Article Module"
Cohesion: 0.09
Nodes (43): ArtikelBaruPage(), dynamic, ArtikelEditPage(), dynamic, ArticlePage(), formatPublishedAt(), schema, SLASH_TITLES (+35 more)

### Community 9 - "Settings Module"
Cohesion: 0.08
Nodes (40): ConfirmationPage(), dynamic, dynamic, RevenuePage(), AbsensiPanel(), AbsensiPanelProps, GeneralPanel(), GeneralPanelProps (+32 more)

### Community 10 - "Community Module"
Cohesion: 0.08
Nodes (26): ClosingCTA(), GallerySection(), HeroSection(), JourneySection(), benefits, MembershipSection(), PillarsSection(), ProgramsSection() (+18 more)

### Community 11 - "Media Module"
Cohesion: 0.10
Nodes (33): BatchPage(), BundleAdminPage(), ContactRow, dynamic, KontakPage(), AdminLayout(), countPendingInvoices(), addYoutube() (+25 more)

### Community 12 - "Ui Module"
Cohesion: 0.12
Nodes (33): ArtikelPage(), dynamic, formatDate(), dynamic, PartnerPage(), dynamic, formatReceived, PendaftarPage() (+25 more)

### Community 13 - "Program Module"
Cohesion: 0.10
Nodes (40): deleteBatch(), PUBLIC_TRAINING, revalidate(), saveBatch(), saveBundle(), BatchDraft, BoardBatch, BoardBundle (+32 more)

### Community 14 - "Plans Module"
Cohesion: 0.06
Nodes (30): Admin Design System (Blue Soft UI), BlockNote Article Editor Rules, Admin Form Controls & Reference Geometry (§7), Admin Page Templates (T1-T4), Pola UI Admin — Monochrome Soft, Unified DataTable, TableToolbar & CSV Export (§8), Single Sticky Sidebar & Header Shell, Design & Code Audit Feedback (Codex) (+22 more)

### Community 15 - "Member Module"
Cohesion: 0.09
Nodes (35): ExperiencePanel(), ExperiencePanelProps, PortfolioPanel(), PortfolioPanelProps, PILLARS, ShowcasePanelProps, ShowcaseSubTab, ExperienceDrawer() (+27 more)

### Community 16 - "Ui Module"
Cohesion: 0.11
Nodes (29): ContactFormData, saveContacts(), formatPhoneNumber(), KontakClient(), handleSubmit(), save(), KontakClientProps, saveAcademyProfile() (+21 more)

### Community 17 - "Dashboard Module"
Cohesion: 0.15
Nodes (29): EventAttendanceChart(), EventAttendanceChartProps, DashboardClient(), DashboardClientProps, DashboardHeader(), DashboardHeaderProps, MonetizationInterestsChart(), MonetizationInterestsChartProps (+21 more)

### Community 18 - "Ui Module"
Cohesion: 0.08
Nodes (24): Badge(), badgeVariants, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants, HoverCardContent(), Label() (+16 more)

### Community 19 - "Home Module"
Cohesion: 0.10
Nodes (23): Layout(), Layout(), AdminShellRoot(), HeroSection(), previewImages, highlights, Trainer, TrainerGallery() (+15 more)

### Community 20 - "Ui Module"
Cohesion: 0.09
Nodes (26): OCCUPATION_OPTIONS, OnboardingForm(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader() (+18 more)

### Community 21 - "Admins Module"
Cohesion: 0.14
Nodes (26): AddAdminFromMemberDialog(), AddAdminFromMemberDialogProps, MemberCandidate, TakenColorInfo, AdminsClient(), AdminsClientProps, AdminUser, AdminDetailClient() (+18 more)

### Community 22 - "Myprofile Module"
Cohesion: 0.12
Nodes (23): ProfileSidebarProps, ProfileTopHeader(), ProfileTopHeaderProps, AccountSecurityPanel(), AccountSecurityPanelProps, AchievementPanel(), AchievementPanelProps, GeneralInfoPanel() (+15 more)

### Community 23 - "Cms Module"
Cohesion: 0.10
Nodes (29): dynamic, fields, GaleriPage(), dynamic, fields, TestimoniPage(), dynamic, fields (+21 more)

### Community 24 - "(Form) Module"
Cohesion: 0.13
Nodes (23): Section6CommitmentProps, EXPERT_DESIRE_OPTIONS, FALLBACK_CITIES, MAIN_TOPIC_OPTIONS, MONETIZATION_OPTIONS, SECTION_TITLES, SKILLS_TO_MASTER_OPTIONS, TIME_COMMITMENT_OPTIONS (+15 more)

### Community 25 - "Ui Module"
Cohesion: 0.11
Nodes (28): AccountMenu(), signOut(), AdminShell(), toggleCompact(), toggleGroup(), Badge(), icons, NavItem() (+20 more)

### Community 26 - "Home Module"
Cohesion: 0.15
Nodes (21): ConfirmationPage(), dynamic, rupiah(), ClosingSection(), labels, ContactSection(), FALLBACK_CONTACTS, ProgramShowcaseContent() (+13 more)

### Community 27 - "Server Module"
Cohesion: 0.15
Nodes (27): dateFormatter, formatSessionDate(), formatTimeRange(), parseWib(), rupiahFormatter, timeFormatter, readPrograms(), asObjectArray() (+19 more)

### Community 28 - "Ui Module"
Cohesion: 0.17
Nodes (21): Album, CATEGORIES, GaleriCMSClient(), GaleriCMSClientProps, InstagramIcon(), Partner, PARTNER_TYPES, PartnerClient() (+13 more)

### Community 29 - "Server Module"
Cohesion: 0.14
Nodes (23): emailForUsername(), INVALID, loginAdmin(), LoginPage(), submit(), AdminCredentials, AdminCredentialsInput, isEmailUnconfirmed() (+15 more)

### Community 30 - "Myprofile Module"
Cohesion: 0.19
Nodes (17): ForgotPasswordPage(), submit(), ProfileNavbar(), ProfileNavbarProps, ProfileSidebar(), ProfileTabs(), TabSkeleton(), MyProfilePage() (+9 more)

### Community 31 - "Archive Module"
Cohesion: 0.11
Nodes (25): Abo Priatna, Akta Pendirian CV Asa Albana, Alan Albana, Albana Speech Academy, Andhan Indah, Bank BJB, Bank BNI, BNSP Certification (Master Trainer & Public Speaker) (+17 more)

### Community 32 - "Acara Module"
Cohesion: 0.12
Nodes (20): AcaraCreateForm(), AcaraCreateFormProps, VenueItem, AcaraEditForm(), AcaraEditFormProps, EventData, GalleryAlbumData, VenueItem (+12 more)

### Community 33 - "Community Module"
Cohesion: 0.08
Nodes (6): values, ValuesSection(), philosophy, TentangPhilosophySection(), PreviewNoticeProps, react

### Community 34 - "Server Module"
Cohesion: 0.16
Nodes (21): AdminDashboardPage(), dynamic, PeriodSwitch(), ageBucket(), buildDashboardStats(), DashboardInput, fetchFrom(), group() (+13 more)

### Community 35 - "Layout Module"
Cohesion: 0.14
Nodes (14): Edit(), EditProps, SectionClosingCta(), SectionCurriculum(), SectionFaq(), SectionHero(), SectionOriginStory(), SectionPainPoints() (+6 more)

### Community 36 - "Registration Module"
Cohesion: 0.14
Nodes (16): RegistrationChoice(), RegistrationOverview(), venueLabel(), BatchCardProps, bundleAddOn(), bundleSaving(), ACCEPTING_STATUSES, BatchSession (+8 more)

### Community 37 - "Types Module"
Cohesion: 0.12
Nodes (20): AffiliatePanelProps, ProfileStatsCardsProps, VideoLinkInput(), VideoLinkInputProps, AiAnalysis, AttendanceEvent, CommissionLedgerEntry, Community (+12 more)

### Community 38 - "Ui Module"
Cohesion: 0.20
Nodes (20): DemographicsModal(), StreakLeaderboardTable(), StreakLeaderboardTableProps, MemberStreak, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup() (+12 more)

### Community 39 - "Billing Module"
Cohesion: 0.12
Nodes (9): initialBill(), nextUniqueCode(), PaymentMethod, detectCmsMedia(), formats, contactKindOrder, rank(), sortContactRows() (+1 more)

### Community 40 - "Admin Export Module"
Cohesion: 0.16
Nodes (21): RFC-4180, answer(), GET(), invoices(), isAdmin(), load(), Loaded, Row (+13 more)

### Community 41 - "Auth Module"
Cohesion: 0.15
Nodes (17): RFC-6265, GET(), GET(), ResetPasswordContent(), ResetPasswordPage(), generateNonce(), GoogleSignInButton(), GoogleSignInButtonProps (+9 more)

### Community 42 - "Settings Module"
Cohesion: 0.13
Nodes (16): AdminPageActions(), noopSubscribe(), PageAction(), PageActionsSlot(), PageHeader(), Registry, SettingsFormEntry, SettingsFormsContext (+8 more)

### Community 43 - "Package.Json Module"
Cohesion: 0.08
Nodes (24): dependencies, animejs@^4.5.0, @blocknote/core@^0.50.0, class-variance-authority@^0.7.1, gsap@^3.15.0, @hello-pangea/dnd@^18.0.1, lucide-react@^1.16.0, motion@^14.14.0 (+16 more)

### Community 44 - "Actions Module"
Cohesion: 0.16
Nodes (18): dynamic, PaymentPage(), PaymentClient(), PaymentClientProps, Transaction, AffiliatePanel(), GenerateAffiliateModal(), GenerateAffiliateModalProps (+10 more)

### Community 45 - "(Form) Module"
Cohesion: 0.15
Nodes (16): MemberPriorityRegisterInner(), MemberPriorityRegisterPage(), MemberCollectionRegisterInner(), MemberCollectionRegisterPage(), StepEssential(), ProfileLayout(), ProfileLayoutProps, metadata (+8 more)

### Community 46 - "Venue Module"
Cohesion: 0.16
Nodes (16): AddVenueClient(), AddVenueClientProps, formatPhone(), getStoragePathFromUrl(), Venue, AddVenuePage(), dynamic, PageProps (+8 more)

### Community 47 - "(Form) Module"
Cohesion: 0.20
Nodes (18): SECTION_TITLES, Section1Profile, Section1ProfileProps, Section2PublicSpeaking(), Section3PersonalBranding(), Section4Career(), Section4CareerProps, Section5Topic() (+10 more)

### Community 48 - "Components.Json Module"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 49 - "Api Module"
Cohesion: 0.18
Nodes (14): AdminsPage(), dynamic, dynamic, LogsPage(), buildCompactPayload(), POST(), GET(), POST() (+6 more)

### Community 50 - "Ui Module"
Cohesion: 0.19
Nodes (12): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), Loading() (+4 more)

### Community 51 - "Tsconfig.Json Module"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 52 - "Rekening Module"
Cohesion: 0.16
Nodes (14): ActionState, activateBankAccount(), deleteBankAccount(), saveBankAccount(), RekeningClient(), handleActivate(), handleDelete(), handleFormSubmit() (+6 more)

### Community 53 - "Formvalidation Module"
Cohesion: 0.29
Nodes (13): usePriorityFormState(), useCollectionFormState(), useOnboardingFormState(), checkEmailExistsAction(), checkWhatsappExistsAction(), clearFieldError(), FieldErrors, getFieldError() (+5 more)

### Community 54 - "Architecture Module"
Cohesion: 0.13
Nodes (17): Recommended Backend Menu Structure Diagram, Albana CMS Admin Structure Specification, Albana Speech Academy API Reference, POST /api/registrations, RPC receive_academy_registration(request jsonb), CMS Data Flow Diagram (Catalog vs Program Media), Albana Menu Structure Diagram, Albana Menu & Data Flow Map (+9 more)

### Community 55 - "Myprofile Module"
Cohesion: 0.18
Nodes (13): UnsavedChangesBar(), UnsavedChangesBarProps, UnderConstruction(), UnderConstructionProps, EditProfileSidebar(), EditProfileSidebarProps, PROFILE_EDIT_TABS, ProfileEditTabId (+5 more)

### Community 56 - "Server Module"
Cohesion: 0.20
Nodes (13): CmsCollection, cmsCollections, CmsField, CmsTable, parseCmsInput(), Row, base(), deleteCmsRow() (+5 more)

### Community 57 - "Package.Json Module"
Cohesion: 0.11
Nodes (17): add@^2.0.6, clsx@^2.1.1, date-fns@^4.4.0, groq-sdk@^1.2.1, @mantine/hooks@^8.3.18, shadcn@^4.12.0, tailwind-merge@^3.6.0, name (+9 more)

### Community 58 - "Api Module"
Cohesion: 0.16
Nodes (14): DELETE(), PATCH(), portfolioUpdateSchema, dateSanitizer, emptyStringSanitizer, generateAffiliateCode(), interestsSchema, POST() (+6 more)

### Community 59 - "Ui Module"
Cohesion: 0.20
Nodes (8): metadata, RootLayout(), ThemeToggle(), PageTransitionLoader(), Toaster(), ThemeScript(), subscribe(), useIsDark()

### Community 60 - "Stats Module"
Cohesion: 0.21
Nodes (12): Bars(), Chip(), DashboardView(), OpenLink(), periodWord, Rupiah(), Sparkline(), SplitBar() (+4 more)

### Community 61 - "Package.Json Module"
Cohesion: 0.12
Nodes (17): devDependencies, supabase@^2.109.0, tailwindcss@^4, @tailwindcss/postcss@^4, @types/node@^20, @types/nodemailer@^8.0.0, @types/react@^19, @types/react-dom@^19 (+9 more)

### Community 62 - "Content Module"
Cohesion: 0.14
Nodes (15): Dark and Light Mode Requirement, Abo Priatna (Trainer MC & Host), Alan Albana (Founder & Master Trainer), Albana Speech Academy (CV Asa Albana), Andhan Indah (Trainer & MC), Communication Development Framework, 70:20:10 Learning Model, Nurachman (Trainer & Author) (+7 more)

### Community 63 - "Actions Module"
Cohesion: 0.22
Nodes (13): CheckoutClient(), formatWhatsapp(), CheckoutPage(), dynamic, signout(), CheckoutPayload, cleanSocialUsername(), deleteMembersAction() (+5 more)

### Community 64 - "Program Module"
Cohesion: 0.24
Nodes (12): NotFound(), Page(), ProgramContent(), copy, ProgramCardView(), rupiah(), ProgramDetailFailure(), ProgramDetailLoading() (+4 more)

### Community 65 - "Register Module"
Cohesion: 0.23
Nodes (11): Page(), previewBatch, metadata, Page(), ProgramRegistration(), rupiah(), ScheduleSection(), RegisterPage() (+3 more)

### Community 66 - "Project Module"
Cohesion: 0.19
Nodes (15): Environment & Operations Guide (Albana Speech Academy), PRD — Website Kelas dan CMS Albana Speech Academy (v1.1), Program: Public Speaking for Speakers, Program: Public Speaking Series, Program: Sertifikasi Pembicara Profesional (BNSP), Project Brief — Website Kelas Albana Speech Academy, Website Revision & Development Specification, CMS Program, Batch, and Bundle Offer Spec (+7 more)

### Community 67 - "Members Module"
Cohesion: 0.18
Nodes (11): ActionResponse, generateBaseUsername(), generateRandomPassword(), SendCredentialsPayload, sendMemberCredentialsAction(), dynamic, MembersPage(), dynamic (+3 more)

### Community 68 - "Members Module"
Cohesion: 0.23
Nodes (13): fetchLatestMembersAction(), updateMemberStatusAction(), InstagramIcon(), LinkedinIcon(), MemberFormRecapModal(), MemberFormRecapModalProps, YoutubeIcon(), formatOccupation() (+5 more)

### Community 69 - "Myprofile Module"
Cohesion: 0.23
Nodes (12): AttendanceHistory(), AttendanceHistoryProps, EVENT_TYPE_LABELS, AttendanceStats(), AttendanceStatsProps, AttendanceTracker(), AttendanceTrackerProps, calculateAttendanceStats() (+4 more)

### Community 70 - "Archive Module"
Cohesion: 0.15
Nodes (13): CMS Database Implementation Plan, Admin Restructure & Redesign Implementation Plan, Admin Sidebar Visibility Implementation Plan, CMS and Registration Database Design Spec, Admin Restructure & Redesign Design Spec, 12 Named CMS Admin Modules, Global Sidebar Visibility Setting, Admin Sidebar Visibility Design Spec (+5 more)

### Community 71 - "Data Module"
Cohesion: 0.18
Nodes (14): Three Registration Form Variants (series, exclusive, bnsp), Public Speaking for Speakers Program, Public Speaking Series Program, Registration Confirmation Page (/register/konfirmasi/[token]), Sertifikasi Pembicara Profesional Program, public.academy_invoices Table, public.academy_registrations Table, public.bank_accounts Table (+6 more)

### Community 72 - "Acara Module"
Cohesion: 0.27
Nodes (7): AcaraDetailLoading(), AcaraLoading(), AffiliatePayoutLoading(), ConfirmationLoading(), MembersLoading(), PackagesLoading(), LoadingStateTracker()

### Community 73 - "Media Prepare Module"
Cohesion: 0.26
Nodes (11): json(), minimums(), POST(), runtime, MAX_IMAGE_OUTPUT, MAX_IMAGE_SOURCE, MAX_VIDEO_SOURCE, prepareImage() (+3 more)

### Community 74 - "Registration Input Module"
Cohesion: 0.27
Nodes (9): parseAcademySubmission(), input, field(), isSlug(), oneOf(), parseRegistration(), record(), input (+1 more)

### Community 75 - "Affiliate Payout Module"
Cohesion: 0.24
Nodes (11): AffiliatePayoutClient(), AffiliatePayoutClientProps, AffiliateTransaction, Affiliator, CommissionMutation, PayoutRecord, AffiliatePayoutPage(), dynamic (+3 more)

### Community 76 - "Galeri Module"
Cohesion: 0.23
Nodes (7): Loading(), Loading(), Loading(), Loading(), Loading(), Loading(), SkeletonCards()

### Community 77 - "Pendaftar Module"
Cohesion: 0.29
Nodes (12): attendanceLabel(), dateOnly(), dateTime(), formatWhatsapp(), InfoRow(), paymentOptions, PendaftarClient(), Registration (+4 more)

### Community 78 - "(Form) Module"
Cohesion: 0.21
Nodes (10): EXPERT_DESIRE_OPTIONS, FALLBACK_CITIES, MAIN_TOPIC_OPTIONS, MONETIZATION_OPTIONS, NERVOUS_TRIGGER_OPTIONS, PS_CHALLENGE_OPTIONS, SKILLS_TO_MASTER_OPTIONS, TIME_COMMITMENT_OPTIONS (+2 more)

### Community 79 - "(Form) Module"
Cohesion: 0.24
Nodes (9): Section2PublicSpeakingProps, NERVOUS_TRIGGER_OPTIONS, PS_CHALLENGE_OPTIONS, Section2PublicSpeaking(), Section2PublicSpeakingProps, MultiSelectLine(), MultiSelectLineProps, ScaleSelectorLine() (+1 more)

### Community 80 - "Admin List Module"
Cohesion: 0.24
Nodes (11): ADMIN_PAGE_SIZE, adminDateFormatter, displayValue(), filterRows(), listFields(), paginateRows(), PRIMARY_NAMES, primaryValue() (+3 more)

### Community 81 - "Attendance Module"
Cohesion: 0.24
Nodes (9): AttendanceClient(), AttendancePage(), dynamic, dynamic, MemberOnboardingPage(), getMemberOnboardingDataAction(), OnboardingMemberData, SubmitOnboardingPayload (+1 more)

### Community 82 - "Progress Module"
Cohesion: 0.27
Nodes (6): TopProgressBar(), handleGlobalClick(), finishProgress(), PROGRESS_FINISH_EVENT, PROGRESS_START_EVENT, startProgress()

### Community 83 - "Create Admin.Js Module"
Cohesion: 0.17
Nodes (7): { createClient }, { loadEnvConfig }, supabase, { createClient }, supabase, @supabase/supabase-js@^2.110.0, @supabase/supabase-js

### Community 84 - "Admin Modules Module"
Cohesion: 0.17
Nodes (7): AdminGroup, adminGroups, AdminModule, adminModules, adminSettingsMenu, adminSidebarMenu, settingsTables

### Community 85 - "Auth Module"
Cohesion: 0.33
Nodes (6): AppleButton(), AuthButton(), AuthButtonProps, CanvaButton(), EmailButton(), MicrosoftButton()

### Community 86 - "Motion Module"
Cohesion: 0.42
Nodes (7): learningApproaches, LearningMethodSection(), CountUp(), countDurationMs(), countUpText(), REVEAL_TRIGGER_FRACTION, REVEAL_TRIGGER_MARGIN

### Community 87 - "Referral Module"
Cohesion: 0.29
Nodes (8): dynamic, ReferralPage(), MemberOption, Props, ReferralCodeItem, ReferralManagement(), toggleReferralCodeStatusAction(), upsertReferralCodeAction()

### Community 88 - "Api Module"
Cohesion: 0.38
Nodes (6): json(), POST(), runtime, createReceiptToken(), readReceiptToken(), signature()

### Community 89 - "Myprofile Module"
Cohesion: 0.29
Nodes (9): DEFAULT_PILLARS, EXPERIENCE_MAP, GOAL_MAP, InstagramIcon(), INTEREST_MAP, LinkedInIcon(), ProfileOverviewContent(), TikTokIcon() (+1 more)

### Community 90 - "Albana Routes Module"
Cohesion: 0.33
Nodes (5): adminPaths, isAlbanaPath(), authRedirect(), config, proxy()

### Community 91 - "Acara Module"
Cohesion: 0.25
Nodes (7): AcaraDetailClientProps, AttendanceRecord, EVENT_TYPE_MAP, EventDetail, GalleryDetail, MemberItem, hasPermission()

### Community 92 - "Artikel Module"
Cohesion: 0.33
Nodes (5): Loading(), Loading(), Loading(), Loading(), SkeletonList()

### Community 93 - "Artikel Module"
Cohesion: 0.31
Nodes (6): ArticlesPage(), formatPublishedAt(), metadata, listPublicArticles(), PublicArticle, PublicArticleDetail

### Community 94 - "Community Module"
Cohesion: 0.31
Nodes (6): CollaborationsClient(), CollaborationsClientProps, PartnerItem, CollaborationsSection(), Window, gsap

### Community 95 - "Ui Module"
Cohesion: 0.28
Nodes (8): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea()

### Community 96 - "Archive Module"
Cohesion: 0.29
Nodes (8): Indeks Pengerjaan Albana Speech Academy (legacy-implementation-index.md), Langkah 1 — Landing Page (legacy-step-01-landing-page.md), Teaching Method 70% Practice / 20% Coaching / 10% Concept, Langkah 1B — Halaman Detail Program (legacy-step-01b-program-detail.md), Langkah 2 — Form Pendaftaran per Batch (legacy-step-02-registration-form.md), Langkah 3 — CMS dan Konten Akademi (legacy-step-03-cms-content.md), Langkah 4 — Pembayaran Manual dan Peserta (legacy-step-04-payment-participants.md), Langkah 5 — Migrasi Hostinger dan Pemulihan (legacy-step-05-hostinger-migration.md)

### Community 97 - "Aktivitas Module"
Cohesion: 0.32
Nodes (6): AktivitasClient(), AktivitasClientProps, MemberAttendance, MonthlyAttendance, AktivitasPage(), dynamic

### Community 98 - "Auth Module"
Cohesion: 0.29
Nodes (5): Loading(), GoogleButton(), GoogleButtonProps, Skeleton(), signInWithGoogle()

### Community 99 - "Myprofile Module"
Cohesion: 0.46
Nodes (5): ProfileTabsProps, TabSkeletonProps, PROFILE_NAV_ITEMS, ProfileNavItem, ProfileTab

### Community 100 - "Admin Nav Module"
Cohesion: 0.36
Nodes (6): AdminNavGroup, adminNavGroups, AdminNavIcon, AdminNavModule, isWithin(), resolveAdminNav()

### Community 101 - "Funnel Module"
Cohesion: 0.47
Nodes (4): FunnelClient(), FunnelClientProps, dynamic, FunnelPage()

### Community 102 - "Ui Module"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 103 - "Ui Module"
Cohesion: 0.40
Nodes (3): SelectLine(), SelectLineOption, SelectLineProps

### Community 104 - "Package.Json Module"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.2.6, eslint, eslint-config-next

### Community 105 - "Cms Key Module"
Cohesion: 0.53
Nodes (4): decodeCmsKey(), encodeCmsKey(), encodePart(), NEW_RECORD_KEY

### Community 107 - "Architecture Module"
Cohesion: 0.40
Nodes (4): GET /api/media/[id], POST /api/upload, Dual CMS Write Paths (Direct Supabase Client + RLS vs Server API + Storage + Draft Status), Media Storage & Signed URL Pipeline (academy-media, gallery, testimonials, YouTube)

### Community 108 - "Archive Module"
Cohesion: 0.40
Nodes (5): asa-box-minimalist Visual Direction (Swiss Grid, Warm Paper #F4F2ED, 0px Radius, Franklin Gothic ATF & IBM Plex Mono), Classic Design Spec (asa-box-minimalist), Design Style Backup Index (2026-11-08), asa-soft-reference Visual Direction (Inter & Montserrat, #F7F4EE/#CBD9E7/#E6EDF4, 0px Radius), Archived Visual Design Spec (2026-11-08, asa-soft-reference)

### Community 109 - "Archive Module"
Cohesion: 0.40
Nodes (3): Hostinger Hosting Target, WhatsApp Group Material Delivery, Arsitektur Teknis — Albana Speech Academy (technical-plan.md)

### Community 110 - "Archive Module"
Cohesion: 0.40
Nodes (5): Four-Step Registration Wizard, Registration Intake (POST /api/registrations & receive-registration), RPC receive_registration(batch, expected_price, participant, consent), Registration HTTP Error Recovery (200/409/422/429/503), Production Ingress Rate Limiting (30 req/batch/min)

### Community 111 - "Archive Module"
Cohesion: 0.40
Nodes (4): On-Site Registration Form Implementation Plan, /register/[program] Route, Four-Step Registration Wizard Implementation Plan, On-Site Registration Form Design Spec

### Community 112 - "Attendance Module"
Cohesion: 0.40
Nodes (4): AttendanceClientProps, AttendanceRecord, EventItem, MemberItem

### Community 113 - "Package.Json Module"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 114 - "Archive Module"
Cohesion: 0.50
Nodes (4): Legacy Dual Supabase Sync Rule (syncDualOperation), Floating Bottom Action Dock & Centralized Pagination Pattern, Legacy Admin Mobile UI/UX Guidelines (Modern Monochrome), Legacy Xenith-Style Admin Dashboard Design Spec

### Community 115 - "Archive Module"
Cohesion: 0.50
Nodes (4): 70/20/10 Teaching Model (Experiential, Coaching, Concept), Program: Public Speaking for Speakers (BNSP Scheme), Program: Public Speaking Series, Legacy Registration Form Copy & Program Checkboxes

### Community 116 - "Archive Module"
Cohesion: 0.50
Nodes (4): Alur Sistem Albana (user-flow.md), Rencana Implementasi Admin, Artikel, dan Pendaftaran (11 Nov 2026), Audit Langkah 1 — Kontrak Data (2026-11-11-step-1-data-contract-audit.md), Inventaris Rute Admin & Bukti Perbaikan (2026-11-11-step-2-admin-inventory.md)

### Community 117 - "Archive Module"
Cohesion: 0.50
Nodes (3): Smooth Reference Redesign Implementation Plan, SectionRail Component Plan, Asa Soft Reference Design Spec

### Community 118 - "Galeri Module"
Cohesion: 0.50
Nodes (3): Album, GaleriFilterSection(), GaleriFilterSectionProps

### Community 119 - "Tentang Module"
Cohesion: 0.50
Nodes (3): founder, team, TentangTeamSection()

### Community 122 - "Architecture Module"
Cohesion: 0.67
Nodes (3): Admin Server Actions (resolveInvoice, saveBundle, savePartner, togglePartner, addYoutube, setMediaPublished, saveMediaSettings), RPC resolve_academy_invoice(target_invoice_id, decision, reviewer), Path C: Privileged Operations (Code Guard + Service Role)

### Community 125 - "Project Module"
Cohesion: 0.67
Nodes (3): REGISTRATION_RECEIPT_SECRET, Supabase Project clgjsekfnexmanjdxmqy, Next.js 16 App Router + React 19 Application (front/)

### Community 128 - "Package.Json Module"
Cohesion: 0.67
Nodes (3): allowScripts, sharp@0.34.5, unrs-resolver@1.11.1

## Knowledge Gaps
- **143 isolated node(s):** `RFC-4180`, `RFC-6265`, `Active Redesign & Restructure Implementation Plan (2026-11-16)`, `Proposed Public Navigation (Program, Cara belajar, Trainer, Dokumentasi, Artikel, Kontak)`, `Recommended Backend Menu Structure Diagram` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 796 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **78 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community Module` to `Landing Module`, `Actions Module`, `Ui Module`, `Ui Module`, `Home Module`, `Registration Form Module`, `Partner Module`, `Api Module`, `Article Module`, `Settings Module`, `Community Module`, `Media Module`, `Ui Module`, `Program Module`, `Member Module`, `Ui Module`, `Dashboard Module`, `Ui Module`, `Home Module`, `Ui Module`, `Admins Module`, `Myprofile Module`, `Cms Module`, `(Form) Module`, `Ui Module`, `Home Module`, `Ui Module`, `Server Module`, `Myprofile Module`, `Acara Module`, `Layout Module`, `Registration Module`, `Types Module`, `Ui Module`, `Auth Module`, `Settings Module`, `Package.Json Module`, `Actions Module`, `(Form) Module`, `Venue Module`, `(Form) Module`, `Api Module`, `Rekening Module`, `Formvalidation Module`, `Myprofile Module`, `Package.Json Module`, `Ui Module`, `Stats Module`, `Actions Module`, `Program Module`, `Register Module`, `Members Module`, `Members Module`, `Myprofile Module`, `Acara Module`, `Affiliate Payout Module`, `Pendaftar Module`, `(Form) Module`, `(Form) Module`, `Attendance Module`, `Progress Module`, `Auth Module`, `Motion Module`, `Referral Module`, `Myprofile Module`, `Acara Module`, `Community Module`, `Ui Module`, `Aktivitas Module`, `Myprofile Module`, `Funnel Module`, `Ui Module`, `Ui Module`, `Attendance Module`, `Galeri Module`, `Tentang Module`, `Tentang Module`?**
  _High betweenness centrality (0.362) - this node is a cross-community bridge._
- **What connects `RFC-4180`, `RFC-6265`, `Active Redesign & Restructure Implementation Plan (2026-11-16)` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing Module` be split into smaller, more focused modules?**
  _Cohesion score 0.06414414414414414 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Landing Module` to `Actions Module`, `Ui Module`, `Home Module`, `Registration Form Module`, `Partner Module`, `Api Module`, `Article Module`, `Settings Module`, `Community Module`, `Media Module`, `Ui Module`, `Program Module`, `Member Module`, `Ui Module`, `Dashboard Module`, `Home Module`, `Ui Module`, `Admins Module`, `Myprofile Module`, `Cms Module`, `Ui Module`, `Home Module`, `Ui Module`, `Server Module`, `Myprofile Module`, `Acara Module`, `Community Module`, `Layout Module`, `Auth Module`, `Settings Module`, `Package.Json Module`, `Actions Module`, `(Form) Module`, `Venue Module`, `(Form) Module`, `Api Module`, `Rekening Module`, `Myprofile Module`, `Package.Json Module`, `Api Module`, `Ui Module`, `Stats Module`, `Actions Module`, `Program Module`, `Register Module`, `Members Module`, `Members Module`, `Affiliate Payout Module`, `Attendance Module`, `Progress Module`, `Motion Module`, `Referral Module`, `Myprofile Module`, `Albana Routes Module`, `Acara Module`, `Artikel Module`, `Community Module`, `Aktivitas Module`, `Funnel Module`?**
  _High betweenness centrality (0.153) - this node is a cross-community bridge._
- **Should `Actions Module` be split into smaller, more focused modules?**
  _Cohesion score 0.08252252252252253 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Ui Module` to `Landing Module`, `Actions Module`, `Ui Module`, `Partner Module`, `Article Module`, `Settings Module`, `Community Module`, `Media Module`, `Ui Module`, `Program Module`, `Member Module`, `Ui Module`, `Dashboard Module`, `Ui Module`, `Ui Module`, `Admins Module`, `Myprofile Module`, `Cms Module`, `Ui Module`, `Ui Module`, `Myprofile Module`, `Acara Module`, `Community Module`, `Layout Module`, `Types Module`, `Ui Module`, `Auth Module`, `Settings Module`, `Package.Json Module`, `Actions Module`, `(Form) Module`, `Venue Module`, `(Form) Module`, `Rekening Module`, `Myprofile Module`, `Package.Json Module`, `Ui Module`, `Stats Module`, `Actions Module`, `Members Module`, `Myprofile Module`, `Affiliate Payout Module`, `Pendaftar Module`, `Referral Module`, `Myprofile Module`, `Acara Module`, `Aktivitas Module`, `Auth Module`, `Myprofile Module`, `Funnel Module`, `Ui Module`, `Attendance Module`, `Galeri Module`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `Ui Module` be split into smaller, more focused modules?**
  _Cohesion score 0.049872122762148335 - nodes in this community are weakly interconnected._