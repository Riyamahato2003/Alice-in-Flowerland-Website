import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Minus, Plus, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { MediaFrame } from '../components/MediaFrame';
import { formatItemPrice, type OccasionName } from '../types/shop';

const ALL_OCCASIONS: OccasionName[] = [
  'Romance & Anniversary',
  'Birthdays',
  'Weddings & Bridal',
  'Graduations',
  'Mother’s Day & Gratitude',
  'Housewarming',
  'Bespoke Milestones',
];

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { catalogue, addToBag } = useShop();
  const product = catalogue.find((p) => p.slug === slug);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [selectedWrapping, setSelectedWrapping] = useState('');
  const [occasion, setOccasion] = useState<OccasionName>('Romance & Anniversary');
  const [personalisedMessage, setPersonalisedMessage] = useState(false);
  const [personalisedMessageText, setPersonalisedMessageText] = useState('');
  const [pearlOrRibbonAccent, setPearlOrRibbonAccent] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!product) return;
    setActiveMediaIdx(0);
    setSelectedVariantId(product.variants[0]?.id || '');
    setSelectedColour(product.colourOptions[0] || '');
    setSelectedWrapping(product.wrappingOptions[0] || '');
    setOccasion(product.occasions[0] || 'Romance & Anniversary');
    setPersonalisedMessage(false);
    setPersonalisedMessageText('');
    setPearlOrRibbonAccent(false);
    setSpecialInstructions('');
    setQuantity(1);
    setJustAdded(false);
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-5">
        <h1 className="font-serif text-4xl text-[#2A1E24]">Floral Creation Not Found</h1>
        <p className="text-sm text-[#74626A]">
          We couldn&apos;t locate that arrangement in our Saigon boutique catalogue.
        </p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA]"
        >
          Return to Shop All
        </Link>
      </div>
    );
  }

  const activeMedia = product.media[activeMediaIdx] || product.media[0];
  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];
  const baseUnitPrice =
    activeVariant && typeof activeVariant.price === 'number'
      ? activeVariant.price
      : product.basePrice;
  const displayUnitPrice = formatItemPrice(baseUnitPrice, product.priceDisplay);
  const displayTotalPrice =
    baseUnitPrice !== null
      ? formatItemPrice(baseUnitPrice * quantity, product.priceDisplay)
      : product.priceDisplay;

  const handleAddToBag = () => {
    if (!product.inStock) return;
    const pendingFlags: string[] = [];
    if (baseUnitPrice === null) {
      pendingFlags.push('Price on Request — personal VND (₫) quotation upon inquiry');
    }

    addToBag({
      id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      imageSrc: product.media[0]?.src || '',
      variantId: activeVariant?.id,
      variantLabel: activeVariant?.label,
      colourChoice: selectedColour || undefined,
      wrappingStyle: selectedWrapping || undefined,
      occasion,
      personalisedMessage,
      personalisedMessageText: personalisedMessage ? personalisedMessageText.trim() : '',
      pearlOrRibbonAccent,
      specialInstructions: specialInstructions.trim(),
      quantity,
      baseUnitPrice,
      unitTotal: baseUnitPrice,
      pendingQuoteFlags: pendingFlags,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-16">
      <div className="mb-8">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#74626A] hover:text-[#9E4764] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shop All</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Sticky Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="aspect-[4/5] w-full overflow-hidden bg-[#F6ECEF] border border-[#2A1E24]/10">
            <MediaFrame
              type={activeMedia?.type}
              src={activeMedia?.src || ''}
              alt={activeMedia?.alt || product.name}
              controls={activeMedia?.type === 'video'}
              muted
              loop
            />
          </div>

          {activeMedia && (
            <div className="flex items-center justify-between gap-4 text-xs text-[#74626A]">
              <span>{activeMedia.caption}</span>
              <span className="shrink-0">Alice in Flowerland Original</span>
            </div>
          )}

          {product.media.length > 1 && (
            <div className="grid grid-cols-4 gap-3 pt-2">
              {product.media.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMediaIdx(idx)}
                  className={`aspect-square overflow-hidden border transition-all ${
                    idx === activeMediaIdx
                      ? 'border-[#9E4764] ring-1 ring-[#9E4764]'
                      : 'border-[#2A1E24]/15 opacity-75 hover:opacity-100'
                  }`}
                >
                  <MediaFrame type={m.type} src={m.src} alt={m.alt} autoPlay={false} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Purchase / Floral Inquiry Module */}
        <div className="lg:col-span-5 space-y-7">
          <div className="space-y-3 pb-6 border-b border-[#2A1E24]/10">
            <div className="flex items-center gap-2 text-xs text-[#74626A]">
              <span>{product.collectionTitle}</span>
              <span aria-hidden="true">·</span>
              <span>{product.inStock ? 'Available in Saigon' : 'Seasonal Pause'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#2A1E24]">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl text-[#9E4764] tabular-nums">
                {displayUnitPrice}
              </span>
              {baseUnitPrice === null && (
                <span className="text-xs text-[#74626A]">
                  Custom quoted in VND (₫) by stem season
                </span>
              )}
            </div>
            <p className="text-sm text-[#74626A] leading-relaxed pt-1">
              {product.description}
            </p>
          </div>

          {/* Scale / Edition Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs uppercase tracking-widest text-[#2A1E24]">
                Scale &amp; Presentation
              </label>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-3 text-left text-sm border flex items-center justify-between transition-colors ${
                      selectedVariantId === v.id
                        ? 'border-[#9E4764] bg-[#F6ECEF] text-[#2A1E24]'
                        : 'border-[#2A1E24]/15 text-[#74626A] hover:border-[#2A1E24]/40'
                    }`}
                  >
                    <span>{v.label}</span>
                    <span className="tabular-nums font-medium text-[#2A1E24] text-xs">
                      {formatItemPrice(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colour Palette Selector */}
          {product.colourOptions.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs uppercase tracking-widest text-[#2A1E24]">
                Floral Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.colourOptions.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColour(col)}
                    className={`px-3 py-2.5 text-xs border text-center transition-colors min-h-[40px] ${
                      selectedColour === col
                        ? 'border-[#9E4764] bg-[#2A1E24] text-[#FCF9FA]'
                        : 'border-[#2A1E24]/15 text-[#2A1E24] hover:border-[#9E4764]'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wrapping Style Selector */}
          {product.wrappingOptions.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor="pdp-wrapping"
                className="block text-xs uppercase tracking-widest text-[#2A1E24]"
              >
                Wrapping &amp; Ribbon Finish
              </label>
              <select
                id="pdp-wrapping"
                value={selectedWrapping}
                onChange={(e) => setSelectedWrapping(e.target.value)}
                className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
              >
                {product.wrappingOptions.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Occasion Selector */}
          <div className="space-y-2">
            <label
              htmlFor="pdp-occasion"
              className="block text-xs uppercase tracking-widest text-[#2A1E24]"
            >
              Occasion
            </label>
            <select
              id="pdp-occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as OccasionName)}
              className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
            >
              {ALL_OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Personalisation & Finishing Details */}
          <div className="space-y-3 pt-2 border-t border-[#2A1E24]/10">
            <p className="text-xs uppercase tracking-widest text-[#2A1E24]">
              Personalisation &amp; Finishing
            </p>

            <div className="p-4 border border-[#2A1E24]/15 space-y-3">
              <label className="flex items-center gap-3 text-sm text-[#2A1E24] cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalisedMessage}
                  onChange={(e) => setPersonalisedMessage(e.target.checked)}
                  className="accent-[#9E4764] w-4 h-4"
                />
                <span>Include Complimentary Alice Message Card</span>
              </label>
              {personalisedMessage && (
                <input
                  type="text"
                  maxLength={160}
                  value={personalisedMessageText}
                  onChange={(e) => setPersonalisedMessageText(e.target.value)}
                  placeholder="Write your heartfelt love note or greeting..."
                  className="w-full px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-xs text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
                />
              )}
            </div>

            <label className="flex items-start gap-3 p-4 bg-[#EDE7F3]/55 border border-[#2A1E24]/12 cursor-pointer">
              <input
                type="checkbox"
                checked={pearlOrRibbonAccent}
                onChange={(e) => setPearlOrRibbonAccent(e.target.checked)}
                className="mt-0.5 accent-[#9E4764] w-4 h-4"
              />
              <div className="text-xs space-y-1">
                <span className="font-medium text-[#2A1E24] block">
                  Extra Pearl Strands &amp; Oversized Satin Bow Styling
                </span>
                <span className="text-[#74626A] block">
                  Add hand-strung pearl accents or signature oversized chiffon tails.
                </span>
              </div>
            </label>

            <div className="space-y-1.5">
              <label htmlFor="pdp-special" className="block text-xs text-[#74626A]">
                Special Instructions or Target VND Budget (optional)
              </label>
              <input
                id="pdp-special"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. More lilac sweet peas, or budget guide ~2.200.000 ₫"
                className="w-full px-3.5 py-2.5 bg-[#F6ECEF] border border-[#2A1E24]/15 text-xs text-[#2A1E24] focus:outline-none focus:border-[#9E4764]"
              />
            </div>
          </div>

          {/* Quantity + Primary CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-stretch gap-3">
              <div className="inline-flex items-center border border-[#2A1E24]/20 bg-[#FCF9FA]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-12 inline-flex items-center justify-center hover:bg-[#F6ECEF]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm tabular-nums font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  aria-label="Increase quantity"
                  className="w-11 h-12 inline-flex items-center justify-center hover:bg-[#F6ECEF]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToBag}
                className="flex-1 px-6 py-3.5 text-xs uppercase tracking-[0.18em] bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] disabled:bg-[#74626A]/40 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Floral Bag</span>
                  </>
                ) : product.inStock ? (
                  <span>Add to Bag · {displayTotalPrice}</span>
                ) : (
                  <span>Seasonal Pause</span>
                )}
              </button>
            </div>

            <Link
              to="/delivery"
              className="w-full py-3.5 text-center text-xs uppercase tracking-[0.18em] border border-[#2A1E24]/25 text-[#2A1E24] hover:border-[#9E4764] hover:text-[#9E4764] transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Saigon Delivery &amp; Stem Care Guide</span>
            </Link>
          </div>

          {/* Craft Notes */}
          <div className="pt-6 border-t border-[#2A1E24]/10 space-y-2.5 text-xs text-[#74626A]">
            <p className="uppercase tracking-widest text-[#2A1E24]">Atelier Craft &amp; Care</p>
            <ul className="space-y-1.5 list-disc pl-4">
              {product.craftDetails.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
              <li>Fresh stems hydrated and hand-wrapped in Saigon, Ho Chi Minh City</li>
              <li>Saigon district delivery fees &amp; VND quote confirmed prior to payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
