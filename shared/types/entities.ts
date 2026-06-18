export type UserRole = 'CUSTOMER' | 'RIDER' | 'RESTAURANT_OWNER' | 'ADMIN';

export type PaymentMethod = 'MOMO_MTN' | 'MOMO_AIRTEL' | 'CASH';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';

export type OrderStatus =
  | 'PLACED'
  | 'PAYMENT_CONFIRMED'
  | 'ACCEPTED_BY_RESTAURANT'
  | 'RIDER_ASSIGNED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export type DiscountType = 'PERCENT' | 'FIXED';

export type MomoProvider = 'MTN' | 'AIRTEL';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  profilePhotoUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  lat: number;
  lng: number;
  buildingType: string | null;
  unitNumber: string | null;
  district: string;
  districtPin: string | null;
  deliveryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  businessName: string;
  lat: number;
  lng: number;
  addressDetails: string | null;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  isOpen: boolean;
  avgRating: number;
  distanceM?: number;
  etaMins?: number;
}

export interface RestaurantHours {
  id: string;
  restaurantId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface MenuSection {
  id: string;
  restaurantId: string;
  name: string;
  displayOrder: number;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  sectionId: string;
  restaurantId: string;
  name: string;
  description: string | null;
  priceRwf: number;
  photoUrl: string | null;
  isAvailable: boolean;
  prepTimeMins: number | null;
  ingredients: string | null;
  allergens: string | null;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  riderId: string | null;
  status: OrderStatus;
  subtotalRwf: number;
  deliveryFeeRwf: number;
  serviceFeeRwf: number;
  discountRwf: number;
  totalRwf: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddressId: string;
  paypackCashinRef: string | null;
  createdAt: string;
  deliveredAt: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPriceRwf: number;
  notes: string | null;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderRwf: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
}

export interface FoodRating {
  id: string;
  orderId: string;
  menuItemId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
}

export interface RestaurantRating {
  id: string;
  orderId: string;
  restaurantId: string;
  customerId: string;
  rating: number;
  comment: string | null;
}
