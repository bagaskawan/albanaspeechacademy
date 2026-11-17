import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomeScroll } from "@/lib/motion/scroll";
import { readHomeData } from "@/lib/server/home-data";
import { AboutSection } from "./about-section";
import { BenefitBand } from "./benefit-band";
import { ClosingSection } from "./closing-section";
import { HeroSection } from "./hero-section";
import { LearningMethodChapter } from "./learning-method-chapter";
import { LegalitySection } from "./legality-section";
import { PreviewBanner } from "./preview-banner";
import { ProgramChapter } from "./program-chapter";
import { RegistrationStepsSection } from "./registration-steps-section";
import { ScheduleSection } from "./schedule-section";
import { TestimonialChapter } from "./testimonial-chapter";
import { TrainerSection } from "./trainer-section";

export async function HomePage() {
  const data = await readHomeData();

  return (
    <>
      <SiteHeader home />
      <main id="main-content">
        <HomeScroll />
        <PreviewBanner preview={data.preview} />
        <HeroSection hero={data.hero} />
        <BenefitBand hero={data.hero} />
        <ProgramChapter programs={data.programs} inhouse={data.inhouse} />
        <AboutSection />
        <LearningMethodChapter moments={data.moments} />
        <LegalitySection />
        <TestimonialChapter testimonials={data.testimonials} />
        <TrainerSection />
        <ScheduleSection programs={data.programs} moments={data.moments} />
        <RegistrationStepsSection />
        <ClosingSection moments={data.moments} />
      </main>
      <SiteFooter />
    </>
  );
}
