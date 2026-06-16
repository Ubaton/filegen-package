export default {
"e-commerce": {
  "src/": {
    "app/": {
      "layout.tsx": `import React from "react"

      export default function RootLayout({ children }) {
          return (
            <html lang="en">
              <body>{children}</body>
            </html>
          );
        }`,
      "page.tsx": `import Products from '@/components/Products';
        import Cart from '@/components/Cart';
        
        export default function Home() {
          return (
            <main className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold mb-8">Our Store</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Products />
                </div>
                <div>
                  <Cart />
                </div>
              </div>
            </main>
          );
        }`,
      "products/": {
        "page.tsx": `export default function ProductsPage() {
          return <Products />;
        }`,
        "[category]/": {
          "page.tsx": `export default function CategoryPage({ params }) {
            return <Products category={params.category} />;
          }`,
          "[product]/": {
            "page.tsx": `export default function ProductPage({ params }) {
              return <ProductDetail id={params.product} />;
            }`,
          },
        },
      },
      "cart/": {
        "page.tsx": `export default function CartPage() {
          return <Cart />;
        }`,
      },
      "checkout/": {
        "page.tsx": `export default function CheckoutPage() {
          return <Checkout />;
        }`,
      },
      "api/": {
        "products/": {
          "route.ts": `export async function GET() {
            // Products API logic
          }`,
        },
        "cart/": {
          "route.ts": `export async function POST() {
            // Cart API logic
          }`,
        },
        "orders/": {
          "route.ts": `export async function POST() {
            // Orders API logic
          }`,
        },
      },
    },
    "components/": {
      "Header/": {
        "Header.tsx": `export default function Header() {
          return (
            <header>
              <Navigation />
              <SearchBar />
              <CartIcon />
            </header>
          );
        }`,
        "Navigation.tsx": `export default function Navigation() {
          return <nav>// Navigation implementation</nav>;
        }`,
        "SearchBar.tsx": `export default function SearchBar() {
          return <div>// Search implementation</div>;
        }`,
        "CartIcon.tsx": `export default function CartIcon() {
          return <div>// Cart icon with counter</div>;
        }`,
      },
      "Footer/": {
        "Footer.tsx": `export default function Footer() {
          return (
            <footer>
              <Newsletter />
              <PolicyLinks />
            </footer>
          );
        }`,
        "Newsletter.tsx": `export default function Newsletter() {
          return <div>// Newsletter signup form</div>;
        }`,
        "PolicyLinks.tsx": `export default function PolicyLinks() {
          return <div>// Policy links implementation</div>;
        }`,
      },
      "Products.tsx": `'use client';
        import { useState } from 'react';
        import { useCart } from '@/hooks/useCart';
        
        export default function Products() {
          const { addToCart } = useCart();
          const [products] = useState<Product[]>([]);
        
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">\${product.price.toFixed(2)}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          );
        }`,
      "Cart.tsx": `'use client';
        import { useCart } from '@/hooks/useCart';
        
        export default function Cart() {
          const { items, removeFromCart, updateQuantity } = useCart();
        
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
          return (
            <div className="border rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
              {items.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 mb-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">\${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-100 rounded"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div className="border-t pt-4 mt-4">
                <p className="text-xl font-bold">Total: \${total.toFixed(2)}</p>
                <button className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600">
                  Checkout
                </button>
              </div>
            </div>
          );
        }`,
    },
    "hooks/": {
      "useCart.ts": `import { create } from 'zustand';
        import { Product } from '@/types';
        
        interface CartItem extends Product {
          quantity: number;
        }
        
        interface CartStore {
          items: CartItem[];
          addToCart: (product: Product) => void;
          removeFromCart: (productId: string) => void;
          updateQuantity: (productId: string, quantity: number) => void;
        }
        
        export const useCart = create<CartStore>((set) => ({
          items: [],
          addToCart: (product) =>
            set((state) => {
              const existingItem = state.items.find((item) => item.id === product.id);
              if (existingItem) {
                return {
                  items: state.items.map((item) =>
                    item.id === product.id
                      ? { ...item, quantity: item.quantity + 1 }
                      : item
                  ),
                };
              }
              return { items: [...state.items, { ...product, quantity: 1 }] };
            }),
          removeFromCart: (productId) =>
            set((state) => ({
              items: state.items.filter((item) => item.id !== productId),
            })),
          updateQuantity: (productId, quantity) =>
            set((state) => ({
              items: quantity === 0
                ? state.items.filter((item) => item.id !== productId)
                : state.items.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                  ),
            })),
        }));`,
    },
    "lib/": {
      "formatCurrency.ts": `export const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      }`,
      "calculateDiscount.ts": `export const calculateDiscount = (price: number, discountPercentage: number) => {
        return price * (1 - discountPercentage / 100);
      }`,
    },
    "types/": {
      "index.ts": `export interface Product {
        id: string;
        name: string;
        price: number;
        image: string;
      }`,
    },
};