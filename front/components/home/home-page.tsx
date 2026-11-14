import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionReveal } from "@/components/ui/section-reveal";
import { AlanIntroSection } from "./alan-intro-section";
import { ContactSection } from "./contact-section";
import { DocumentationSection } from "./documentation-section";
import { HeroSection } from "./hero-section";
import { LearningMethodSection } from "./learning-method-section";
import { ProgramSection } from "./program-section";
import { ProgramShowcaseSection } from "./program-showcase-section";
import { TestimonialSection } from "./testimonial-section";
import { TrainerSection } from "./trainer-section";
import { TrainingFormatSection } from "./training-format-section";

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <SectionReveal />
        <HeroSection />
        <ProgramShowcaseSection />
        <ProgramSection />
        <AlanIntroSection />
        <LearningMethodSection />
        <TrainerSection />
        <DocumentationSection />
        <TestimonialSection />
        <TrainingFormatSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
