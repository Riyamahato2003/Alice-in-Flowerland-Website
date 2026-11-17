import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, MapPin, Truck } from 'lucide-react';

export const DeliveryPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 lg:py-16 space-y-14">
      <div className="max-w-2xl space-y-3 pb-8 border-b border-[#2A1E24]/10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
          Saigon Delivery &amp; Stem Care
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24]">
          Delivery &amp; Care
        </h1>
        <p className="text-sm sm:text-base text-[#74626A] leading-relaxed">
          All Alice in Flowerland bouquets, woven baskets, and hatboxes are composed fresh to order
          in Ho Chi Minh City—available for private Saigon studio pickup or upright hand-delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-[#F6ECEF] border border-[#2A1E24]/10 space-y-4">
          <MapPin className="w-5 h-5 text-[#9E4764]" aria-hidden="true" />
          <h2 className="font-serif text-2xl text-[#2A1E24]">Saigon Boutique Pickup</h2>
          <p className="text-sm text-[#74626A] leading-relaxed">
            Scheduled pickup appointments are coordinated from our Saigon atelier so your bouquet
            is chilled and hydrated until you arrive. Exact location pin and collection times are
            shared upon inquiry confirmation.
          </p>
        </div>

        <div className="p-8 bg-[#F6ECEF] border border-[#2A1E24]/10 space-y-4">
          <Truck className="w-5 h-5 text-[#9E4764]" aria-hidden="true" />
          <h2 className="font-serif text-2xl text-[#2A1E24]">Ho Chi Minh City Courier</h2>
          <p className="text-sm text-[#74626A] leading-relaxed">
            Dedicated upright courier transport across District 1, District 3, Thao Dien (District
            2), Binh Thanh, Phu Nhuan, District 7, and neighbouring areas. Delivery fees in VND (₫)
            are confirmed based on distance upon inquiry review.
          </p>
        </div>
      </div>

      <div className="p-8 border border-[#2A1E24]/12 space-y-5 bg-[#FCF9FA]">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-[#9E4764]" aria-hidden="true" />
          <h2 className="font-serif text-2xl text-[#2A1E24]">
            Fresh-Cut Bouquet &amp; Basket Care Guide
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#74626A] leading-relaxed">
          <div className="space-y-2">
            <p className="font-medium text-[#2A1E24]">For Hand-Tied Wrapped Bouquets</p>
            <p>
              Keep out of direct Saigon noon heat and strong AC drafts. When ready to place in a
              vase, unwrap only if preferred, trim stems 1–2 cm on a 45° angle every two days, and
              refresh cool clean water.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-[#2A1E24]">For Flower Baskets &amp; Hatboxes</p>
            <p>
              Our baskets and luxury hatboxes are arranged in hydrated floral foam—simply trickle
              a small cup of cool water slowly into the centre of the foam base every 1–2 days to
              keep petals luminous.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          to="/shop"
          className="px-6 py-3.5 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
        >
          Explore All Blooms
        </Link>
        <Link
          to="/contact"
          className="px-6 py-3.5 text-xs uppercase tracking-widest border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764]"
        >
          Ask a Delivery Question
        </Link>
      </div>
    </div>
  );
};
