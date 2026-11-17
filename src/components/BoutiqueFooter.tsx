import React from 'react';
import { Link } from 'react-router-dom';

export const BoutiqueFooter: React.FC = () => {
  return (
    <footer className="bg-[#2A1E24] text-[#FCF9FA] border-t border-[#C9A96E]/25">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#FCF9FA]/12">
          <div className="md:col-span-5 space-y-4">
            <p className="font-serif text-3xl tracking-tight text-[#FCF9FA]">
              Alice in Flowerland
            </p>
            <p className="text-sm text-[#FCF9FA]/75 max-w-sm leading-relaxed">
              A dreamy Saigon fresh-flower atelier pairing Parisian floral architecture with
              Korean couture wrapping—handcrafted bouquets, woven baskets, bow hatboxes, and pearl
              creations.
            </p>
            <div className="pt-2 text-xs text-[#C9A96E] space-y-1">
              <p>Saigon / Ho Chi Minh City, Vietnam · @aliceflower.sg</p>
              <p>Same-District Saigon Courier &amp; Private Boutique Pickup Available</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-sans text-xs tracking-widest uppercase text-[#C9A96E]">
              Boutique
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FCF9FA]/80">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-white transition-colors">
                  Delivery
                </Link>
              </li>
              <li>
                <Link to="/videos" className="hover:text-white transition-colors">
                  Atelier Videos
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-sans text-xs tracking-widest uppercase text-[#C9A96E]">
              Service &amp; Care
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FCF9FA]/80">
              <li>
                <Link to="/story" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-white transition-colors">
                  Delivery &amp; Care
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition-colors">
                  Floral Inquiry &amp; Request
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-sans text-xs tracking-widest uppercase text-[#C9A96E]">
              Connect
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FCF9FA]/80">
              <li>
                <a
                  href="https://www.instagram.com/aliceflower.sg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram @aliceflower.sg
                </a>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Floral Bag
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-[#FCF9FA]/55">
                  Atelier Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#FCF9FA]/55">
          <p>© {new Date().getFullYear()} Alice in Flowerland · Ho Chi Minh City, Vietnam</p>
          <p>
            Price on Request · Bespoke VND (₫) quotations &amp; Saigon delivery confirmed prior to payment
          </p>
        </div>
      </div>
    </footer>
  );
};
