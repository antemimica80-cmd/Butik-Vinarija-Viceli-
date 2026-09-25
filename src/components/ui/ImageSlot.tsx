import Image from 'next/image';
import { useLocale } from 'next-intl';
import type { CSSProperties } from 'react';
import { imageSlots, type ImageSlotId } from '@content/image-slots';
import { BASE_PATH } from '@/lib/static';

const toneClass = {
  sun: 'bg-[#d9d1c3] text-ink-soft',
  shade: 'bg-charcoal text-stone-light',
  cellar: 'bg-plavac-deep text-sun-pale/80',
} as const;

type Props = {
  id: ImageSlotId;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Fill the parent instead of using the slot's aspect ratio. */
  fill?: boolean;
  /** Hide the art-direction text on the placeholder (e.g. for small thumbnails). */
  compact?: boolean;
  /** Put the placeholder label at the top (when text overlays the bottom). */
  labelTop?: boolean;
  /** No placeholder label at all (tiny thumbnails). */
  bare?: boolean;
  /** Override the slot's aspect ratio (e.g. to line up cards), e.g. "4/5". */
  ratio?: string;
};

/**
 * A named photography slot. Renders the real image when `src` is set in
 * content/image-slots.ts, otherwise a neutral tone with the art-direction label.
 */
export function ImageSlot({ id, sizes = '100vw', priority, className = '', fill, compact, labelTop, bare, ratio }: Props) {
  const locale = useLocale() as 'en' | 'hr';
  const slot = imageSlots[id];
  const style = {
    '--r': ratio ?? slot.ratio,
    '--rm': ratio ?? ('mobileRatio' in slot ? slot.mobileRatio : slot.ratio),
  } as CSSProperties;
  const frame = fill ? 'absolute inset-0' : 'relative aspect-[var(--rm)] md:aspect-[var(--r)]';

  if (slot.src && slot.kind === 'video') {
    const poster = 'poster' in slot && slot.poster ? `${BASE_PATH}${slot.poster}` : undefined;
    return (
      <div className={`${frame} overflow-hidden bg-basalt ${className}`} style={style}>
        {poster && <Image src={poster} alt="" fill sizes={sizes} priority={priority} className="object-cover" aria-hidden />}
        <video
          className="hero-video absolute inset-0 size-full object-cover"
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={slot.alt[locale]}
        >
          {/* H.264 for Safari/Chrome, VP9 fallback for browsers without H.264 */}
          <source src={`${BASE_PATH}${slot.src}`} type="video/mp4" />
          <source src={`${BASE_PATH}${slot.src.replace(/\.mp4$/, '.webm')}`} type="video/webm" />
        </video>
      </div>
    );
  }

  if (slot.src) {
    return (
      <div className={`${frame} overflow-hidden ${className}`} style={style}>
        <Image src={`${BASE_PATH}${slot.src}`} alt={slot.alt[locale]} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={slot.alt[locale]}
      data-slot={id}
      className={`${frame} grain overflow-hidden ${toneClass[slot.tone]} ${className}`}
      style={style}
    >
      {!bare && <div className="absolute inset-3 border border-current opacity-20 md:inset-5" aria-hidden />}
      <div
        hidden={bare}
        className={`absolute inset-x-5 max-w-md md:inset-x-8 ${labelTop ? 'top-[calc(var(--nav-h)+1.25rem)] md:top-[calc(var(--nav-h)+2rem)]' : 'bottom-5 md:bottom-8'}`}
        aria-hidden
      >
        <p className="label">
          {slot.kind === 'video' ? 'Video' : 'Photo'} · {id} · {slot.ratio}
        </p>
        {!compact && <p className="mt-2 hidden text-xs leading-relaxed opacity-80 sm:block">{slot.shot}</p>}
      </div>
    </div>
  );
}
