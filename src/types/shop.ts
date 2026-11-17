export type CollectionSlug =
  | 'signature-bouquets'
  | 'romantic-flower-baskets'
  | 'luxury-floral-boxes'
  | 'pastel-dreams'
  | 'bespoke-floral-creations'
  | 'occasion-arrangements';

export type OccasionName =
  | 'Romance & Anniversary'
  | 'Birthdays'
  | 'Weddings & Bridal'
  | 'Graduations'
  | 'Mother’s Day & Gratitude'
  | 'Housewarming'
  | 'Bespoke Milestones';

export interface ProductMedia {
  type: 'image' | 'video';
  src: string;
  alt: string;
  isAuthenticBrandWork: boolean;
  caption: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number | null;
}

export interface CatalogueItem {
  id: string;
  slug: string;
  name: string;
  collection: CollectionSlug;
  collectionTitle: string;
  occasions: OccasionName[];
  priceDisplay: string;
  isPriceOnRequest: boolean;
  basePrice: number | null;
  variants: ProductVariant[];
  colourOptions: string[];
  wrappingOptions: string[];
  inStock: boolean;
  featured: boolean;
  leadTimeNote: string;
  description: string;
  craftDetails: string[];
  media: ProductMedia[];
}

export interface BagItem {
  id: string;
  productId: string;
  slug: string;
  productName: string;
  imageSrc: string;
  variantId?: string;
  variantLabel?: string;
  colourChoice?: string;
  wrappingStyle?: string;
  occasion: OccasionName;
  personalisedMessage: boolean;
  personalisedMessageText: string;
  pearlOrRibbonAccent: boolean;
  specialInstructions: string;
  quantity: number;
  baseUnitPrice: number | null;
  unitTotal: number | null;
  isCustomDreamBouquet?: boolean;
  pendingQuoteFlags: string[];
}

export type OrderStatus =
  | 'New Request'
  | 'Quoted'
  | 'Confirmed'
  | 'In Preparation'
  | 'Ready / Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export type FulfilmentMethod = 'saigon_courier' | 'pickup';

export interface OrderRequest {
  id: string;
  referenceCode: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: BagItem[];
  knownSubtotalVnd: number;
  hasUnpricedItems: boolean;
  fulfilmentMethod: FulfilmentMethod;
  preferredDate: string;
  deliveryArea: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    instagramHandle: string;
  };
  recipient: {
    name: string;
    giftNote: string;
  };
  demoPaymentStatus: 'inquiry_quote_pending';
  stripeReadyNote: string;
  pendingConfirmationNotes: string[];
  adminNotes: string;
  finalQuoteVnd: number | null;
}

export interface AvailabilityConfig {
  blockedDates: string[];
  maxOrdersPerDay: number;
  dateCounts: Record<string, number>;
}

export interface CustomerEnquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  instagramHandle: string;
  occasion: string;
  preferredDate: string;
  message: string;
  status: 'New' | 'Replied';
}

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;
}

export function formatItemPrice(price: number | null, fallbackDisplay = 'Price on Request'): string {
  if (typeof price === 'number' && price > 0) {
    return formatVnd(price);
  }
  return fallbackDisplay;
}
