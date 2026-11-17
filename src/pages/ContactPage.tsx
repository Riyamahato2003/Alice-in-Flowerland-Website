import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

const FAQS = [
  {
    q: 'Why do floral pieces display “Price on Request”?',
    a: 'Fresh luxury stems—such as imported peonies, ranunculus, lilac clematis, sweet peas, and blue delphiniums—shift in seasonal availability and stem count. Submitting your selection creates an obligation-free inquiry so Alice can prepare an exact quotation in Vietnamese Dong (VND / ₫).',
  },
  {
    q: 'How far in advance should I book a bespoke bouquet or bridal basket?',
    a: 'For signature styles and daily Saigon bouquets, 24–48 hours notice allows the freshest selection. For bespoke bridal cascades, oversized showstopper bouquets, or custom bow-printed gift boxes, we recommend inquiring 3–7 days ahead.',
  },
  {
    q: 'Do you deliver across Ho Chi Minh City (Saigon)?',
    a: 'Yes! We arrange dedicated upright courier delivery across District 1, District 3, Thao Dien / District 2, Binh Thanh, Phu Nhuan, District 7, and greater HCMC, as well as private studio pickup by appointment.',
  },
  {
    q: 'Can I request a custom colour palette, Polaroid snapshot, or love note?',
    a: 'Yes. Every bouquet can include a complimentary heartfelt gift card with your custom wording, optional draping pearls or ribbon styles, and even printed Polaroid keepsakes inside our origami envelope wraps.',
  },
  {
    q: 'Is online payment taken on this website?',
    a: 'No card charge happens online. Your inquiry is saved in our boutique log so we can confirm stem availability, wrapping details, and final VND pricing (including delivery) directly with you.',
  },
];

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialOccasion = searchParams.get('occasion') || 'Romance & Anniversary';

  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [occasion, setOccasion] = useState(initialOccasion);
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          instagramHandle,
          occasion,
          preferredDate,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send enquiry');
      setSubmitted(true);
      setName('');
      setEmail('');
      setInstagramHandle('');
      setPreferredDate('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <div className="max-w-2xl space-y-3 pb-10 border-b border-[#2A1E24]/10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
          Saigon Atelier Concierge
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#2A1E24]">
          Contact &amp; Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-[#74626A] leading-relaxed">
          Planning a romantic surprise, bridal bouquet, or bespoke floral gift in Saigon? Send a
          note below or connect on Instagram at{' '}
          <a
            href="https://www.instagram.com/aliceflower.sg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#9E4764] underline underline-offset-4"
          >
            @aliceflower.sg
          </a>
          .
        </p>
      </div>

      <div className="pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* FAQ Accordion */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="font-serif text-2xl text-[#2A1E24] mb-4">
            Common Questions
          </h2>
          <div className="divide-y divide-[#2A1E24]/10 border-y border-[#2A1E24]/10">
            {FAQS.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-serif text-lg text-[#2A1E24]">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#9E4764] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pt-3 text-sm text-[#74626A] leading-relaxed">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Enquiry Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 bg-[#F6ECEF] border border-[#2A1E24]/10">
          <h2 className="font-serif text-2xl text-[#2A1E24] mb-2">
            Send a Floral Enquiry
          </h2>
          <p className="text-xs text-[#74626A] mb-6">
            Enquiries go straight to the Alice in Flowerland studio desk for a tailored VND quote.
          </p>

          {submitted ? (
            <div className="p-6 bg-[#FCF9FA] border border-[#2A1E24]/10 space-y-3">
              <div className="flex items-center gap-2 text-[#9E4764]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-serif text-xl">Enquiry Sent</span>
              </div>
              <p className="text-sm text-[#74626A]">
                Thank you for reaching out. Your floral note has been saved for Alice&apos;s review.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs uppercase tracking-widest text-[#2A1E24] underline underline-offset-4"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="enq-name" className="block text-xs text-[#74626A]">
                    Name *
                  </label>
                  <input
                    id="enq-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="enq-email" className="block text-xs text-[#74626A]">
                    Email *
                  </label>
                  <input
                    id="enq-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="enq-ig" className="block text-xs text-[#74626A]">
                    Instagram Handle
                  </label>
                  <input
                    id="enq-ig"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@handle"
                    className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="enq-date" className="block text-xs text-[#74626A]">
                    Preferred Date (optional)
                  </label>
                  <input
                    id="enq-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="enq-occ" className="block text-xs text-[#74626A]">
                  Occasion or Dream Palette
                </label>
                <input
                  id="enq-occ"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="enq-msg" className="block text-xs text-[#74626A]">
                  Message *
                </label>
                <textarea
                  id="enq-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm focus:outline-none focus:border-[#9E4764]"
                />
              </div>

              {errorMsg && <p className="text-xs text-[#9E4764]">{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-xs uppercase tracking-[0.18em] bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors min-h-[48px]"
              >
                {submitting ? 'Sending...' : 'Send Floral Enquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
