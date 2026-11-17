import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { MediaFrame } from './MediaFrame';
import { formatItemPrice, formatVnd } from '../types/shop';

export const CartDrawer: React.FC = () => {
  const {
    bag,
    bagCount,
    bagKnownSubtotal,
    bagHasUnpricedItems,
    isBagOpen,
    setIsBagOpen,
    updateBagQuantity,
    removeFromBag,
  } = useShop();

  if (!isBagOpen) return null;

  const subtotalText =
    bagKnownSubtotal > 0
      ? `${formatVnd(bagKnownSubtotal)}${bagHasUnpricedItems ? ' + Price on Request items' : ''}`
      : 'Price on Request (VND ₫)';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#2A1E24]/45 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Floral Inquiry Bag"
    >
      <div
        className="absolute inset-0"
        onClick={() => setIsBagOpen(false)}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-full max-w-md bg-[#FCF9FA] text-[#2A1E24] h-full flex flex-col border-l border-[#2A1E24]/12 shadow-2xl">
        <div className="px-6 py-5 border-b border-[#2A1E24]/10 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#2A1E24]">Your Floral Bag</h2>
            <p className="text-xs text-[#74626A] mt-0.5 tabular-nums">
              {bagCount} {bagCount === 1 ? 'arrangement' : 'arrangements'} selected
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBagOpen(false)}
            aria-label="Close floral bag"
            className="w-11 h-11 inline-flex items-center justify-center text-[#2A1E24] hover:text-[#9E4764] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {bag.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <p className="font-serif text-xl text-[#2A1E24]">Your floral bag is empty</p>
              <p className="text-sm text-[#74626A] max-w-xs mx-auto leading-relaxed">
                Explore our signature fresh-flower bouquets, chiffon-bow baskets, and bow hatboxes
                handcrafted daily in Saigon.
              </p>
              <div className="pt-2 flex flex-col gap-3 max-w-xs mx-auto">
                <Link
                  to="/shop"
                  onClick={() => setIsBagOpen(false)}
                  className="px-5 py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors text-center"
                >
                  Explore Catalogue
                </Link>
                <Link
                  to="/delivery"
                  onClick={() => setIsBagOpen(false)}
                  className="px-5 py-3 text-xs uppercase tracking-widest border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764] hover:text-[#9E4764] transition-colors text-center"
                >
                  Saigon Delivery &amp; Care
                </Link>
              </div>
            </div>
          ) : (
            bag.map((item) => {
              const lineTotal =
                item.unitTotal !== null ? item.unitTotal * item.quantity : null;
              return (
                <div
                  key={item.id}
                  className="flex gap-4 pb-6 border-b border-[#2A1E24]/10 last:border-b-0"
                >
                  <div className="w-20 h-24 shrink-0 bg-[#F6ECEF] overflow-hidden border border-[#2A1E24]/10">
                    <MediaFrame
                      type={item.imageSrc.endsWith('.mp4') ? 'video' : 'image'}
                      src={item.imageSrc}
                      alt={item.productName}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={item.isCustomDreamBouquet ? '/collections' : `/product/${item.slug}`}
                        onClick={() => setIsBagOpen(false)}
                        className="font-serif text-base text-[#2A1E24] hover:text-[#9E4764] transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <span className="text-xs font-medium tabular-nums shrink-0 text-[#9E4764]">
                        {formatItemPrice(lineTotal)}
                      </span>
                    </div>

                    <div className="mt-1 text-xs text-[#74626A] space-y-0.5">
                      {item.variantLabel && <p>{item.variantLabel}</p>}
                      {item.colourChoice && <p>Palette: {item.colourChoice}</p>}
                      {item.wrappingStyle && <p>Wrapping: {item.wrappingStyle}</p>}
                      <p>Occasion: {item.occasion}</p>
                      {item.pearlOrRibbonAccent && (
                        <p className="text-[#9E4764]">
                          + Pearl Strands &amp; Oversized Satin Bow
                        </p>
                      )}
                      {item.personalisedMessage && (
                        <p className="text-[#9E4764]">
                          + Keepsake Card
                          {item.personalisedMessageText
                            ? `: “${item.personalisedMessageText}”`
                            : ''}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="line-clamp-2 italic">Note: {item.specialInstructions}</p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#2A1E24]/20">
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 inline-flex items-center justify-center hover:bg-[#F6ECEF] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs tabular-nums font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-9 h-9 inline-flex items-center justify-center hover:bg-[#F6ECEF] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromBag(item.id)}
                        aria-label={`Remove ${item.productName}`}
                        className="text-xs text-[#74626A] hover:text-[#9E4764] inline-flex items-center gap-1 py-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {bag.length > 0 && (
          <div className="p-6 bg-[#F6ECEF] border-t border-[#2A1E24]/10 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-[#74626A]">Estimated Total</span>
                <span className="font-serif text-xl text-[#2A1E24] tabular-nums text-right">
                  {subtotalText}
                </span>
              </div>
              <p className="text-xs text-[#74626A] leading-relaxed">
                Final VND (₫) quotations and Saigon delivery fees are confirmed personally once your
                floral inquiry is reviewed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={() => setIsBagOpen(false)}
                className="px-4 py-3 text-xs uppercase tracking-widest border border-[#2A1E24]/25 text-[#2A1E24] hover:border-[#9E4764] hover:text-[#9E4764] transition-colors text-center"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsBagOpen(false)}
                className="px-4 py-3 text-xs uppercase tracking-widest bg-[#9E4764] text-[#FCF9FA] hover:bg-[#2A1E24] transition-colors text-center"
              >
                Send Inquiry
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
