import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { MediaFrame } from '../components/MediaFrame';
import worktableBg from '../assets/images/alice_floral_worktable_bg_1794911385274.jpg';

interface StudioVideo {
  chapter: string;
  title: string;
  category: string;
  description: string;
  src: string;
  alt: string;
  relatedProductPath: string;
  relatedProductLabel: string;
}

const ALICE_VIDEOS: StudioVideo[] = [
  {
    chapter: '01',
    title: 'Pastel Trio Cloud Hydrangea Bouquet',
    category: 'Pastel Dreams',
    description:
      'Three lush cloud hydrangeas in petal pink, soft periwinkle lavender, and ivory gathered inside a pleated tissue ruff and frosted satin-tied wrap.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.50.08_8640ba48.mp4',
    alt: 'Alice in Flowerland pastel pink, lavender, and cream hydrangea bouquet tied with long champagne satin ribbons',
    relatedProductPath: '/product/pastel-cloud-hydrangea-triad',
    relatedProductLabel: 'View Cloud Hydrangea',
  },
  {
    chapter: '02',
    title: 'Lilac Hydrangea & Pink Calla Wrap',
    category: 'Occasion Edit',
    description:
      'Asymmetric pearl-white layers embracing lavender hydrangeas, blush calla lilies, butter ranunculus, and flowing narrow silk ribbons.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.50.24_9476073b.mp4',
    alt: 'Alice in Flowerland lavender hydrangea, striped pink calla lily, and lisianthus bouquet in matte pearl white paper',
    relatedProductPath: '/product/pastel-calla-sweetpea-sleeve',
    relatedProductLabel: 'View Calla Wrap',
  },
  {
    chapter: '03',
    title: 'Cerulean Sky Delphinium Meadow',
    category: 'Pastel Dreams',
    description:
      'Sunlight catching tall stalks of sky-blue delphiniums styled gracefully in a flared crystal vase for effortless sunlit living rooms.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.50.17_1a766457.mp4',
    alt: 'Sky-blue delphinium meadow blooms arranged in flared glass vase beside sheer sunlight curtains',
    relatedProductPath: '/product/sky-blue-delphinium-bundle',
    relatedProductLabel: 'View Sky Delphiniums',
  },
  {
    chapter: '04',
    title: 'Sunlit Blush Ranunculus Study',
    category: 'Studio Florals',
    description:
      'An intimate morning close-up of layered blush-pink ranunculus blooms unfurling softly by the Saigon atelier window.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.49.43_c143a904.mp4',
    alt: 'Sunlit close-up video of delicate pink ranunculus petals at Alice in Flowerland',
    relatedProductPath: '/product/pastel-mesh-clematis-tulip',
    relatedProductLabel: 'View Ethereal Mesh',
  },
  {
    chapter: '05',
    title: 'Celebration Anthology Reel',
    category: 'Bespoke Highlights',
    description:
      'A multi-chapter reel weaving together Alice in Flowerland’s signature ruffled bouquets, floral baskets, pearl embellishments, and satin bows.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.49.58_666d8270.mp4',
    alt: 'Curated montage of Alice in Flowerland celebration bouquets and baskets',
    relatedProductPath: '/product/grand-ruffle-bow-statement',
    relatedProductLabel: 'View Grand Bouquet',
  },
  {
    chapter: '06',
    title: 'Petite Pastel Sweet Pea Sleeve',
    category: 'Everyday Romance',
    description:
      'Delicate scented pink and pure white sweet peas tucked inside a soft blush sleeve fastened with a creamy satin bow for spontaneous gifting.',
    src: '/assets/aistudio/WhatsApp_Video_2026-11-17_at_15.50.28_8ab8415c.mp4',
    alt: 'Handheld pink and white sweet pea bouquet sleeve tied with cream satin bow and Alice card',
    relatedProductPath: '/product/petite-sweetpea-daydream-sleeve',
    relatedProductLabel: 'View Sweet Pea Sleeve',
  },
];

export const VideosPage: React.FC = () => {
  return (
    <div className="bg-[#FCF9FA] text-[#2A1E24] pb-24">
      {/* Editorial Intro Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-16 lg:py-20 border-b border-[#2A1E24]/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
              @aliceflower.sg · Saigon Studio Films
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.06] text-[#2A1E24]">
              Petals in motion: wrapped in chiffon &amp; morning light.
            </h1>
            <p className="text-sm sm:text-base text-[#74626A] leading-[1.85]">
              Every Alice in Flowerland creation is conditioned stem by stem in our Ho Chi Minh
              City studio before being layered in pleated Korean tissue, scalloped lace, and wide
              satin ribbons. Watch our six boutique reels in natural daylight below.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#74626A]">
              <span className="tabular-nums">6 Saigon Studio Reels</span>
              <span aria-hidden="true">·</span>
              <Link
                to="/delivery"
                className="text-[#2A1E24] underline underline-offset-4 decoration-[#C9A96E] hover:text-[#9E4764] transition-colors"
              >
                Saigon Delivery &amp; Care
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                to="/shop"
                className="text-[#2A1E24] underline underline-offset-4 decoration-[#C9A96E] hover:text-[#9E4764] transition-colors"
              >
                Explore All Blooms
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden bg-[#F6ECEF] border border-[#2A1E24]/10">
              <MediaFrame
                type="image"
                src={worktableBg}
                alt="Sunlit linen-curtained Saigon floral worktable with frosted glass vases and pastel stems"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Equal 6-Film Archive Grid (2 balanced rows of 3) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 lg:pt-20 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#2A1E24]/10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#74626A]">
              Complete Studio Reels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E24] mt-1">
              Bouquets, Hydrangeas &amp; Morning Sunlight
            </h2>
          </div>
          <p className="text-xs text-[#74626A] max-w-xs flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-[#9E4764] shrink-0" aria-hidden="true" />
            <span>Every studio film plays automatically in continuous seamless loops.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 items-stretch">
          {ALICE_VIDEOS.map((film) => (
            <article key={film.chapter} className="group flex flex-col h-full">
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-[#2A1E24] border border-[#2A1E24]/10">
                <MediaFrame
                  type="video"
                  src={film.src}
                  alt={film.alt}
                  autoPlay={true}
                  controls
                  muted
                  loop
                />
              </div>

              <div className="pt-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-xs text-[#9E4764] uppercase tracking-[0.16em]">
                  <span className="tabular-nums">{film.chapter}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#74626A]">{film.category}</span>
                </div>

                <h3 className="font-serif text-xl text-[#2A1E24]">{film.title}</h3>

                <p className="text-xs text-[#74626A] leading-relaxed flex-1">
                  {film.description}
                </p>

                <div className="pt-2 mt-auto">
                  <Link
                    to={film.relatedProductPath}
                    className="inline-flex items-center gap-1.5 text-xs text-[#2A1E24] underline underline-offset-4 decoration-[#C9A96E] hover:text-[#9E4764] transition-colors"
                  >
                    <span>{film.relatedProductLabel}</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
