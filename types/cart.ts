export interface CartItem {
  /** Clave única: productId + observaciones (el mismo producto con distinta nota es otra línea) */
  key: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  emoji: string | null;
  quantity: number;
  notes: string;
}
