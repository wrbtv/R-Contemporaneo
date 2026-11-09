export interface Product {
  id?: string;
  name: string;
  price: number;
  cat: string;
  desc: string;
  emoji?: string;
  image_url?: string;
  is_available?: boolean;
  sort_order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Category {
  id?: string;
  name: string;
  sort_order?: number;
}

export interface RestaurantSettings {
  id?: string;
  restaurant_name: string;
  whatsapp_number: string;
  delivery_fee_ibiapina: number;
  operating_hours: string;
  pix_key?: string;
}
