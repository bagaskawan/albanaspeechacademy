import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { HomeScroll } from "@/lib/motion/scroll";
import { readHomeData } from "@/lib/server/home-data";
import { AboutSection } from "./about-section";
import { BenefitBand } from "./benefit-band";
import { ClosingSection } from "./closing-section";
import { HeroSection } from "./hero-section";
import { LearningMethodChapter } from "./learning-method-chapter";
import { PhotoBreak } from "./photo-break";
import { ProgramChapter } from "./program-chapter";
import { ScheduleSection } from "./schedule-section";
import { TestimonialChapter } from "./testimonial-chapter";
import { TrainerSection } from "./trainer-section";

export async function HomePage() {
  const data = await readHomeData();
  const [
    bandPhotos = [],
    mobileBeforeProgram = [],
    programTrio = [],
    mobileBeforeTestimonial = [],
    afterTestimonial = [],
    mobileBeforeClosing = [],
  ] = data.breaks;

  return (
    <>
      <SiteHeader home />
      <main id="main-content" className="overflow-x-clip">
        <HomeScroll />
        <HeroSection
          hero={data.hero}
          moments={data.moments}
          whatsappHref={data.inhouse.whatsappHref}
        />
        <BenefitBand
          programCount={data.programs === "failed" ? 0 : data.programs.length}
          photos={bandPhotos}
        />
        <PhotoBreak photos={mobileBeforeProgram} tone="canvas" mobileOnly />
        <ProgramChapter programs={data.programs} inhouse={data.inhouse} />
        <PhotoBreak photos={programTrio} tone="canvas" />
        <AboutSection moments={data.moments} />
        <LearningMethodChapter moments={data.moments} />
        <PhotoBreak photos={mobileBeforeTestimonial} tone="canvas" mobileOnly />
        <TestimonialChapter testimonials={data.testimonials} />
        <PhotoBreak photos={afterTestimonial} tone="canvas" />
        <TrainerSection />
        <ScheduleSection programs={data.programs} moments={data.moments} />
        <PhotoBreak photos={mobileBeforeClosing} tone="mist" mobileOnly />
        <ClosingSection moments={data.moments} />
      </main>
      <SiteFooter />
    </>
  );
}
