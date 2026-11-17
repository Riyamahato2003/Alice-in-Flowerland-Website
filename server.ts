import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { CATALOGUE_SEED } from './src/data/catalogueSeed.ts';
import {
  formatVnd,
  type AvailabilityConfig,
  type BagItem,
  type CatalogueItem,
  type CustomerEnquiry,
  type FulfilmentMethod,
  type OrderRequest,
  type OrderStatus,
} from './src/types/shop.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'alice-store.json');

const rawAdminEnv = process.env.ADMIN_PASSCODE?.trim();
const ADMIN_PASSCODE =
  rawAdminEnv && !rawAdminEnv.startsWith('MY_')
    ? rawAdminEnv
    : 'alice-saigon-atelier';
const SESSION_SECRET =
  process.env.SESSION_SECRET || 'alice-flowerland-saigon-hmac-key';
const SESSION_COOKIE = 'alice_flowerland_admin_session';

interface StoreData {
  catalogue: CatalogueItem[];
  orders: OrderRequest[];
  availability: AvailabilityConfig;
  enquiries: CustomerEnquiry[];
}

function getDefaultStore(): StoreData {
  return {
    catalogue: structuredClone(CATALOGUE_SEED),
    orders: [],
    availability: {
      blockedDates: [],
      maxOrdersPerDay: 8,
      dateCounts: {},
    },
    enquiries: [],
  };
}

function syncCatalogueWithSeed(existing: CatalogueItem[]): {
  merged: CatalogueItem[];
  changed: boolean;
} {
  const byId = new Map(existing.map((item) => [item.id, item]));
  let changed = false;
  const merged: CatalogueItem[] = CATALOGUE_SEED.map((seedItem) => {
    const stored = byId.get(seedItem.id);
    if (stored) {
      return stored;
    }
    changed = true;
    return structuredClone(seedItem);
  });
  return { merged, changed };
}

function ensureStore(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = getDefaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const existingCat =
      Array.isArray(parsed.catalogue) && parsed.catalogue.length > 0
        ? parsed.catalogue
        : [];
    const { merged, changed } = syncCatalogueWithSeed(existingCat);
    const data: StoreData = {
      catalogue: merged,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      availability: parsed.availability || {
        blockedDates: [],
        maxOrdersPerDay: 8,
        dateCounts: {},
      },
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    };
    if (changed) {
      writeStore(data);
    }
    return data;
  } catch {
    const fallback = getDefaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function writeStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
}

function signSession(payload: string): string {
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

function verifySession(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const lastDot = token.lastIndexOf('.');
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expectedSig, 'hex');
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
    const [, expStr] = payload.split(':');
    const exp = Number(expStr);
    return Number.isFinite(exp) && Date.now() < exp;
  } catch {
    return false;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = decodeURIComponent(pair.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

function extractAdminToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE];
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = extractAdminToken(req);
  if (!verifySession(token)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

function sanitizeText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

async function startServer() {
  ensureStore();
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  // Public Catalogue
  app.get('/api/catalogue', (_req: Request, res: Response) => {
    const store = ensureStore();
    res.json({ items: store.catalogue });
  });

  // Public Availability
  app.get('/api/availability', (_req: Request, res: Response) => {
    const store = ensureStore();
    res.json({
      blockedDates: store.availability.blockedDates,
      maxOrdersPerDay: store.availability.maxOrdersPerDay,
      dateCounts: store.availability.dateCounts,
    });
  });

  // Public Order & Floral Inquiry Request Submission
  app.post('/api/orders', (req: Request, res: Response) => {
    const store = ensureStore();
    const body = req.body || {};

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      res.status(400).json({ error: 'Your floral bag cannot be empty.' });
      return;
    }
    if (rawItems.length > 25) {
      res.status(400).json({ error: 'Maximum 25 line items per order inquiry.' });
      return;
    }

    const fulfilmentMethod: FulfilmentMethod =
      body.fulfilmentMethod === 'saigon_courier' ? 'saigon_courier' : 'pickup';
    const preferredDate = sanitizeText(body.preferredDate, 20);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
      res.status(400).json({ error: 'Please select a valid preferred date.' });
      return;
    }

    if (store.availability.blockedDates.includes(preferredDate)) {
      res.status(409).json({
        error:
          'That date is currently closed in our Saigon boutique calendar. Please select another date.',
      });
      return;
    }
    const existingCount = store.availability.dateCounts[preferredDate] || 0;
    if (existingCount >= store.availability.maxOrdersPerDay) {
      res.status(409).json({
        error:
          'Daily handcrafted floral capacity has been reached for that date. Please choose another date.',
      });
      return;
    }

    const customerName = sanitizeText(body.customer?.name, 100);
    const customerEmail = sanitizeText(body.customer?.email, 120);
    const customerPhone = sanitizeText(body.customer?.phone, 40);
    const instagramHandle = sanitizeText(body.customer?.instagramHandle, 60);
    const recipientName = sanitizeText(body.recipient?.name, 100);
    const giftNote = sanitizeText(body.recipient?.giftNote, 400);
    const deliveryArea = sanitizeText(body.deliveryArea, 100);

    if (!customerName || !customerEmail || !customerPhone) {
      res.status(400).json({
        error: 'Name, email address, and phone/WhatsApp/Zalo number are required.',
      });
      return;
    }
    if (fulfilmentMethod === 'saigon_courier' && !deliveryArea) {
      res.status(400).json({
        error: 'Please enter your Saigon / Ho Chi Minh City district & address area.',
      });
      return;
    }

    const validatedItems: BagItem[] = [];
    const pendingNotes = new Set<string>();
    let hasUnpricedItems = false;

    if (fulfilmentMethod === 'saigon_courier') {
      pendingNotes.add(
        'Saigon / Ho Chi Minh City courier delivery fee is quoted based on district and stem fragility.'
      );
    } else {
      pendingNotes.add(
        'Saigon boutique pickup window & address details will be shared upon confirmation.'
      );
    }

    for (const raw of rawItems) {
      const isCustom = Boolean(raw.isCustomDreamBouquet);
      const product = store.catalogue.find((p) => p.id === raw.productId);

      if (!isCustom && !product) {
        res.status(400).json({ error: 'One or more selected blooms could not be found.' });
        return;
      }
      if (product && !product.inStock) {
        res.status(409).json({
          error: `${product.name} is currently seasonal-paused in our boutique. Please adjust your bag.`,
        });
        return;
      }

      const quantity = Math.max(1, Math.min(50, Math.floor(Number(raw.quantity) || 1)));
      const matchedVariant = product
        ? product.variants.find((v) => v.id === raw.variantId) || product.variants[0]
        : undefined;

      const baseUnitPrice = isCustom
        ? null
        : matchedVariant && typeof matchedVariant.price === 'number'
          ? matchedVariant.price
          : typeof product?.basePrice === 'number'
            ? product.basePrice
            : null;

      if (baseUnitPrice === null) {
        hasUnpricedItems = true;
      }

      const itemPendingFlags: string[] = [];
      if (baseUnitPrice === null) {
        itemPendingFlags.push('Price on Request — bespoke VND quote prepared upon review');
        pendingNotes.add(
          `${isCustom ? 'Bespoke Bouquet' : product?.name} is Price on Request and will receive a personal VND quotation.`
        );
      }

      validatedItems.push({
        id: sanitizeText(raw.id, 64) || crypto.randomUUID(),
        productId: product ? product.id : 'custom-dream-bouquet',
        slug: product ? product.slug : 'shop',
        productName: isCustom
          ? sanitizeText(raw.productName, 120) || 'Bespoke Floral Request'
          : product!.name,
        imageSrc: product?.media[0]?.src || '/assets/aistudio/image_1309a6ad.png',
        variantId: matchedVariant?.id,
        variantLabel: sanitizeText(raw.variantLabel, 80) || matchedVariant?.label,
        colourChoice: sanitizeText(raw.colourChoice, 60) || undefined,
        wrappingStyle: sanitizeText(raw.wrappingStyle, 80) || undefined,
        occasion:
          (sanitizeText(raw.occasion, 40) as BagItem['occasion']) ||
          'Romance & Anniversary',
        personalisedMessage: Boolean(raw.personalisedMessage),
        personalisedMessageText: raw.personalisedMessage
          ? sanitizeText(raw.personalisedMessageText, 180)
          : '',
        pearlOrRibbonAccent: Boolean(raw.pearlOrRibbonAccent),
        specialInstructions: sanitizeText(raw.specialInstructions, 400),
        quantity,
        baseUnitPrice,
        unitTotal: baseUnitPrice,
        isCustomDreamBouquet: isCustom,
        pendingQuoteFlags: itemPendingFlags,
      });
    }

    const knownSubtotalVnd = validatedItems.reduce(
      (sum, item) => sum + (item.unitTotal ? item.unitTotal * item.quantity : 0),
      0
    );

    const now = new Date().toISOString();
    const referenceCode = `ALICE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const order: OrderRequest = {
      id: crypto.randomUUID(),
      referenceCode,
      createdAt: now,
      updatedAt: now,
      status: 'New Request',
      items: validatedItems,
      knownSubtotalVnd,
      hasUnpricedItems,
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
        name: recipientName || customerName,
        giftNote,
      },
      demoPaymentStatus: 'inquiry_quote_pending',
      stripeReadyNote:
        'Floral inquiry recorded. Pricing in VND (₫) and delivery fees are confirmed by Alice before payment.',
      pendingConfirmationNotes: Array.from(pendingNotes),
      adminNotes: '',
      finalQuoteVnd: null,
    };

    store.orders.unshift(order);
    store.availability.dateCounts[preferredDate] = existingCount + 1;
    writeStore(store);

    res.status(201).json({ order });
  });

  // Public Contact / Bespoke Enquiry
  app.post('/api/enquiries', (req: Request, res: Response) => {
    const store = ensureStore();
    const body = req.body || {};
    const name = sanitizeText(body.name, 100);
    const email = sanitizeText(body.email, 120);
    const message = sanitizeText(body.message, 1000);
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }

    const enquiry: CustomerEnquiry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      instagramHandle: sanitizeText(body.instagramHandle, 60),
      occasion: sanitizeText(body.occasion, 60) || 'General Floral Enquiry',
      preferredDate: sanitizeText(body.preferredDate, 20),
      message,
      status: 'New',
    };

    store.enquiries.unshift(enquiry);
    writeStore(store);
    res.status(201).json({ enquiry });
  });

  // Admin Authentication (supports both HttpOnly cookie & Bearer header for iframe reliability)
  app.get('/api/admin/session', (req: Request, res: Response) => {
    const authenticated = verifySession(extractAdminToken(req));
    res.json({ authenticated });
  });

  app.post('/api/admin/login', (req: Request, res: Response) => {
    const passcode = sanitizeText(req.body?.passcode, 120);
    const isDemoPreview = process.env.NODE_ENV !== 'production';
    const isValid =
      Boolean(passcode) &&
      (passcode === ADMIN_PASSCODE ||
        (isDemoPreview && passcode === 'alice-saigon-atelier'));
    if (!isValid) {
      res.status(401).json({ error: 'Invalid boutique passcode.' });
      return;
    }
    const payload = `admin:${Date.now() + 1000 * 60 * 60 * 12}`;
    const signed = signSession(payload);
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieParts = [
      `${SESSION_COOKIE}=${encodeURIComponent(signed)}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${60 * 60 * 12}`,
      isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', cookieParts.join('; '));
    res.json({ authenticated: true, token: signed });
  });

  app.post('/api/admin/logout', (req: Request, res: Response) => {
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieParts = [
      `${SESSION_COOKIE}=`,
      'HttpOnly',
      'Path=/',
      'Max-Age=0',
      isHttps ? 'SameSite=None; Secure; Partitioned' : 'SameSite=Lax',
    ];
    res.setHeader('Set-Cookie', cookieParts.join('; '));
    res.json({ authenticated: false });
  });

  // Protected Admin Routes
  app.get('/api/admin/orders', requireAdmin, (_req: Request, res: Response) => {
    const store = ensureStore();
    res.json({ orders: store.orders, enquiries: store.enquiries });
  });

  app.patch('/api/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
    const store = ensureStore();
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order inquiry not found.' });
      return;
    }

    const allowedStatuses: OrderStatus[] = [
      'New Request',
      'Quoted',
      'Confirmed',
      'In Preparation',
      'Ready / Out for Delivery',
      'Completed',
      'Cancelled',
    ];

    if (typeof req.body?.status === 'string') {
      if (!allowedStatuses.includes(req.body.status as OrderStatus)) {
        res.status(400).json({ error: 'Invalid order status.' });
        return;
      }
      order.status = req.body.status as OrderStatus;
    }
    if (typeof req.body?.adminNotes === 'string') {
      order.adminNotes = sanitizeText(req.body.adminNotes, 1000);
    }
    if (req.body?.finalQuoteVnd === null || req.body?.finalQuoteVnd === '') {
      order.finalQuoteVnd = null;
    } else if (req.body?.finalQuoteVnd !== undefined) {
      const parsedQuote = Number(req.body.finalQuoteVnd);
      if (!Number.isFinite(parsedQuote) || parsedQuote < 0 || parsedQuote > 500000000) {
        res.status(400).json({ error: 'Invalid VND quote figure.' });
        return;
      }
      order.finalQuoteVnd = Math.round(parsedQuote);
    }
    order.updatedAt = new Date().toISOString();
    writeStore(store);
    res.json({ order });
  });

  app.patch('/api/admin/enquiries/:id', requireAdmin, (req: Request, res: Response) => {
    const store = ensureStore();
    const enquiry = store.enquiries.find((e) => e.id === req.params.id);
    if (!enquiry) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }
    if (req.body?.status === 'New' || req.body?.status === 'Replied') {
      enquiry.status = req.body.status;
    }
    writeStore(store);
    res.json({ enquiry });
  });

  app.patch('/api/admin/catalogue/:id', requireAdmin, (req: Request, res: Response) => {
    const store = ensureStore();
    const item = store.catalogue.find((p) => p.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (typeof req.body?.inStock === 'boolean') {
      item.inStock = req.body.inStock;
    }

    if (req.body?.basePrice === null || req.body?.basePrice === '') {
      item.basePrice = null;
      item.isPriceOnRequest = true;
      item.priceDisplay =
        typeof req.body?.priceDisplay === 'string' && req.body.priceDisplay.trim()
          ? sanitizeText(req.body.priceDisplay, 40)
          : 'Price on Request';
    } else if (req.body?.basePrice !== undefined) {
      const bp = Number(req.body.basePrice);
      if (Number.isFinite(bp) && bp > 0 && bp <= 500000000) {
        item.basePrice = Math.round(bp);
        item.isPriceOnRequest = false;
        item.priceDisplay =
          typeof req.body?.priceDisplay === 'string' &&
          req.body.priceDisplay.trim() &&
          req.body.priceDisplay.trim() !== 'Price on Request'
            ? sanitizeText(req.body.priceDisplay, 40)
            : formatVnd(item.basePrice);
        item.variants = item.variants.map((v) => ({
          ...v,
          price: item.basePrice,
        }));
      }
    } else if (typeof req.body?.priceDisplay === 'string' && req.body.priceDisplay.trim()) {
      item.priceDisplay = sanitizeText(req.body.priceDisplay, 40);
      item.isPriceOnRequest = item.priceDisplay.toLowerCase().includes('request');
    }

    if (typeof req.body?.description === 'string' && req.body.description.trim()) {
      item.description = sanitizeText(req.body.description, 600);
    }
    if (typeof req.body?.leadTimeNote === 'string') {
      item.leadTimeNote = sanitizeText(req.body.leadTimeNote, 120);
    }
    if (typeof req.body?.primaryPhotoUrl === 'string' && req.body.primaryPhotoUrl.trim()) {
      const url = sanitizeText(req.body.primaryPhotoUrl, 300);
      if (url.startsWith('/') || url.startsWith('https://')) {
        if (item.media.length > 0) {
          item.media[0] = {
            ...item.media[0],
            type: url.endsWith('.mp4') ? 'video' : 'image',
            src: url,
          };
        } else {
          item.media.push({
            type: url.endsWith('.mp4') ? 'video' : 'image',
            src: url,
            alt: item.name,
            isAuthenticBrandWork: true,
            caption: `Alice in Flowerland — ${item.name}`,
          });
        }
      }
    }

    writeStore(store);
    res.json({ item });
  });

  app.put('/api/admin/availability', requireAdmin, (req: Request, res: Response) => {
    const store = ensureStore();
    if (Array.isArray(req.body?.blockedDates)) {
      store.availability.blockedDates = req.body.blockedDates
        .filter((d: unknown): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .slice(0, 120);
    }
    if (req.body?.maxOrdersPerDay !== undefined) {
      const cap = Math.floor(Number(req.body.maxOrdersPerDay));
      if (Number.isFinite(cap) && cap >= 1 && cap <= 50) {
        store.availability.maxOrdersPerDay = cap;
      }
    }
    writeStore(store);
    res.json({ availability: store.availability });
  });

  // Vite Dev Middleware or Production Static Assets
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Alice in Flowerland Saigon boutique server listening on http://localhost:${PORT}`);
  });
}

startServer();
