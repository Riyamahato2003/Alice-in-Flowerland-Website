import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  FloralBoutique3DPreview,
  type ArrangementForm,
} from '../components/FloralBoutique3DPreview';
import { MediaFrame } from '../components/MediaFrame';
import type { OccasionName } from '../types/shop';

const ARRANGEMENT_FORMS: {
  id: ArrangementForm;
  label: string;
  subtitle: string;
  defaultWrapping: string;
}[] = [
  {
    id: 'bouquet',
    label: 'Signature Hand-Tied Bouquet',
    subtitle: 'Architectural cone wrap, French mesh & silk ribbon bow',
    defaultWrapping: 'Scalloped Embroidered Lace & Satin Bow',
  },
  {
    id: 'basket',
    label: 'Romantic Flower Basket',
    subtitle: 'Woven wicker basket with wide chiffon sash & charm',
    defaultWrapping: 'White Wicker Basket & Chiffon Ribbon Sash',
  },
  {
    id: 'hatbox',
    label: 'Luxury Bow-Print Hatbox',
    subtitle: 'Structured cylinder box inside bow-tied outer reveal box',
    defaultWrapping: 'Custom Alice Bow-Print Reveal Hatbox',
  },
  {
    id: 'lace-sculpt',
    label: 'Bespoke Pearl & Lace Sculpture',
    subtitle: 'Drape of Chantilly lace, beaded lilies & couture pearls',
    defaultWrapping: 'Chantilly Lace Collar & Cascading Pearl Drops',
  },
];

const PALETTES = [
  'Blush & Pearl',
  'Lavender & Lilac',
  'Cream Ivory & Champagne',
  'Pastel Rainbow Dreams',
];

const WRAPPING_STYLES = [
  'Scalloped Embroidered Lace & Satin Bow',
  'Sheer Pearl Organza Mesh Halo',
  'Custom Alice Bow-Print Reveal Hatbox',
  'White Wicker Basket & Chiffon Ribbon Sash',
  'Architectural Origami Fold & Polaroid Clip',
];

const OCCASIONS: OccasionName[] = [
  'Romance & Anniversary',
  'Birthdays',
  'Weddings & Bridal',
  'Graduations',
  'Mother’s Day & Gratitude',
  'Housewarming',
  'Bespoke Milestones',
];

function inferFormFromSlug(collection?: string): ArrangementForm {
  if (collection === 'romantic-flower-baskets') return 'basket';
  if (collection === 'luxury-floral-boxes') return 'hatbox';
  if (collection === 'bespoke-floral-creations') return 'lace-sculpt';
  return 'bouquet';
}

export const CreateDreamBouquetPage: React.FC = () => {
  const { catalogue, addToBag } = useShop();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialProductSlug = searchParams.get('product') || '';
  const initialOccasionParam = searchParams.get('occasion') || '';

  const [inspirationSlug, setInspirationSlug] = useState(initialProductSlug);
  const [form, setForm] = useState<ArrangementForm>('bouquet');
  const [palette, setPalette] = useState(PALETTES[0]);
  const [wrappingStyle, setWrappingStyle] = useState(WRAPPING_STYLES[0]);
  const [occasion, setOccasion] = useState<OccasionName>('Romance & Anniversary');
  const [pearlOrRibbonAccent, setPearlOrRibbonAccent] = useState(true);
  const [personalisedMessage, setPersonalisedMessage] = useState(true);
  const [personalisedMessageText, setPersonalisedMessageText] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addedToBag, setAddedToBag] = useState(false);

  const selectedInspiration = useMemo(
    () => catalogue.find((c) => c.slug === inspirationSlug) || null,
    [catalogue, inspirationSlug]
  );

  useEffect(() => {
    if (selectedInspiration) {
      setForm(inferFormFromSlug(selectedInspiration.collection));
      if (selectedInspiration.wrappingOptions[0]) {
        setWrappingStyle(selectedInspiration.wrappingOptions[0]);
      }
      if (selectedInspiration.occasions[0]) {
        setOccasion(selectedInspiration.occasions[0]);
      }
    }
  }, [selectedInspiration]);

  useEffect(() => {
    if (!initialOccasionParam) return;
    const lower = initialOccasionParam.toLowerCase();
    if (lower.includes('wedd') || lower.includes('brid')) setOccasion('Weddings & Bridal');
    else if (lower.includes('birth')) setOccasion('Birthdays');
    else if (lower.includes('grad')) setOccasion('Graduations');
    else if (lower.includes('mother') || lower.includes('thank'))
      setOccasion('Mother’s Day & Gratitude');
    else if (lower.includes('house') || lower.includes('home')) setOccasion('Housewarming');
    else if (lower.includes('romanc') || lower.includes('anniv') || lower.includes('love'))
      setOccasion('Romance & Anniversary');
    else {
      setSpecialInstructions((prev) =>
        prev ? prev : `Occasion inspiration: ${initialOccasionParam}`
      );
    }
  }, [initialOccasionParam]);

  const handleFormSelect = (nextForm: ArrangementForm) => {
    setForm(nextForm);
    const meta = ARRANGEMENT_FORMS.find((f) => f.id === nextForm);
    if (meta) setWrappingStyle(meta.defaultWrapping);
  };

  const buildCustomBagItem = () => {
    const formMeta = ARRANGEMENT_FORMS.find((f) => f.id === form);
    const baseName = selectedInspiration
      ? `Bespoke Edition — ${selectedInspiration.name}`
      : `Dream ${formMeta?.label || 'Bouquet'}`;
    const previewImg =
      selectedInspiration?.media.find((m) => m.type === 'image')?.src ||
      '/assets/aistudio/image_74e67b15.png';

    return {
      id: `dream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: selectedInspiration?.id || 'custom-dream-bouquet',
      slug: selectedInspiration?.slug || 'create-your-bouquet',
      productName: baseName,
      imageSrc: previewImg,
      variantId: form,
      variantLabel: formMeta?.label,
      colourChoice: palette,
      wrappingStyle,
      occasion,
      personalisedMessage,
      personalisedMessageText: personalisedMessage ? personalisedMessageText.trim() : '',
      pearlOrRibbonAccent,
      specialInstructions: [
        preferredDate ? `Preferred Date: ${preferredDate}` : '',
        deliveryArea ? `Saigon District: ${deliveryArea}` : '',
        specialInstructions.trim(),
      ]
        .filter(Boolean)
        .join(' · '),
      quantity: 1,
      baseUnitPrice: null,
      unitTotal: null,
      isCustomDreamBouquet: true,
      pendingQuoteFlags: [
        'Bespoke Dream Bouquet — personal VND (₫) quotation confirmed after floral review',
      ],
    };
  };

  const handleAddToBag = (openDrawer = true) => {
    addToBag(buildCustomBagItem(), openDrawer);
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2200);
  };

  const handleDirectProceed = () => {
    addToBag(buildCustomBagItem(), false);
    navigate('/checkout', {
      state: {
        prefill: {
          fulfilmentMethod: deliveryArea ? 'saigon_courier' : 'pickup',
          deliveryArea,
          preferredDate,
          giftNote: specialInstructions || personalisedMessageText,
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#74626A] hover:text-[#9E4764] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Floral Catalogue</span>
        </Link>
        <span className="text-xs text-[#74626A]">
          Price on Request · Bespoke VND (₫) Quote After Selection
        </span>
      </div>

      <div className="max-w-2xl space-y-3 pb-10 border-b border-[#2A1E24]/10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
          Saigon Couture Studio
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24]">
          Create Your Dream Bouquet
        </h1>
        <p className="text-sm sm:text-base text-[#74626A] leading-relaxed">
          Design a personalized arrangement inspired by Alice in Flowerland&apos;s signature
          bouquets, woven chiffon baskets, ribbon hatboxes, and pearl lace wraps. Rotate your 3D
          silhouette live before sending an inquiry.
        </p>
      </div>

      <div className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Sticky 3D Preview + Optional Inspiration Snapshot */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-5">
          <FloralBoutique3DPreview
            form={form}
            palette={palette}
            wrappingStyle={wrappingStyle}
            pearlOrRibbonAccent={pearlOrRibbonAccent}
          />

          {selectedInspiration && (
            <div className="p-4 bg-[#F6ECEF] border border-[#2A1E24]/10 flex items-center gap-4">
              <div className="w-16 h-20 shrink-0 overflow-hidden bg-[#FCF9FA] border border-[#2A1E24]/10">
                <MediaFrame
                  type={selectedInspiration.media[0]?.type}
                  src={selectedInspiration.media[0]?.src || ''}
                  alt={selectedInspiration.name}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#9E4764]">
                  Inspired By Original Creation
                </p>
                <p className="font-serif text-base text-[#2A1E24] truncate">
                  {selectedInspiration.name}
                </p>
                <button
                  type="button"
                  onClick={() => setInspirationSlug('')}
                  className="text-xs text-[#74626A] underline underline-offset-4 hover:text-[#9E4764]"
                >
                  Clear reference piece
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Customisation Form Steps */}
        <div className="lg:col-span-6 space-y-8">
          {/* Step 1: Silhouette Form */}
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-[#2A1E24]">1. Arrangement Silhouette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARRANGEMENT_FORMS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleFormSelect(opt.id)}
                  className={`p-4 text-left border transition-colors ${
                    form === opt.id
                      ? 'border-[#9E4764] bg-[#2A1E24] text-[#FCF9FA]'
                      : 'border-[#2A1E24]/15 bg-[#F6ECEF]/60 text-[#2A1E24] hover:border-[#9E4764]'
                  }`}
                >
                  <p className="font-serif text-base">{opt.label}</p>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{opt.subtitle}</p>
                </button>
              ))}
            </div>

            <div className="pt-2 space-y-1.5">
              <label htmlFor="dream-inspiration" className="block text-xs text-[#74626A]">
                Optional Inspiration from Atelier Catalogue
              </label>
              <select
                id="dream-inspiration"
                value={inspirationSlug}
                onChange={(e) => setInspirationSlug(e.target.value)}
                className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
              >
                <option value="">Start fresh with bespoke studio styling</option>
                {catalogue.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.collectionTitle})
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Step 2: Colour Palette */}
          <section className="space-y-3 pt-6 border-t border-[#2A1E24]/10">
            <h2 className="font-serif text-2xl text-[#2A1E24]">2. Colour Palette</h2>
            <div className="grid grid-cols-2 gap-3">
              {PALETTES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  className={`px-4 py-3 text-xs uppercase tracking-widest border text-center transition-colors min-h-[44px] ${
                    palette === p
                      ? 'border-[#9E4764] bg-[#9E4764] text-[#FCF9FA]'
                      : 'border-[#2A1E24]/15 bg-[#FCF9FA] text-[#2A1E24] hover:border-[#9E4764]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Couture Wrapping & Embellishments */}
          <section className="space-y-4 pt-6 border-t border-[#2A1E24]/10">
            <h2 className="font-serif text-2xl text-[#2A1E24]">
              3. Wrapping Style &amp; Couture Accents
            </h2>
            <div className="space-y-1.5">
              <label htmlFor="dream-wrapping" className="block text-xs text-[#74626A]">
                Signature Wrapping Finish
              </label>
              <select
                id="dream-wrapping"
                value={wrappingStyle}
                onChange={(e) => setWrappingStyle(e.target.value)}
                className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
              >
                {WRAPPING_STYLES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-3 p-4 bg-[#EDE7F3]/60 border border-[#2A1E24]/12 cursor-pointer">
              <input
                type="checkbox"
                checked={pearlOrRibbonAccent}
                onChange={(e) => setPearlOrRibbonAccent(e.target.checked)}
                className="mt-0.5 accent-[#9E4764] w-4 h-4"
              />
              <div className="text-xs space-y-1">
                <span className="font-medium text-[#2A1E24] block">
                  Add Draping Pearls, Micro-Bows &amp; Gold Heart Charm
                </span>
                <span className="text-[#74626A] block">
                  Signature Alice pearl beads threaded onto blooms plus satin ribbon tails.
                </span>
              </div>
            </label>
          </section>

          {/* Step 4: Occasion & Personalised Message */}
          <section className="space-y-4 pt-6 border-t border-[#2A1E24]/10">
            <h2 className="font-serif text-2xl text-[#2A1E24]">
              4. Occasion &amp; Keepsake Message Card
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dream-occasion" className="block text-xs text-[#74626A]">
                  Occasion
                </label>
                <select
                  id="dream-occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionName)}
                  className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dream-date" className="block text-xs text-[#74626A]">
                  Preferred Saigon Date
                </label>
                <input
                  id="dream-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                />
              </div>
            </div>

            <div className="p-4 border border-[#2A1E24]/15 space-y-3">
              <label className="flex items-center gap-3 text-sm text-[#2A1E24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalisedMessage}
                  onChange={(e) => setPersonalisedMessage(e.target.checked)}
                  className="accent-[#9E4764] w-4 h-4"
                />
                <span>Include Alice in Flowerland Keepsake Message Card</span>
              </label>
              {personalisedMessage && (
                <input
                  type="text"
                  maxLength={160}
                  value={personalisedMessageText}
                  onChange={(e) => setPersonalisedMessageText(e.target.value)}
                  placeholder="Write your love note or congratulatory message..."
                  className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-xs text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="dream-district" className="block text-xs text-[#74626A]">
                  Saigon Delivery District (optional)
                </label>
                <input
                  id="dream-district"
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  placeholder="e.g. District 1, Thao Dien D2, District 3"
                  className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="dream-notes" className="block text-xs text-[#74626A]">
                  Preferred Flowers or Budget Guide (VND)
                </label>
                <input
                  id="dream-notes"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Peonies + sweet peas, ~2.000.000 ₫"
                  className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAddToBag(true)}
                className="px-6 py-4 text-xs uppercase tracking-[0.18em] bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                {addedToBag ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Floral Bag</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Add to Floral Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectProceed}
                className="px-6 py-4 text-xs uppercase tracking-[0.18em] bg-[#9E4764] text-[#FCF9FA] hover:bg-[#2A1E24] transition-colors min-h-[48px]"
              >
                Submit Inquiry Directly
              </button>
            </div>
            <p className="text-xs text-[#74626A] text-center">
              All bespoke bouquets are Price on Request — final VND (₫) quote &amp; stem
              availability confirmed personally by Alice in Saigon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
