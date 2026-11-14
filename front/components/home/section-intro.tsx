type SectionIntroProps = {
  eyebrow: string;
  title: string;
  titleId: string;
  description?: string;
  className?: string;
};

export function SectionIntro({
  eyebrow,
  title,
  titleId,
  description,
  className = "",
}: SectionIntroProps) {
  return (
    <div className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2
        id={titleId}
        className="mt-3 max-w-[24ch] text-[2rem] leading-[1.05] font-semibold tracking-[-0.045em] text-balance md:text-[2.5rem] lg:text-[3rem]"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-[32em] leading-[1.6] text-muted">{description}</p>
      ) : null}
    </div>
  );
}
