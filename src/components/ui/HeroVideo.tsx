import { imageSlots } from '@content/image-slots';
import { ImageSlot } from './ImageSlot';

/**
 * Full-bleed hero media. Muted, looping video with a poster; under
 * prefers-reduced-motion the video is hidden and the still (poster) stays.
 * Until footage is supplied the placeholder slot is shown.
 */
export function HeroVideo() {
  const video = imageSlots['hero-video'];
  const still = imageSlots['hero-still'];

  if (!video.src) return <ImageSlot id="hero-video" fill priority labelTop />;

  return (
    <div className="absolute inset-0">
      {still.src && <ImageSlot id="hero-still" fill priority />}
      <video
        className="hero-video absolute inset-0 size-full object-cover"
        src={video.src}
        poster={video.poster ?? still.src ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
    </div>
  );
}
