import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS_META } from '../data/catalogueSeed';
import { MediaFrame } from '../components/MediaFrame';
import { useShop } from '../context/ShopContext';
import { formatItemPrice } from '../types/shop';
import ribbonAtelierImg from '../assets/images/alice_ribbon_atelier_bg_1794911385077.jpg';

const FEATURED_SLUGS = [
  'with-love-ranunculus-basket',
  'lace-ohara-peony-bouquet',
  'ribbon-bow-pink-tulip-hatbox',
  'pastel-mesh-clematis-tulip',
];

const STUDIO_MOSAIC: {
  title: string;
  src: string;
  alt: string;
  to: string;
}[] = [
  {
    title: '“With Love” Blush Ranunculus Basket',
    src: '/assets/aistudio/image_74e67b15.png',
    alt: 'Alice in Flowerland white wicker basket overflowing with blush ranunculus and chiffon bow',
    to: '/product/with-love-ranunculus-basket',
  },
  {
    title: 'Scalloped Lace Pink Peony Bouquet',
    src: '/assets/aistudio/image_1e6ce9f1.png',
    alt: 'Alice in Flowerland blush peony bouquet wrapped in scalloped embroidered lace',
    to: '/product/lace-ohara-peony-bouquet',
  },
  {
    title: 'Signature Bow-Print Hatbox',
    src: '/assets/aistudio/image_1f406f3f.png',
    alt: 'Alice in Flowerland bow-patterned keepsake cube box opening to peony and hydrangea hatbox',
    to: '/product/ribbon-bow-pink-tulip-hatbox',
  },
  {
    title: 'Ethereal Mesh Lilac & Tulip',
    src: '/assets/aistudio/image_ce1193b1.png',
    alt: 'Alice in Flowerland sheer organza bouquet with lavender sweet peas and icy blue tulips',
    to: '/product/pastel-mesh-clematis-tulip',
  },
  {
    title: 'Chantilly Lace & Pearl Cascade',
    src: '/assets/aistudio/image_830e7232.png',
    alt: 'Alice in Flowerland bridal bouquet with pearl strands, pink bows, and scalloped lace collar',
    to: '/product/chantilly-lace-pearl-cascade',
  },
  {
    title: 'Origami Wrap & Polaroid Gift',
    src: '/assets/aistudio/image_d0dacb29.png',
    alt: 'Alice in Flowerland folded origami white floral gift envelope with Polaroid portrait pin',
    to: '/product/origami-envelope-polaroid-box',
  },
  {
    title: 'Fluffy Bunny & Pastel Peony Basket',
    src: '/assets/aistudio/image_118a0118.png',
    alt: 'Alice in Flowerland pastel peony basket paired with cream plush bunny and foil hearts',
    to: '/product/bunny-hydrangea-peony-basket',
  },
  {
    title: 'Grand Ruffled Statement Bouquet',
    src: '/assets/aistudio/image_a2d950a8.png',
    alt: 'Alice in Flowerland oversized pastel pink rose bouquet with sculptural ruffles and pink bow',
    to: '/product/grand-ruffle-bow-statement',
  },
  {
    title: 'Acrylic Couture Trunk & Dahlias',
    src: '/assets/aistudio/image_92864f8e.png',
    alt: 'Alice in Flowerland crystal-clear acrylic trunk filled with pink dahlias, white orchids, feather, and pearls',
    to: '/product/acrylic-trunk-dahlia-couture',
  },
  {
    title: 'Alice Emblem Pearl Hatbox',
    src: '/assets/aistudio/image_c7a12365.png',
    alt: 'Alice in Flowerland white cylinder hatbox with pink ranunculus, lilac tulips, pearl chains, and Alice ribbon',
    to: '/product/alice-logo-pearl-hatbox',
  },
  {
    title: 'Plush Bunny & Phalaenopsis Box',
    src: '/assets/aistudio/image_72688ede.png',
    alt: 'Alice in Flowerland pink plush bunny nestled beside white moth orchids and blush ranunculus',
    to: '/product/pink-bunny-orchid-hatbox',
  },
  {
    title: 'Ruffled Double Lily Bouquet',
    src: '/assets/aistudio/image_fd20cfcf.png',
    alt: 'Alice in Flowerland cream double-petal lilies with pearl pin and pink butterfly silk wrap',
    to: '/product/ruffled-double-lily-bouquet',
  },
];

export const HomePage: React.FC = () => {
  const { catalogue } = useShop();
  const navigate = useNavigate();

  const [occasionNote, setOccasionNote] = useState('');
  const [scrollY, setScrollY] = useState(0);

  const pageRef = useRef<HTMLDivElement>(null);

  // Gentle scroll parallax for hero backdrop & copy
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(Math.min(window.scrollY, 900));
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Soft IntersectionObserver reveal matching cubic-bezier(0.22, 0.61, 0.36, 1)
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('.soft-reveal'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((el) => {
        el.dataset.visible = 'true';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [catalogue.length]);

  const featuredProducts = useMemo(() => {
    const picked = FEATURED_SLUGS.map((slug) => catalogue.find((c) => c.slug === slug)).filter(
      (item): item is NonNullable<typeof item> => Boolean(item)
    );
    if (picked.length === 4) return picked;
    return catalogue.slice(0, 4);
  }, [catalogue]);

  const handleOccasionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = occasionNote.trim();
    if (cleaned) {
      navigate(`/contact?occasion=${encodeURIComponent(cleaned)}`);
    } else {
      navigate('/contact');
    }
  };

  return (
    <div ref={pageRef} className="bg-[#FCF9FA] text-[#2A1E24] pb-20">
      <style>{`
        .soft-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 1s cubic-bezier(0.22, 0.61, 0.36, 1),
            transform 1s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .soft-reveal[data-visible="true"] {
          opacity: 1;
          transform: none;
        }
        @keyframes aliceHeroRise {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes aliceHeroFade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .hero-rise {
          opacity: 0;
          animation: aliceHeroRise 1.05s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .hero-fade {
          opacity: 0;
          animation: aliceHeroFade 1.3s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .soft-reveal, .hero-rise, .hero-fade {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* 0. FULL-BLEED EDITORIAL HERO (OPENS DIRECTLY WITH ZERO INTRO OVERLAY) */}
      <section className="relative h-[88vh] min-h-[580px] w-full overflow-hidden bg-[#F6ECEF]">
        <div
          className="absolute inset-0 will-change-transform hero-fade"
          style={{
            transform: `translate3d(0, ${scrollY * 0.14}px, 0) scale(1.06)`,
          }}
        >
          <MediaFrame
            type="image"
            src="/assets/aistudio/image_1309a6ad.png"
            alt="Alice in Flowerland plush blush bunny tucked beside pink ranunculus, white sweet peas, silk ribbon bow, and heart-clipped stationery card"
            imgClassName="h-full w-full object-cover object-center"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FCF9FA]/55 via-[#FCF9FA]/25 to-[#FCF9FA]/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FCF9FA]/80 via-[#FCF9FA]/30 to-transparent" />
        </div>

        <div
          className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-14 sm:px-8 sm:pb-24"
          style={{
            transform: `translate3d(0, ${scrollY * 0.05}px, 0)`,
          }}
        >
          <p
            className="hero-rise text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#9E4764]"
            style={{ animationDelay: '120ms' }}
          >
            Saigon, Vietnam · @aliceflower.sg
          </p>

          <h1
            className="hero-rise mt-5 max-w-4xl font-serif text-[2.9rem] leading-[1.02] tracking-tight text-[#2A1E24] sm:text-6xl lg:text-[5.25rem]"
            style={{ animationDelay: '280ms' }}
          >
            Every Flower
            <br className="hidden sm:block" />{' '}
            <span className="italic font-normal text-[#9E4764]">Tells a Love Story.</span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-md text-sm leading-relaxed text-[#2A1E24]/80"
            style={{ animationDelay: '460ms' }}
          >
            Thoughtfully arranged blooms for life&apos;s most beautiful moments, handcrafted in
            Saigon.
          </p>

          <div
            className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: '640ms' }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-[#2A1E24] px-9 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#FCF9FA] transition-colors duration-300 hover:bg-[#9E4764] whitespace-nowrap"
              >
                Explore the collection
              </Link>
              <Link
                to="/delivery"
                className="inline-flex items-center justify-center border border-[#2A1E24]/30 bg-[#FCF9FA]/55 backdrop-blur-sm px-9 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2A1E24] transition-colors duration-300 hover:border-[#9E4764] hover:text-[#9E4764] whitespace-nowrap"
              >
                Saigon Delivery &amp; Care
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0 text-xs text-[#74626A]">
              <span>Parisian Floral Atelier</span>
              <span aria-hidden="true">·</span>
              <span>Ho Chi Minh City Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1. FEATURED CREATIONS (4-COLUMN EDITORIAL STRIP) */}
      <section className="mx-auto max-w-7xl px-5 pt-28 sm:px-8 sm:pt-36">
        <div
          data-visible="false"
          style={{ transitionDelay: '0ms' }}
          className="soft-reveal flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#74626A]">
              Featured Blooms
            </p>
            <h2 className="mt-4 max-w-xl font-serif text-4xl leading-[1.06] text-[#2A1E24] sm:text-5xl">
              Romantic petals, satin bows &amp; pearl details.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#74626A]">
            Blush O&apos;Hara peonies, ranunculus chiffon baskets, bow-tied reveal boxes, and pale
            lavender sweet peas composed fresh daily in Saigon.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-8 items-stretch">
          {featuredProducts.map((item, idx) => {
            const primaryImg =
              item.media.find((m) => m.type === 'image') || item.media[0];
            const secondaryImg = item.media.find(
              (m) => m.type === 'image' && m.src !== primaryImg?.src
            );

            return (
              <article
                key={item.id}
                data-visible="false"
                style={{ transitionDelay: `${idx * 90}ms` }}
                className="soft-reveal group flex flex-col h-full"
              >
                <Link
                  to={`/product/${item.slug}`}
                  className="relative aspect-[4/5] w-full overflow-hidden bg-[#F6ECEF] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E4764]"
                >
                  <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105">
                    <MediaFrame
                      type={primaryImg?.type}
                      src={primaryImg?.src || ''}
                      alt={primaryImg?.alt || item.name}
                    />
                  </div>
                  {secondaryImg && (
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100">
                      <MediaFrame
                        type="image"
                        src={secondaryImg.src}
                        alt={secondaryImg.alt}
                      />
                    </div>
                  )}
                </Link>

                <div className="mt-4 flex flex-col flex-1 gap-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#74626A]">
                    {item.collectionTitle}
                  </p>
                  <div className="flex items-baseline justify-between gap-2">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-serif text-lg sm:text-xl text-[#2A1E24] transition-colors group-hover:text-[#9E4764]"
                    >
                      {item.name}
                    </Link>
                    <span className="text-xs sm:text-sm text-[#2A1E24] tabular-nums whitespace-nowrap shrink-0">
                      {formatItemPrice(item.basePrice, item.priceDisplay)}
                    </span>
                  </div>
                  <p className="text-xs text-[#74626A] line-clamp-1">{item.leadTimeNote}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div
          data-visible="false"
          style={{ transitionDelay: '0ms' }}
          className="soft-reveal mt-14 flex justify-center"
        >
          <Link
            to="/shop"
            className="border-b border-[#C9A96E] pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2A1E24] transition-colors hover:text-[#9E4764]"
          >
            View all {catalogue.length} floral creations
          </Link>
        </div>
      </section>

      {/* 2. THE ATELIER EDITORIAL SPLIT */}
      <section className="mx-auto mt-28 max-w-7xl px-5 sm:mt-40 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div
            data-visible="false"
            style={{ transitionDelay: '0ms' }}
            className="soft-reveal lg:col-span-7"
          >
            <div className="aspect-[5/4] w-full overflow-hidden bg-[#F6ECEF] group">
              <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105">
                <MediaFrame
                  type="image"
                  src="/assets/aistudio/image_0e76e398.png"
                  alt="Alice in Flowerland morning light study of scalloped pink lace wrap and silk satin ribbon bow around blush peonies"
                />
              </div>
            </div>
          </div>

          <div
            data-visible="false"
            style={{ transitionDelay: '140ms' }}
            className="soft-reveal lg:col-span-5 lg:pl-4"
          >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#74626A]">
              The Saigon Atelier
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-[#2A1E24] sm:text-[3.35rem]">
              Parisian delicacy
              <br />
              <span className="italic font-normal text-[#9E4764]">meets Korean romance.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-[1.85] text-[#74626A]">
              From scalloped floral embroidery collars and billowing Korean organza wraps to
              hand-strung pearl lilies and custom keepsake cards, every bouquet by Alice in
              Flowerland turns an ordinary afternoon in Ho Chi Minh City into a quiet heirloom.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-8">
              <Link
                to="/story"
                className="group inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2A1E24] hover:text-[#9E4764] transition-colors"
              >
                <span>Discover our story</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
              </Link>
              <Link
                to="/delivery"
                className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#74626A] hover:text-[#2A1E24] transition-colors"
              >
                Saigon Delivery &amp; Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIX COLLECTIONS (EQUAL-HEIGHT EDITORIAL OVERLAY CARDS) */}
      <section className="mx-auto mt-32 max-w-7xl px-5 sm:mt-44 sm:px-8">
        <div
          data-visible="false"
          style={{ transitionDelay: '0ms' }}
          className="soft-reveal flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#74626A]">
              Floral Worlds
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#2A1E24] sm:text-5xl">
              Six dreamy collections to explore.
            </h2>
          </div>
          <Link
            to="/collections"
            className="border-b border-[#C9A96E] pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#2A1E24] transition-colors hover:text-[#9E4764] whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            View all collections
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {COLLECTIONS_META.map((col, idx) => (
            <div
              key={col.slug}
              data-visible="false"
              style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
              className="soft-reveal h-full"
            >
              <Link
                to={`/shop?collection=${col.slug}`}
                className="group relative block h-full overflow-hidden bg-[#F6ECEF]"
              >
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105">
                    <MediaFrame type="image" src={col.coverSrc} alt={col.title} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1E24]/75 via-[#2A1E24]/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:-translate-y-1">
                  <div>
                    <h3 className="font-serif text-2xl text-[#FCF9FA] sm:text-3xl">{col.title}</h3>
                    <p className="mt-1 max-w-xs text-xs text-[#FCF9FA]/85 line-clamp-1">
                      {col.subtitle}
                    </p>
                  </div>
                  <ArrowRight className="mb-1 h-4 w-4 shrink-0 text-[#FCF9FA] transition-transform duration-500 group-hover:translate-x-1.5" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BESPOKE RIBBON ATELIER & SAIGON DELIVERY BAND */}
      <section className="mt-32 bg-[#F6ECEF] py-24 sm:mt-44 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20">
          <div
            data-visible="false"
            style={{ transitionDelay: '0ms' }}
            className="soft-reveal lg:col-span-6"
          >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#9E4764]">
              Hand-Tied &amp; Delivered Upright
            </p>
            <h2 className="mt-5 font-serif text-[2.6rem] leading-[1.05] text-[#2A1E24] sm:text-[3.85rem]">
              Wrapped in silk.
              <br />
              <span className="italic font-normal text-[#9E4764]">
                Tailored to your love note.
              </span>
            </h2>
            <p className="mt-8 max-w-md text-sm leading-[1.9] text-[#74626A]">
              Every chiffon ribbon bow, pearl strand, and handwritten stationery card is finished
              to order in Ho Chi Minh City—available for private studio pickup or upright hand
              delivery across Saigon districts.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                to="/delivery"
                className="inline-flex items-center justify-center bg-[#2A1E24] px-8 py-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#FCF9FA] transition-colors duration-300 hover:bg-[#9E4764]"
              >
                Saigon Delivery &amp; Care
              </Link>
              <span className="text-xs text-[#74626A]">
                Price on Request · Same-Day Inquiries Available
              </span>
            </div>
          </div>

          <div
            data-visible="false"
            style={{ transitionDelay: '140ms' }}
            className="soft-reveal lg:col-span-6"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#FCF9FA] group">
              <div className="h-full w-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105">
                <MediaFrame
                  type="image"
                  src={ribbonAtelierImg}
                  alt="Pale blush silk satin spools, chiffon ribbon, pearled floral pins, and brass shears on cream travertine"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FROM OUR SAIGON STUDIO (@aliceflower.sg 12-TILE MOSAIC) */}
      <section className="mx-auto mt-28 max-w-7xl px-5 sm:mt-40 sm:px-8">
        <div
          data-visible="false"
          style={{ transitionDelay: '0ms' }}
          className="soft-reveal text-center"
        >
          <a
            href="https://www.instagram.com/aliceflower.sg/"
            target="_blank"
            rel="noreferrer"
            className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-[#74626A] hover:text-[#9E4764] transition-colors"
          >
            @aliceflower.sg
          </a>
          <h2 className="mt-4 font-serif text-4xl text-[#2A1E24] sm:text-5xl">
            From our Saigon flower land
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {STUDIO_MOSAIC.map((tile, idx) => (
            <Link
              key={`${tile.src}-${idx}`}
              to={tile.to}
              data-visible="false"
              style={{ transitionDelay: `${(idx % 4) * 70}ms` }}
              className="soft-reveal group relative block overflow-hidden bg-[#F6ECEF]"
            >
              <div className="aspect-square w-full overflow-hidden">
                <MediaFrame
                  type="image"
                  src={tile.src}
                  alt={tile.alt}
                  imgClassName="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2A1E24]/45 p-4 text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="font-serif text-base sm:text-lg text-[#FCF9FA]">
                  {tile.title}
                </span>
                <span className="mt-2 text-[0.6rem] uppercase tracking-[0.2em] text-[#FCF9FA]/85">
                  View bloom →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. BESPOKE OCCASION INVITATION BAR */}
      <section className="mx-auto mt-24 max-w-3xl px-5 pb-4 text-center sm:mt-36 sm:px-8">
        <div
          data-visible="false"
          style={{ transitionDelay: '0ms' }}
          className="soft-reveal"
        >
          <h2 className="font-serif text-4xl text-[#2A1E24] sm:text-[3.4rem]">
            Flowers for your milestone, gifted.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[#74626A]">
            Share an occasion, dreamy palette, or date in Saigon to begin planning your bespoke
            bouquet or flower basket with Alice.
          </p>

          <form
            onSubmit={handleOccasionSubmit}
            className="mx-auto mt-9 flex max-w-md items-center border-b border-[#2A1E24]/25"
          >
            <input
              type="text"
              value={occasionNote}
              onChange={(e) => setOccasionNote(e.target.value)}
              placeholder="Anniversary blush roses, bridal bouquet, birthday hatbox..."
              aria-label="Occasion or bespoke bouquet idea"
              className="w-full bg-transparent py-3 text-sm text-[#2A1E24] placeholder:text-[#2A1E24]/40 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 py-3 pl-4 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#2A1E24] transition-colors hover:text-[#9E4764] whitespace-nowrap"
            >
              Send inquiry
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
