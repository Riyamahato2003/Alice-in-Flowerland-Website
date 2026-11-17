import React, { useCallback, useEffect, useState } from 'react';
import { Lock, LogOut, Plus, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  formatItemPrice,
  formatVnd,
  type CatalogueItem,
  type CustomerEnquiry,
  type OrderRequest,
  type OrderStatus,
} from '../types/shop';

const ORDER_STATUSES: OrderStatus[] = [
  'New Request',
  'Quoted',
  'Confirmed',
  'In Preparation',
  'Ready / Out for Delivery',
  'Completed',
  'Cancelled',
];

const ADMIN_TOKEN_KEY = 'alice_flowerland_admin_token';

function readStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeStoredToken(token: string | null) {
  try {
    if (token) {
      window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

export const AdminPage: React.FC = () => {
  const { catalogue, availability, refreshCatalogue, refreshAvailability } = useShop();

  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    'orders' | 'catalogue' | 'availability' | 'enquiries'
  >('orders');

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Order Edit Buffer
  const [editStatus, setEditStatus] = useState<OrderStatus>('New Request');
  const [editQuoteVnd, setEditQuoteVnd] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [savingOrder, setSavingOrder] = useState(false);

  // Catalogue Edit Buffer
  const [editingProduct, setEditingProduct] = useState<CatalogueItem | null>(null);
  const [prodPriceDisplay, setProdPriceDisplay] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPhotoUrl, setProdPhotoUrl] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Availability Buffer
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(8);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  };

  const adminFetch = useCallback(
    async (input: string, init: RequestInit = {}, explicitToken?: string | null) => {
      const token = explicitToken !== undefined ? explicitToken : readStoredToken();
      const headers = new Headers(init.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(input, {
        ...init,
        headers,
        credentials: 'same-origin',
      });
    },
    []
  );

  const fetchAdminData = useCallback(
    async (explicitToken?: string | null) => {
      try {
        const res = await adminFetch('/api/admin/orders', {}, explicitToken);
        if (res.status === 401) {
          writeStoredToken(null);
          setAuthenticated(false);
          setAuthError('Session could not be verified. Please unlock again.');
          return false;
        }
        if (!res.ok) {
          setAuthError('Unable to load boutique operations right now.');
          return false;
        }
        const data = await res.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setEnquiries(Array.isArray(data.enquiries) ? data.enquiries : []);
        return true;
      } catch {
        setAuthError('Connection issue reaching the boutique server.');
        return false;
      }
    },
    [adminFetch]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/session');
        const data = await res.json();
        const isAuth = Boolean(data.authenticated);
        setAuthenticated(isAuth);
        if (isAuth) {
          await fetchAdminData();
        } else {
          writeStoredToken(null);
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingSession(false);
      }
    })();
  }, [adminFetch, fetchAdminData]);

  useEffect(() => {
    setBlockedDates(availability.blockedDates);
    setMaxCapacity(availability.maxOrdersPerDay);
  }, [availability]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }
      if (data.token) {
        writeStoredToken(data.token);
      }
      setPasscode('');
      setAuthenticated(true);
      await fetchAdminData(data.token || null);
    } catch {
      setAuthError('Could not connect to boutique authentication server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminFetch('/api/admin/logout', { method: 'POST' });
    } finally {
      writeStoredToken(null);
      setAuthenticated(false);
      setOrders([]);
      setEnquiries([]);
    }
  };

  const openOrderDetail = (order: OrderRequest) => {
    setSelectedOrderId(order.id);
    setEditStatus(order.status);
    setEditQuoteVnd(order.finalQuoteVnd !== null ? String(order.finalQuoteVnd) : '');
    setEditNotes(order.adminNotes || '');
  };

  const handleSaveOrder = async () => {
    if (!selectedOrderId) return;
    setSavingOrder(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          finalQuoteVnd: editQuoteVnd.trim() === '' ? null : Number(editQuoteVnd),
          adminNotes: editNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        showToast('Floral inquiry updated.');
      }
    } finally {
      setSavingOrder(false);
    }
  };

  const startEditProduct = (item: CatalogueItem) => {
    setEditingProduct(item);
    setProdPriceDisplay(item.priceDisplay);
    setProdBasePrice(item.basePrice !== null ? String(item.basePrice) : '');
    setProdDescription(item.description);
    setProdPhotoUrl(item.media[0]?.src || '');
    setProdInStock(item.inStock);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      const parsedPrice =
        prodBasePrice.trim() === '' ? null : Number(prodBasePrice.trim());
      const res = await adminFetch(`/api/admin/catalogue/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceDisplay: prodPriceDisplay,
          basePrice: parsedPrice,
          description: prodDescription,
          primaryPhotoUrl: prodPhotoUrl,
          inStock: prodInStock,
        }),
      });
      if (res.ok) {
        await refreshCatalogue();
        setEditingProduct(null);
        showToast('Catalogue updated across boutique.');
      }
    } finally {
      setSavingProduct(false);
    }
  };

  const toggleProductStock = async (item: CatalogueItem) => {
    const res = await adminFetch(`/api/admin/catalogue/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: !item.inStock }),
    });
    if (res.ok) {
      await refreshCatalogue();
      showToast(`${item.name} marked ${!item.inStock ? 'available' : 'seasonal pause'}.`);
    }
  };

  const handleSaveAvailability = async (nextDates: string[], nextCap: number) => {
    setSavingAvailability(true);
    try {
      const res = await adminFetch('/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedDates: nextDates,
          maxOrdersPerDay: nextCap,
        }),
      });
      if (res.ok) {
        await refreshAvailability();
        showToast('Saigon studio calendar updated.');
      }
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleMarkEnquiry = async (id: string, status: 'New' | 'Replied') => {
    const res = await adminFetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (res.ok && data.enquiry) {
      setEnquiries((prev) => prev.map((e) => (e.id === id ? data.enquiry : e)));
    }
  };

  if (checkingSession) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center text-sm text-[#74626A]">
        Verifying boutique admin session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 lg:py-28">
        <div className="p-8 bg-[#F6ECEF] border border-[#2A1E24]/15 space-y-6">
          <div className="flex items-center gap-3 text-[#9E4764]">
            <Lock className="w-5 h-5" />
            <span className="text-xs uppercase tracking-[0.2em]">Private Boutique Access</span>
          </div>
          <h1 className="font-serif text-3xl text-[#2A1E24]">Alice in Flowerland Admin</h1>
          <p className="text-xs text-[#74626A] leading-relaxed">
            Customer floral inquiries, VND pricing, gift notes, and Saigon delivery capacity are
            protected behind server-side session verification.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-pass" className="block text-xs text-[#74626A]">
                Atelier Passcode
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full px-4 py-3 bg-[#FCF9FA] border border-[#2A1E24]/20 text-sm focus:outline-none focus:border-[#9E4764]"
              />
            </div>

            {authError && <p className="text-xs text-[#9E4764]">{authError}</p>}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 text-xs uppercase tracking-[0.18em] bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] disabled:opacity-60 transition-colors min-h-[48px]"
            >
              {loggingIn ? 'Unlocking Dashboard...' : 'Unlock Boutique Dashboard'}
            </button>

            <div className="pt-2 border-t border-[#2A1E24]/10 flex items-center justify-between text-[11px] text-[#74626A]">
              <span>Demo passcode: alice-saigon-atelier</span>
              <button
                type="button"
                onClick={() => setPasscode('alice-saigon-atelier')}
                className="text-[#9E4764] underline underline-offset-2"
              >
                Fill Demo
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === statusFilter);
  const activeOrder = orders.find((o) => o.id === selectedOrderId) || null;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 lg:py-14 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#2A1E24]/10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#9E4764]">
            Private Boutique Management
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2A1E24] mt-1">
            Alice in Flowerland Saigon Operations
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {toastMsg && <span className="text-xs text-[#9E4764]">{toastMsg}</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-[#2A1E24]/20 hover:border-[#9E4764] hover:text-[#9E4764] transition-colors min-h-[40px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'orders', label: `Inquiries & Orders (${orders.length})` },
            { id: 'catalogue', label: `Catalogue (${catalogue.length})` },
            { id: 'availability', label: 'Dates & Capacity' },
            { id: 'enquiries', label: `Contact Messages (${enquiries.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs whitespace-nowrap shrink-0 border transition-colors min-h-[40px] ${
              activeTab === tab.id
                ? 'bg-[#2A1E24] text-[#FCF9FA] border-[#2A1E24]'
                : 'bg-transparent text-[#74626A] border-[#2A1E24]/15 hover:text-[#2A1E24]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-2xl text-[#2A1E24]">Floral Order Inquiries</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | OrderStatus)}
                className="px-3 py-2 bg-[#F6ECEF] border border-[#2A1E24]/15 text-xs"
              >
                <option value="All">All Statuses</option>
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-10 bg-[#F6ECEF] border border-[#2A1E24]/10 text-center text-sm text-[#74626A]">
                No floral order inquiries yet. Submit a sample inquiry via Checkout to inspect it
                here.
              </div>
            ) : (
              <div className="divide-y divide-[#2A1E24]/10 border border-[#2A1E24]/10 bg-[#FCF9FA]">
                {filteredOrders.map((o) => {
                  const listPrice =
                    o.finalQuoteVnd !== null
                      ? formatVnd(o.finalQuoteVnd)
                      : o.knownSubtotalVnd > 0
                        ? formatVnd(o.knownSubtotalVnd)
                        : 'Price on Request';

                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => openOrderDetail(o)}
                      className={`w-full p-5 text-left transition-colors hover:bg-[#F6ECEF]/60 ${
                        selectedOrderId === o.id ? 'bg-[#F6ECEF]' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-serif text-lg text-[#2A1E24]">
                          {o.referenceCode} · {o.customer.name}
                        </span>
                        <span className="text-xs font-medium tabular-nums text-[#9E4764]">
                          {listPrice}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#74626A]">
                        <span className="font-medium text-[#2A1E24]">{o.status}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{o.preferredDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {o.fulfilmentMethod === 'saigon_courier'
                            ? `Saigon Courier (${o.deliveryArea})`
                            : 'Saigon Boutique Pickup'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{o.items.length} arrangement(s)</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            {activeOrder ? (
              <div className="p-6 bg-[#F6ECEF] border border-[#2A1E24]/15 space-y-5">
                <div className="border-b border-[#2A1E24]/10 pb-4">
                  <p className="text-xs text-[#9E4764]">{activeOrder.referenceCode}</p>
                  <h3 className="font-serif text-2xl text-[#2A1E24]">
                    {activeOrder.customer.name}
                  </h3>
                  <p className="text-xs text-[#74626A] mt-1">
                    {activeOrder.customer.email} · {activeOrder.customer.phone}
                    {activeOrder.customer.instagramHandle
                      ? ` · ${activeOrder.customer.instagramHandle}`
                      : ''}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="uppercase tracking-widest text-[#2A1E24]">
                    Items &amp; Custom Details
                  </p>
                  {activeOrder.items.map((it) => (
                    <div key={it.id} className="p-3 bg-[#FCF9FA] border border-[#2A1E24]/10 space-y-1">
                      <div className="flex justify-between font-medium text-[#2A1E24] gap-2">
                        <span>
                          {it.quantity} × {it.productName}
                        </span>
                        <span className="tabular-nums shrink-0 text-[#9E4764]">
                          {formatItemPrice(
                            it.unitTotal !== null ? it.unitTotal * it.quantity : null
                          )}
                        </span>
                      </div>
                      <p className="text-[#74626A]">
                        {it.variantLabel}
                        {it.colourChoice ? ` · ${it.colourChoice}` : ''}
                        {it.wrappingStyle ? ` · ${it.wrappingStyle}` : ''} · {it.occasion}
                      </p>
                      {it.pearlOrRibbonAccent && (
                        <p className="text-[#9E4764]">Pearl Strands &amp; Satin Bow requested</p>
                      )}
                      {it.personalisedMessage && (
                        <p className="text-[#9E4764]">
                          Card: {it.personalisedMessageText || 'Requested'}
                        </p>
                      )}
                      {it.specialInstructions && (
                        <p className="italic text-[#74626A]">
                          Instructions: {it.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#74626A] space-y-1">
                  <p>
                    <strong className="text-[#2A1E24]">Recipient:</strong>{' '}
                    {activeOrder.recipient.name}
                  </p>
                  {activeOrder.recipient.giftNote && (
                    <p>
                      <strong className="text-[#2A1E24]">Gift Note &amp; Delivery Time:</strong>{' '}
                      {activeOrder.recipient.giftNote}
                    </p>
                  )}
                  <p>
                    <strong className="text-[#2A1E24]">Mode:</strong> {activeOrder.stripeReadyNote}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#2A1E24]/10">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#74626A]">Fulfilment Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[#74626A]">
                      Confirmed Total Quote (VND ₫, incl. Saigon courier)
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={editQuoteVnd}
                      onChange={(e) => setEditQuoteVnd(e.target.value)}
                      placeholder="e.g. 1850000"
                      className="w-full px-3 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[#74626A]">Internal Notes</label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={savingOrder}
                    onClick={handleSaveOrder}
                    className="w-full py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764] transition-colors"
                  >
                    {savingOrder ? 'Saving...' : 'Save Inquiry Update'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#F6ECEF] border border-[#2A1E24]/10 text-xs text-[#74626A] text-center">
                Select an inquiry on the left to inspect bouquet details and assign its VND (₫)
                quotation or status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATALOGUE TAB */}
      {activeTab === 'catalogue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 divide-y divide-[#2A1E24]/10 border border-[#2A1E24]/10">
            {catalogue.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="font-serif text-lg text-[#2A1E24]">{item.name}</p>
                  <p className="text-xs text-[#74626A] tabular-nums">
                    {formatItemPrice(item.basePrice, item.priceDisplay)} · {item.collectionTitle} ·{' '}
                    {item.inStock ? 'Available' : 'Seasonal Pause'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleProductStock(item)}
                    className={`px-3 py-1.5 text-xs border transition-colors ${
                      item.inStock
                        ? 'border-[#2A1E24]/20 text-[#2A1E24] hover:border-[#9E4764]'
                        : 'border-[#9E4764] bg-[#9E4764] text-[#FCF9FA]'
                    }`}
                  >
                    {item.inStock ? 'Pause Seasonal' : 'Mark Available'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditProduct(item)}
                    className="px-3 py-1.5 text-xs bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764]"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-5">
            {editingProduct ? (
              <div className="p-6 bg-[#F6ECEF] border border-[#2A1E24]/15 space-y-4">
                <h3 className="font-serif text-2xl text-[#2A1E24]">
                  Edit {editingProduct.name}
                </h3>
                <div className="space-y-1">
                  <label className="block text-xs text-[#74626A]">
                    Base Price in VND ₫ (Leave blank for “Price on Request”)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={prodBasePrice}
                    onChange={(e) => {
                      setProdBasePrice(e.target.value);
                      if (e.target.value.trim() === '') {
                        setProdPriceDisplay('Price on Request');
                      } else {
                        const n = Number(e.target.value);
                        if (Number.isFinite(n) && n > 0) {
                          setProdPriceDisplay(formatVnd(n));
                        }
                      }
                    }}
                    placeholder="e.g. 1850000 or empty for Price on Request"
                    className="w-full px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#74626A]">Display Label</label>
                  <input
                    value={prodPriceDisplay}
                    onChange={(e) => setProdPriceDisplay(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#74626A]">Primary Photo / Video Path</label>
                  <input
                    value={prodPhotoUrl}
                    onChange={(e) => setProdPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#74626A]">Description</label>
                  <textarea
                    rows={3}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="accent-[#9E4764]"
                  />
                  <span>Available in Saigon Studio</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingProduct}
                    onClick={handleSaveProduct}
                    className="flex-1 py-3 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764]"
                  >
                    {savingProduct ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-3 text-xs border border-[#2A1E24]/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-[#F6ECEF] border border-[#2A1E24]/10 text-xs text-[#74626A] text-center">
                Select any arrangement on the left to set a confirmed VND (₫) price, restore Price
                on Request, update photos, or pause seasonal stems.
              </div>
            )}
          </div>
        </div>
      )}

      {/* AVAILABILITY TAB */}
      {activeTab === 'availability' && (
        <div className="max-w-2xl space-y-6 p-6 sm:p-8 bg-[#F6ECEF] border border-[#2A1E24]/10">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-[#2A1E24]">
              Saigon Calendar &amp; Daily Capacity
            </h2>
            <p className="text-xs text-[#74626A]">
              Blocked dates are immediately prevented in the Order Inquiry form.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="cap-input" className="block text-xs text-[#74626A]">
              Maximum Bouquets / Requests Per Day
            </label>
            <div className="flex items-center gap-3">
              <input
                id="cap-input"
                type="number"
                min={1}
                max={50}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value) || 1)}
                className="w-28 px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm tabular-nums"
              />
              <button
                type="button"
                disabled={savingAvailability}
                onClick={() => handleSaveAvailability(blockedDates, maxCapacity)}
                className="px-4 py-2 text-xs uppercase tracking-widest bg-[#2A1E24] text-[#FCF9FA] hover:bg-[#9E4764]"
              >
                Update Capacity
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#2A1E24]/10">
            <label htmlFor="block-date" className="block text-xs text-[#74626A]">
              Block a Specific Date
            </label>
            <div className="flex items-center gap-3">
              <input
                id="block-date"
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="px-3 py-2 bg-[#FCF9FA] border border-[#2A1E24]/15 text-sm"
              />
              <button
                type="button"
                disabled={!newBlockedDate || savingAvailability}
                onClick={() => {
                  if (!newBlockedDate || blockedDates.includes(newBlockedDate)) return;
                  const next = [...blockedDates, newBlockedDate].sort();
                  setBlockedDates(next);
                  setNewBlockedDate('');
                  handleSaveAvailability(next, maxCapacity);
                }}
                className="px-4 py-2 text-xs uppercase tracking-widest bg-[#9E4764] text-[#FCF9FA] inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Block Date</span>
              </button>
            </div>

            <div className="pt-2 space-y-2">
              {blockedDates.length === 0 ? (
                <p className="text-xs text-[#74626A]">No blocked dates configured.</p>
              ) : (
                blockedDates.map((d) => (
                  <div
                    key={d}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#FCF9FA] border border-[#2A1E24]/10 text-sm"
                  >
                    <span className="tabular-nums">{d}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = blockedDates.filter((x) => x !== d);
                        setBlockedDates(next);
                        handleSaveAvailability(next, maxCapacity);
                      }}
                      className="text-xs text-[#9E4764] inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Unblock</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ENQUIRIES TAB */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="p-10 bg-[#F6ECEF] border border-[#2A1E24]/10 text-center text-sm text-[#74626A]">
              No customer contact messages received yet.
            </div>
          ) : (
            <div className="divide-y divide-[#2A1E24]/10 border border-[#2A1E24]/10">
              {enquiries.map((enq) => (
                <div key={enq.id} className="p-5 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-1.5">
                    <p className="font-serif text-lg text-[#2A1E24]">
                      {enq.name} · <span className="text-sm text-[#74626A]">{enq.email}</span>
                    </p>
                    <p className="text-xs text-[#74626A]">
                      {enq.occasion}
                      {enq.preferredDate ? ` · ${enq.preferredDate}` : ''}
                      {enq.instagramHandle ? ` · ${enq.instagramHandle}` : ''}
                    </p>
                    <p className="text-sm text-[#2A1E24] pt-1">{enq.message}</p>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkEnquiry(enq.id, enq.status === 'New' ? 'Replied' : 'New')
                      }
                      className={`px-3.5 py-2 text-xs border ${
                        enq.status === 'Replied'
                          ? 'border-[#2A1E24]/20 text-[#74626A]'
                          : 'border-[#9E4764] bg-[#9E4764] text-[#FCF9FA]'
                      }`}
                    >
                      {enq.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
