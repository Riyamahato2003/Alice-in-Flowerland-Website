import React, { useEffect, useRef, useState } from 'react';

interface MediaFrameProps {
  type?: 'image' | 'video';
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  type = 'image',
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  poster,
  autoPlay = true,
  controls = false,
  muted = true,
  loop = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoPlay) return;
    el.muted = muted;
    el.defaultMuted = muted;
    el.loop = loop;
    const attemptPlay = () => {
      el.play().catch(() => {
        // Autoplay policy fallback handled gracefully via muted/controls
      });
    };
    if (el.readyState >= 2) {
      attemptPlay();
    } else {
      el.addEventListener('loadeddata', attemptPlay, { once: true });
      return () => el.removeEventListener('loadeddata', attemptPlay);
    }
  }, [autoPlay, loop, muted, src]);

  if (hasError || !src) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#F6ECEF] via-[#EDE7F3] to-[#DFC9D1] flex flex-col items-center justify-center p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9E4764"
          strokeWidth="1.25"
          className="mb-3 opacity-80"
          aria-hidden="true"
        >
          <path d="M12 3c2 2.2 3 4.5 3 6.5a3 3 0 1 1-6 0c0-2 1-4.3 3-6.5Z" />
          <path d="M12 12.5v8.5" />
          <path d="M12 16c2.5 0 4.5-1.5 5-3.5" />
          <path d="M12 18c-2.5 0-4.5-1.5-5-3.5" />
        </svg>
        <span className="font-serif text-sm text-[#2A1E24] tracking-wide">{alt}</span>
      </div>
    );
  }

  if (type === 'video' || src.endsWith('.mp4')) {
    const videoSrc =
      !autoPlay && !src.includes('#') ? `${src}#t=0.1` : src;
    return (
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        loop={loop}
        muted={muted}
        playsInline
        preload={autoPlay ? 'auto' : 'metadata'}
        aria-label={alt}
        onEnded={() => {
          if (loop && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        }}
        onError={() => setHasError(true)}
        className={`${imgClassName} ${className}`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${imgClassName} ${className}`}
    />
  );
};
