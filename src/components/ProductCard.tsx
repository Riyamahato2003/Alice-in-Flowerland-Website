import React from 'react';
import { Link } from 'react-router-dom';
import { formatItemPrice, type CatalogueItem } from '../types/shop';
import { MediaFrame } from './MediaFrame';

interface ProductCardProps {
  item: CatalogueItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const primaryMedia = item.media[0];
  const secondaryImg = item.media.find(
    (m) => m.type === 'image' && m.src !== primaryMedia?.src
  );
  const displayPrice = formatItemPrice(item.basePrice, item.priceDisplay);

  return (
    <article className="group flex flex-col h-full">
      <Link
        to={`/product/${item.slug}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-[#F6ECEF] border border-[#2A1E24]/8 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9E4764]"
      >
        <div className="w-full h-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]">
          <MediaFrame
            type={primaryMedia?.type}
            src={primaryMedia?.src || ''}
            alt={primaryMedia?.alt || item.name}
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
        {!item.inStock && (
          <div className="absolute inset-0 bg-[#2A1E24]/55 flex items-center justify-center p-4">
            <span className="text-xs uppercase tracking-widest text-[#FCF9FA] border border-[#FCF9FA]/40 px-3 py-1.5 bg-[#2A1E24]/80">
              Seasonal Pause
            </span>
          </div>
        )}
      </Link>

      <div className="pt-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-center gap-2 text-xs text-[#74626A]">
          <span className="truncate">{item.collectionTitle}</span>
          <span aria-hidden="true">·</span>
          <span>{item.basePrice ? 'Atelier Confirmed' : 'Price on Request'}</span>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <Link
            to={`/product/${item.slug}`}
            className="font-serif text-lg text-[#2A1E24] group-hover:text-[#9E4764] transition-colors"
          >
            {item.name}
          </Link>
          <span className="text-[13px] font-medium text-[#2A1E24] tabular-nums whitespace-nowrap shrink-0">
            {displayPrice}
          </span>
        </div>

        <p className="text-xs text-[#74626A] line-clamp-2 leading-relaxed">
          {item.leadTimeNote}
        </p>

        <div className="pt-2 mt-auto flex items-center gap-4 text-xs">
          <Link
            to={`/product/${item.slug}`}
            className="text-[#2A1E24] underline underline-offset-4 decoration-[#C9A96E] hover:text-[#9E4764] transition-colors"
          >
            View Details
          </Link>
          <span aria-hidden="true" className="text-[#74626A]/40">
            /
          </span>
          <Link
            to="/delivery"
            className="text-[#74626A] hover:text-[#9E4764] transition-colors"
          >
            Delivery Info
          </Link>
        </div>
      </div>
    </article>
  );
};
