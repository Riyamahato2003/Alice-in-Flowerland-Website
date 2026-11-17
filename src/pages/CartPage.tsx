import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { MediaFrame } from '../components/MediaFrame';
import { formatItemPrice, formatVnd } from '../types/shop';

export const CartPage: React.FC = () => {
  const {
    bag,
    bagKnownSubtotal,
    bagHasUnpricedItems,
    catalogue,
    updateBagQuantity,
    removeFromBag,
    clearBag,
  } = useShop();

  const summaryTotal =
    bagKnownSubtotal > 0
      ? `${formatVnd(bagKnownSubtotal)}${bagHasUnpricedItems ? ' + Price on Request' : ''}`
      : 'Price on Request (VND ₫)';

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#2A1E24]/10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">Review Selection</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24] mt-1">
            Your Floral Bag
          </h1>
        </div>
        {bag.length > 0 && (
          <button
            type="button"
            onClick={clearBag}
            className="text-xs text-[#74626A] underline underline-offset-4 hover:text-[#9E4764] self-start sm:self-auto"
          >
            Clear Bag
          </button>
        )}
      </div>

      {bag.length === 0 ? (
        <div className="py-20 text-center space-y-5">
          <p className="font-serif text-2xl text-[#2A1E24]">No floral arrangements in your bag yet</p>
          <p className="text-sm text-[#74626A] max-w-md mx-auto">
            Browse our {catalogue.length} handcrafted bouquets, woven baskets, and bow hatboxes
            composed fresh in Saigon.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/shop"
              className="px-6 py-3.5 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
            >
              Shop All Blooms
            </Link>
            <Link
              to="/delivery"
              className="px-6 py-3.5 text-xs uppercase tracking-widest border border-[#2A1E24]/25 text-[#2A1E24] hover:border-[#9E4764] hover:text-[#9E4764] transition-colors"
            >
              Saigon Delivery &amp; Care
            </Link>
          </div>
        </div>
      ) : (
        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 divide-y divide-[#2A1E24]/10">
            {bag.map((item) => {
              const lineTotal = item.unitTotal !== null ? item.unitTotal * item.quantity : null;
              return (
                <div key={item.id} className="py-6 flex gap-5">
                  <div className="w-24 h-28 shrink-0 bg-[#F6ECEF] border border-[#2A1E24]/10 overflow-hidden">
                    <MediaFrame
                      type={item.imageSrc.endsWith('.mp4') ? 'video' : 'image'}
                      src={item.imageSrc}
                      alt={item.productName}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <Link
                        to={item.isCustomDreamBouquet ? '/collections' : `/product/${item.slug}`}
                        className="font-serif text-xl text-[#2A1E24] hover:text-[#9E4764]"
                      >
                        {item.productName}
                      </Link>
                      <span className="font-serif text-base tabular-nums text-[#9E4764] shrink-0">
                        {formatItemPrice(lineTotal)}
                      </span>
                    </div>

                    <div className="mt-1.5 text-xs text-[#74626A] space-y-0.5">
                      {item.variantLabel && <p>{item.variantLabel}</p>}
                      {item.colourChoice && <p>Palette: {item.colourChoice}</p>}
                      {item.wrappingStyle && <p>Wrapping: {item.wrappingStyle}</p>}
                      <p>Occasion: {item.occasion}</p>
                      {item.pearlOrRibbonAccent && (
                        <p className="text-[#9E4764]">
                          Pearl Strands &amp; Oversized Satin Bow included
                        </p>
                      )}
                      {item.personalisedMessage && (
                        <p className="text-[#9E4764]">
                          Keepsake Card: {item.personalisedMessageText || 'Requested'}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="italic">Notes: {item.specialInstructions}</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#2A1E24]/20">
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-10 h-10 inline-flex items-center justify-center hover:bg-[#F6ECEF]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-sm tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-10 h-10 inline-flex items-center justify-center hover:bg-[#F6ECEF]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromBag(item.id)}
                        className="text-xs text-[#74626A] hover:text-[#9E4764] inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4">
            <div className="p-6 bg-[#F6ECEF] border border-[#2A1E24]/10 space-y-5">
              <h2 className="font-serif text-2xl text-[#2A1E24]">Inquiry Summary</h2>
              <div className="flex items-baseline justify-between pt-2 border-t border-[#2A1E24]/10 gap-3">
                <span className="text-sm text-[#74626A]">Estimated Total</span>
                <span className="font-serif text-xl text-[#2A1E24] tabular-nums text-right">
                  {summaryTotal}
                </span>
              </div>
              <p className="text-xs text-[#74626A] leading-relaxed">
                Final VND (₫) quotations, stem substitutions, and Saigon district delivery fees are
                confirmed personally by Alice upon request review.
              </p>
              <Link
                to="/checkout"
                className="block w-full py-4 text-center text-xs uppercase tracking-[0.18em] bg-[#9E4764] text-[#FCF9FA] hover:bg-[#2A1E24] transition-colors"
              >
                Proceed to Order Inquiry
              </Link>
              <Link
                to="/shop"
                className="block w-full py-3 text-center text-xs uppercase tracking-[0.18em] border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764] transition-colors"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
