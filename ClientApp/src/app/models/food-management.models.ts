export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isOffer: boolean; // 👈 Added matching model properties
  parentCategoryId?: string | null;
  parentCategoryName?: string;
}

export interface FoodVariant {
  id?: string;
  variantName: string;
  price: number;
  taxPercentage: number;
}

export interface FoodAvailability {
  id?: string;
  availableFrom: string; // "HH:MM:SS" format matching C# TimeSpan
  availableTo: string;   // "HH:MM:SS" format matching C# TimeSpan
  isAvailableAllDay: boolean;
}

export interface GroupItemChild {
  id?: string;
  childMenuItemId: string;
  childMenuItemName?: string;
  quantity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isGroupItem: boolean;
  categoryId: string;
  categoryName: string;
  variants: FoodVariant[];
  availabilities: FoodAvailability[];
  groupComponents: GroupItemChild[];
}