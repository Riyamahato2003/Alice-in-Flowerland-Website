import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS_META } from '../data/catalogueSeed';
import { useShop } from '../context/ShopContext';
import { MediaFrame } from '../components/MediaFrame';
import { ProductCard } from '../components/ProductCard';

export const CollectionsPage: React.FC = () => {
  const { catalogue } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-20">
      <div className="max-w-2xl space-y-3 pb-10 border-b border-[#2A1E24]/10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
          Editorial Lookbook
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24]">
          Six Signature Floral Collections
        </h1>
        <p className="text-sm sm:text-base text-[#74626A] leading-relaxed">
          From scalloped lace peony bouquets and woven chiffon baskets to bow-printed reveal
          hatboxes and pastel meadow stems—handcrafted in Saigon by Alice in Flowerland.
        </p>
      </div>

      <div className="space-y-24">
        {COLLECTIONS_META.map((col, idx) => {
          const items = catalogue.filter((c) => c.collection === col.slug);
          return (
            <section
              key={col.slug}
              className="pt-8 border-t border-[#2A1E24]/10 first:border-t-0 first:pt-0 space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`lg:col-span-5 space-y-4 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <p className="text-xs text-[#74626A] tabular-nums">
                    0{idx + 1} · {items.length} creations
                  </p>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#2A1E24]">
                    {col.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#74626A] leading-relaxed">
                    {col.editorialIntro}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4 text-xs">
                    <Link
                      to={`/shop?collection=${col.slug}`}
                      className="px-5 py-3 uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
                    >
                      Filter in Shop
                    </Link>
                    <Link
                      to="/videos"
                      className="px-5 py-3 uppercase tracking-widest border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764] hover:text-[#9E4764] transition-colors"
                    >
                      Watch Studio Videos
                    </Link>
                  </div>
                </div>

                <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="aspect-[16/10] overflow-hidden bg-[#F6ECEF] border border-[#2A1E24]/10">
                    <MediaFrame
                      type={col.coverType}
                      src={col.coverSrc}
                      alt={col.title}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 items-stretch">
                {items.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
