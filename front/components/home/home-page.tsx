import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomeScroll } from "@/lib/motion/scroll";
import { AboutSection } from "./about-section";
import { BenefitBand } from "./benefit-band";
import { ClosingSection } from "./closing-section";
import { DocumentationSection } from "./documentation-section";
import { HeroSection } from "./hero-section";
import { LearningMethodChapter } from "./learning-method-chapter";
import { PracticePreviewSection } from "./practice-preview-section";
import { PartnersStrip } from "./partners-strip";
import { ProgramShowcaseSection } from "./program-showcase-section";
import { TestimonialChapter } from "./testimonial-chapter";
import { TrainerSection } from "./trainer-section";
import { ScheduleSection } from "./schedule-section";
import { RegistrationStepsSection } from "./registration-steps-section";

export function HomePage() {
  return (
    <>
      <SiteHeader home />
      <main id="main-content">
        <HomeScroll />
        <HeroSection />
        <BenefitBand />
        <ProgramShowcaseSection />
        <PracticePreviewSection />
        <AboutSection />
        <LearningMethodChapter />
        <PartnersStrip />
        <TestimonialChapter />
        <DocumentationSection />
        <TrainerSection />
        <ScheduleSection />
        <RegistrationStepsSection />
        <ClosingSection />
      </main>
      <SiteFooter />
    </>
  );
}
