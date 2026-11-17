import React from 'react';
import { Link } from 'react-router-dom';
import { MediaFrame } from '../components/MediaFrame';
import { MagneticButton } from '../components/MagneticButton';
import ribbonAtelierImg from '../assets/images/alice_ribbon_atelier_bg_1794911385077.jpg';
import worktableImg from '../assets/images/alice_floral_worktable_bg_1794911385274.jpg';

export const StoryPage: React.FC = () => {
  return (
    <div className="bg-[#FCF9FA] text-[#2A1E24]">
      {/* Editorial Header */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
              Our Saigon Atelier
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl leading-[1.06] text-[#2A1E24]">
              A dreamy flower land where every petal tells a love story.
            </h1>
            <p className="text-base text-[#74626A] leading-relaxed">
              Rooted in Ho Chi Minh City, Alice in Flowerland (@aliceflower.sg) marries the breezy
              grace of a Parisian floral studio with dreamy Korean floral styling—layering fresh
              peonies, ranunculus, lilac clematis, and cloud hydrangeas inside scalloped lace,
              billowing chiffon ribbons, and bespoke hatboxes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#74626A]">
              <span>Saigon / Ho Chi Minh City, Vietnam</span>
              <span aria-hidden="true">·</span>
              <span>Fresh Cut Blooms · Hand-Wrapped Daily</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden bg-[#F6ECEF] border border-[#2A1E24]/10">
              <MediaFrame
                type="image"
                src="/assets/aistudio/image_55bf7547.png"
                alt="Alice in Flowerland scalloped Chantilly lace collar bouquet with pearl drops and pastel pink ribbons"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="border-t border-[#2A1E24]/10 py-16 lg:py-24 bg-[#F6ECEF]/65">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <p className="text-xs text-[#9E4764] tabular-nums">01.</p>
            <h2 className="font-serif text-2xl text-[#2A1E24]">Curated Morning Stems</h2>
            <p className="text-sm text-[#74626A] leading-relaxed">
              From blush O&apos;Hara garden roses and ruffled tulips to fragile violet sweet peas
              and icy blue delphiniums, each stem is selected for petal delicacy and movement.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-[#9E4764] tabular-nums">02.</p>
            <h2 className="font-serif text-2xl text-[#2A1E24]">Couture Wrapping &amp; Ribbons</h2>
            <p className="text-sm text-[#74626A] leading-relaxed">
              Wrapping is treated like dressmaking: embroidered Chantilly lace cuffs, crisp matte
              origami envelopes, custom bow-patterned cube hatboxes, and pleated organza collars.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-[#9E4764] tabular-nums">03.</p>
            <h2 className="font-serif text-2xl text-[#2A1E24]">Keepsake Details</h2>
            <p className="text-sm text-[#74626A] leading-relaxed">
              Micro-pearl strands, engraved gold heart charms, miniature Polaroid memories, and
              heart-clipped stationery turn fresh bouquets into enduring keepsakes.
            </p>
          </div>
        </div>
      </section>

      {/* Studio Process Visuals */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="aspect-[4/3] overflow-hidden border border-[#2A1E24]/10">
              <MediaFrame
                type="image"
                src={ribbonAtelierImg}
                alt="Pale blush silk satin spools, chiffon ribbon, pearled floral pins, and brass shears on cream travertine"
              />
            </div>
            <div className="aspect-[4/3] overflow-hidden border border-[#2A1E24]/10">
              <MediaFrame
                type="image"
                src={worktableImg}
                alt="Sunlit Saigon floral worktable with sheer curtains and frosted glass vases"
              />
            </div>
          </div>
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-serif text-3xl text-[#2A1E24]">
              Designed in motion, composed for your moment
            </h2>
            <p className="text-sm text-[#74626A] leading-relaxed">
              Whether you are sending romantic anniversary blooms across Saigon, commissioning a
              bridal lace bouquet, or selecting a pearl-ribbon hatbox for a milestone celebration,
              every inquiry is personally reviewed and quoted in VND (₫).
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <MagneticButton
                to="/delivery"
                className="px-6 py-3.5 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
              >
                Saigon Delivery &amp; Care
              </MagneticButton>
              <Link
                to="/shop"
                className="px-6 py-3.5 text-xs uppercase tracking-widest border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764] transition-colors inline-flex items-center"
              >
                Explore All Blooms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
