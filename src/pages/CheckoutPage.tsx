import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  formatItemPrice,
  formatVnd,
  type FulfilmentMethod,
  type OrderRequest,
} from '../types/shop';

interface LocationPrefill {
  prefill?: {
    fulfilmentMethod?: FulfilmentMethod;
    deliveryArea?: string;
    preferredDate?: string;
    recipientName?: string;
    giftNote?: string;
  };
}

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}

export const CheckoutPage: React.FC = () => {
  const {
    bag,
    bagKnownSubtotal,
    bagHasUnpricedItems,
    availability,
    clearBag,
    refreshAvailability,
  } = useShop();
  const location = useLocation();
  const prefill = (location.state as LocationPrefill | null)?.prefill;

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [recipientName, setRecipientName] = useState(prefill?.recipientName || '');
  const [giftNote, setGiftNote] = useState(prefill?.giftNote || '');
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>(
    prefill?.fulfilmentMethod || 'saigon_courier'
  );
  const [deliveryArea, setDeliveryArea] = useState(prefill?.deliveryArea || '');
  const [preferredDate, setPreferredDate] = useState(prefill?.preferredDate || defaultDate());

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<OrderRequest | null>(null);

  const isDateBlocked = availability.blockedDates.includes(preferredDate);
  const isDateFull =
    (availability.dateCounts[preferredDate] || 0) >= availability.maxOrdersPerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (bag.length === 0) {
      setErrorMsg('Your floral bag is empty.');
      return;
    }
    if (isDateBlocked || isDateFull) {
      setErrorMsg('That preferred date is unavailable in our Saigon calendar. Please choose another date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: bag,
          fulfilmentMethod,
          preferredDate,
          deliveryArea,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            instagramHandle,
          },
          recipient: {
            name: recipientName,
            giftNote,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit floral inquiry.');
      }
      setSubmittedOrder(data.order);
      clearBag();
      refreshAvailability();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedOrder) {
    const orderSubtotalText =
      submittedOrder.knownSubtotalVnd > 0
        ? `${formatVnd(submittedOrder.knownSubtotalVnd)}${
            submittedOrder.hasUnpricedItems ? ' + Price on Request' : ''
          }`
        : 'Price on Request (VND ₫)';

    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14 lg:py-20">
        <div className="p-8 sm:p-10 bg-[#F6ECEF] border border-[#2A1E24]/15 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#9E4764] shrink-0 mt-1" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9E4764]">
                Floral Inquiry Logged
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#2A1E24] mt-1">
                Request {submittedOrder.referenceCode} Received
              </h1>
            </div>
          </div>

          <p className="text-sm text-[#74626A] leading-relaxed">
            Thank you, {submittedOrder.customer.name}. Your floral arrangement selection has been
            saved for Alice&apos;s personal review in Saigon.{' '}
            <strong className="font-medium text-[#2A1E24]">
              No online payment has been charged
            </strong>{' '}
            — we confirm exact stem availability, VND (₫) quotation, and delivery window before any
            payment.
          </p>

          <div className="p-5 bg-[#FCF9FA] border border-[#2A1E24]/10 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#74626A]">Status</span>
              <span className="font-medium text-[#9E4764]">{submittedOrder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#74626A]">Preferred Date</span>
              <span className="tabular-nums">{submittedOrder.preferredDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#74626A]">Fulfilment</span>
              <span>
                {submittedOrder.fulfilmentMethod === 'saigon_courier'
                  ? `Saigon Courier (${submittedOrder.deliveryArea})`
                  : 'Saigon Boutique Pickup'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#2A1E24]/10 gap-3">
              <span className="text-[#74626A]">Quotation Summary</span>
              <span className="font-serif text-lg tabular-nums text-right">
                {orderSubtotalText}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#74626A]">
            <p className="uppercase tracking-widest text-[#2A1E24]">
              Selected Blooms &amp; Notes
            </p>
            {submittedOrder.items.map((item) => (
              <p key={item.id}>
                · {item.quantity} × {item.productName}
                {item.variantLabel ? ` (${item.variantLabel})` : ''} —{' '}
                {formatItemPrice(
                  item.unitTotal !== null ? item.unitTotal * item.quantity : null
                )}
              </p>
            ))}
            {submittedOrder.pendingConfirmationNotes.map((n, idx) => (
              <p key={idx} className="text-[#9E4764]">
                · {n}
              </p>
            ))}
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="px-6 py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
            >
              Return to Catalogue
            </Link>
            <Link
              to="/admin"
              className="px-6 py-3 text-xs uppercase tracking-widest border border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764]"
            >
              Review in Boutique Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sidebarTotalText =
    bagKnownSubtotal > 0
      ? `${formatVnd(bagKnownSubtotal)}${bagHasUnpricedItems ? ' + Price on Request' : ''}`
      : 'Price on Request (VND ₫)';

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <div className="max-w-2xl space-y-3 pb-8 border-b border-[#2A1E24]/10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
          Saigon Floral Request &amp; Consultation
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24]">
          Send Your Floral Inquiry
        </h1>
        <p className="text-sm text-[#74626A] leading-relaxed">
          Share your chosen arrangements, preferred Saigon delivery date, recipient note, and
          colour wishes. No online card payment is taken—Alice confirms final VND (₫) pricing and
          delivery coordination directly.
        </p>
      </div>

      {bag.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <p className="font-serif text-2xl text-[#2A1E24]">Your floral bag is empty</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/shop"
              className="inline-block px-6 py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA]"
            >
              Browse Blooms
            </Link>
            <Link
              to="/delivery"
              className="inline-block px-6 py-3 text-xs uppercase tracking-widest border border-[#2A1E24]/25 text-[#2A1E24]"
            >
              Delivery &amp; Care Info
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Contact */}
            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-[#2A1E24]">1. Your Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="chk-name" className="block text-xs text-[#74626A]">
                    Full Name *
                  </label>
                  <input
                    id="chk-name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="chk-email" className="block text-xs text-[#74626A]">
                    Email Address *
                  </label>
                  <input
                    id="chk-email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="chk-phone" className="block text-xs text-[#74626A]">
                    Phone / WhatsApp / Zalo *
                  </label>
                  <input
                    id="chk-phone"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+84 9X XXX XXXX"
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="chk-ig" className="block text-xs text-[#74626A]">
                    Instagram Handle (optional)
                  </label>
                  <input
                    id="chk-ig"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
              </div>
            </section>

            {/* Fulfilment & Date */}
            <section className="space-y-4 pt-6 border-t border-[#2A1E24]/10">
              <h2 className="font-serif text-2xl text-[#2A1E24]">
                2. Saigon Delivery or Boutique Pickup
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfilmentMethod('saigon_courier')}
                  className={`p-4 text-left border transition-colors ${
                    fulfilmentMethod === 'saigon_courier'
                      ? 'border-[#9E4764] bg-[#2A1E24] text-[#FCF9FA]'
                      : 'border-[#2A1E24]/15 bg-[#F6ECEF]'
                  }`}
                >
                  <p className="font-serif text-lg">Saigon / HCMC Courier</p>
                  <p className="text-xs opacity-75 mt-1">
                    Upright doorstep delivery across Ho Chi Minh City districts.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setFulfilmentMethod('pickup')}
                  className={`p-4 text-left border transition-colors ${
                    fulfilmentMethod === 'pickup'
                      ? 'border-[#9E4764] bg-[#2A1E24] text-[#FCF9FA]'
                      : 'border-[#2A1E24]/15 bg-[#F6ECEF]'
                  }`}
                >
                  <p className="font-serif text-lg">Saigon Boutique Pickup</p>
                  <p className="text-xs opacity-75 mt-1">
                    Collect directly by appointment from our Saigon studio.
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="chk-date" className="block text-xs text-[#74626A]">
                    Preferred Date *
                  </label>
                  <input
                    id="chk-date"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                  {(isDateBlocked || isDateFull) && (
                    <p className="text-xs text-[#9E4764]">
                      This date is unavailable in the Saigon studio calendar.
                    </p>
                  )}
                </div>

                {fulfilmentMethod === 'saigon_courier' && (
                  <div className="space-y-1.5">
                    <label htmlFor="chk-area" className="block text-xs text-[#74626A]">
                      Saigon / HCMC District &amp; Area *
                    </label>
                    <input
                      id="chk-area"
                      required
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      placeholder="e.g. District 1, Thao Dien D2, District 7"
                      className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Recipient & Gift Note */}
            <section className="space-y-4 pt-6 border-t border-[#2A1E24]/10">
              <h2 className="font-serif text-2xl text-[#2A1E24]">
                3. Recipient &amp; Card Wording
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="chk-recipient" className="block text-xs text-[#74626A]">
                    Recipient Name
                  </label>
                  <input
                    id="chk-recipient"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Leave blank if receiving personally"
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="chk-note" className="block text-xs text-[#74626A]">
                    Gift Note, Preferred Ribbon Tone &amp; Delivery Time Window
                  </label>
                  <textarea
                    id="chk-note"
                    rows={3}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F6ECEF] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Inquiry Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="p-6 bg-[#F6ECEF] border border-[#2A1E24]/15 space-y-5">
              <h2 className="font-serif text-2xl text-[#2A1E24]">Inquiry Summary</h2>

              <div className="divide-y divide-[#2A1E24]/10">
                {bag.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium text-[#2A1E24]">
                        {item.quantity} × {item.productName}
                      </p>
                      <p className="text-xs text-[#74626A]">
                        {item.variantLabel}
                        {item.colourChoice ? ` · ${item.colourChoice}` : ''}
                        {item.wrappingStyle ? ` · ${item.wrappingStyle}` : ''}
                        {item.pearlOrRibbonAccent ? ' · Pearl & Satin Accent' : ''}
                      </p>
                    </div>
                    <span className="tabular-nums font-medium shrink-0 text-xs text-[#9E4764]">
                      {formatItemPrice(
                        item.unitTotal !== null ? item.unitTotal * item.quantity : null
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#2A1E24]/10 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#74626A]">Estimated Total</span>
                  <span className="font-serif text-lg tabular-nums text-[#2A1E24] text-right">
                    {sidebarTotalText}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#74626A]">
                  <span>VND (₫) Quote &amp; Delivery Fee</span>
                  <span className="text-[#9E4764]">Confirmed Upon Review</span>
                </div>
              </div>

              <div className="p-4 bg-[#FCF9FA] border border-[#C9A96E]/50 text-xs text-[#74626A] space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-[#2A1E24]">
                  <Lock className="w-3.5 h-3.5 text-[#9E4764]" />
                  <span>Personal Inquiry Mode (No Card Charged)</span>
                </div>
                <p className="leading-relaxed">
                  Submitting logs your floral request in Alice&apos;s boutique dashboard. Exact
                  seasonal VND pricing and Saigon delivery windows are shared prior to confirmation.
                </p>
              </div>

              {errorMsg && (
                <p className="p-3 bg-[#9E4764]/10 border border-[#9E4764] text-xs text-[#9E4764]">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || isDateBlocked || isDateFull}
                className="w-full py-4 text-xs uppercase tracking-[0.18em] bg-[#9E4764] text-[#FCF9FA] hover:bg-[#2A1E24] disabled:opacity-45 transition-colors min-h-[48px]"
              >
                {submitting ? 'Submitting Inquiry...' : 'Submit Floral Inquiry'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
