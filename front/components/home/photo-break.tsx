import type { HomeMedia } from "@/lib/home-data";
import { SkeletonImage } from "./skeleton-image";

function Frame({ photo, sizes, className }: { photo: HomeMedia; sizes: string; className: string }) {
  return (
    <div data-motion="frame" className={`relative overflow-hidden rounded-xs bg-[var(--tone-tile)] ${className}`}>
      <div data-frame-inner className="absolute inset-0 will-change-transform">
        <SkeletonImage
          fill
          src={photo.src}
          alt={photo.alt}
          sizes={sizes}
          blurDataURL={photo.blurDataURL ?? undefined}
          className="object-cover object-[50%_25%]"
        />
      </div>
    </div>
  );
}

/** Jeda foto antarsection: satu foto lebar, atau deret bingkai potret (tiga kolom di desktop, bertumpuk di ponsel). */
export function PhotoBreak({
  photos,
  tone,
  mobileOnly = false,
}: {
  photos: HomeMedia[];
  tone?: "canvas" | "mist";
  mobileOnly?: boolean;
}) {
  if (photos.length === 0) return null;

  const content =
    photos.length === 1 ? (
      <Frame
        photo={photos[0]}
        sizes="(min-width: 1280px) 1200px, 100vw"
        className="aspect-[4/3] sm:aspect-video"
      />
    ) : (
      <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
        {photos.map((photo) => (
          <Frame
            key={photo.id}
            photo={photo}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 30vw, 100vw"
            className="aspect-[3/4]"
          />
        ))}
      </div>
    );

  const body = tone ? (
    <div className={`tone-${tone}`}>
      <div className="home-container">{content}</div>
    </div>
  ) : (
    content
  );

  return <div className={mobileOnly ? "sm:hidden" : undefined}>{body}</div>;
}
