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

export type FoodCategory =
  | 'BURGER'
  | 'BEEF'
  | 'DESSERT'
  | 'JUICE'
  | 'NOODLES'
  | 'PIZZA'
  | 'SALAD'
  | 'OTHER';

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  profilePhotoUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export type BuildingType = 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'OTHER';

export interface Address {
  id: string;
  userId: string;
  label: string;
  lat: number;
  lng: number;
  formattedAddress: string | null;
  buildingType: BuildingType | null;
  houseNumber: string | null;
  apartmentName: string | null;
  buildingNumber: string | null;
  floorNumber: string | null;
  doorNumber: string | null;
  district: string;
  districtPin: string | null;
  deliveryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
  buildingType?: BuildingType;
  houseNumber?: string;
  apartmentName?: string;
  buildingNumber?: string;
  floorNumber?: string;
  doorNumber?: string;
  district: string;
  districtPin?: string;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
  isDefault?: boolean;
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
  category: FoodCategory;
  priceRwf: number;
  photoUrl: string | null;
  isAvailable: boolean;
  prepTimeMins: number | null;
  ingredients: string | null;
  allergens: string | null;
  avgRating: number;
}

export interface CategorySummary {
  category: FoodCategory;
  itemCount: number;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  photoUrl: string | null;
  priceRwf: number;
  category: FoodCategory;
  avgRating: number;
  restaurantId: string;
  restaurantName: string;
}

export interface RestaurantSearchResult {
  id: string;
  businessName: string;
  coverPhotoUrl: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  avgRating: number;
  distanceM?: number;
  etaMins?: number;
}

export interface SearchResponse {
  foods: FoodSearchResult[];
  restaurants: RestaurantSearchResult[];
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
  menuItem?: { name: string; photoUrl: string | null };
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  restaurant: { businessName: string };
  deliveryAddress?: Address;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: { menuItemId: string; quantity: number }[];
  deliveryAddressId: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
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

export interface PromoValidationResult {
  valid: boolean;
  discountRwf: number;
  description: string;
}

export interface SavedMomoNumber {
  id: string;
  userId: string;
  phoneNumber: string;
  provider: MomoProvider;
  isDefault: boolean;
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

export interface MenuItemDetail {
  id: string;
  name: string;
  description: string | null;
  category: FoodCategory;
  priceRwf: number;
  photoUrl: string | null;
  avgRating: number;
  prepTimeMins: number | null;
  ingredients: string | null;
  allergens: string | null;
  restaurantId: string;
  restaurantName: string;
  similarItems: FoodSearchResult[];
}

export interface FoodReviewSummary {
  avgRating: number;
  total: number;
  breakdown: { stars: number; count: number }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    photoUrl: string | null;
    createdAt: string;
    customerName: string | null;
    customerPhotoUrl: string | null;
  }[];
}

export type RestaurantReviewSummary = FoodReviewSummary;

export interface RestaurantDetail extends Restaurant {
  hours: RestaurantHours[];
  menuSections: (MenuSection & { items: MenuItem[] })[];
}
