export const structures = {
  "react-client": {
    "src/": {
      "app/": {
        "layout.tsx": `"use client";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
        "page.tsx": `"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Copy, Folder, FileCode, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import structures from "@/data/structures";`,
      },
    },
  },
  "e-commerce": {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
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
      },
      "components/": {
        "Products.tsx": `'use client';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/types';

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
      "types/": {
        "index.ts": `export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}`,
      },
    },
  },
  "blog-post": {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
        "page.tsx": `import BlogList from '@/components/BlogList';
import FeaturedPosts from '@/components/FeaturedPosts';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Blog</h1>
      <FeaturedPosts />
      <BlogList />
    </main>
  );
}`,
        "posts/[slug]/page.tsx": `import { getPostBySlug } from '@/lib/posts';

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  return (
    <article className="container mx-auto px-4 py-8 prose lg:prose-xl">
      <h1>{post.title}</h1>
      <div className="flex items-center gap-4 text-gray-600 mb-8">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p>{new Date(post.date).toLocaleDateString()}</p>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}`,
      },
      "components/": {
        "BlogList.tsx": `import Link from 'next/link';
import { getPosts } from '@/lib/posts';

export default function BlogList() {
  const posts = getPosts();

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.slug} className="border rounded-lg overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">
              <Link href={\`/posts/\${post.slug}\`}>{post.title}</Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{post.author.name}</span>
              <span>•</span>
              <time>{new Date(post.date).toLocaleDateString()}</time>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}`,
        "FeaturedPosts.tsx": `import Link from 'next/link';
import { getFeaturedPosts } from '@/lib/posts';

export default function FeaturedPosts() {
  const featuredPosts = getFeaturedPosts();

  return (
    <div className="grid gap-8 mb-12 md:grid-cols-2">
      {featuredPosts.map((post) => (
        <article
          key={post.slug}
          className="relative h-96 group overflow-hidden rounded-lg"
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                <Link href={\`/posts/\${post.slug}\`}>{post.title}</Link>
              </h2>
              <p className="text-gray-200 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full"
                />
                <span>{post.author.name}</span>
                <span>•</span>
                <time>{new Date(post.date).toLocaleDateString()}</time>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}`,
      },
      "lib/": {
        "posts.ts": `import { Post } from '@/types';

export function getPosts(): Post[] {
  // Implement your data fetching logic here
  return [];
}

export function getFeaturedPosts(): Post[] {
  return getPosts().filter((post) => post.featured);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}`,
      },
      "types/": {
        "index.ts": `export interface Author {
  name: string;
  avatar: string;
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: Author;
  coverImage: string;
  featured?: boolean;
}`,
      },
    },
  },
};
