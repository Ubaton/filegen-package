export const structures = {
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
        "page.tsx": `import { BlogList } from '@/components/BlogList';
            import { FeaturedPosts } from '@/components/FeaturedPosts';
            import { CategoryList } from '@/components/CategoryList';
            
            export default function Home() {
              return (
                <main className="container mx-auto px-4 py-8">
                  <FeaturedPosts />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-3">
                      <BlogList />
                    </div>
                    <aside>
                      <CategoryList />
                    </aside>
                  </div>
                </main>
              );
            }`,
        "blog/": {
          "page.tsx": `import { getAllPosts } from '@/lib/posts';
              import { BlogList } from '@/components/BlogList';
              
              export default async function BlogPage() {
                const posts = await getAllPosts();
                return <BlogList posts={posts} />;
              }`,
          "[slug]/": {
            "page.tsx": `import { getPostBySlug } from '@/lib/posts';
                import { BlogPost } from '@/components/BlogPost';
                import { CommentSection } from '@/components/CommentSection';
                
                export default async function PostPage({ params }) {
                  const post = await getPostBySlug(params.slug);
                  return (
                    <article className="max-w-3xl mx-auto px-4 py-8">
                      <BlogPost post={post} />
                      <CommentSection postId={post.id} />
                    </article>
                  );
                }`,
          },
        },
        "api/": {
          "posts/": {
            "route.ts": `import { NextResponse } from 'next/server';
                import { getPosts, createPost } from '@/lib/posts';
                
                export async function GET() {
                  const posts = await getPosts();
                  return NextResponse.json(posts);
                }
                
                export async function POST(request) {
                  const data = await request.json();
                  const post = await createPost(data);
                  return NextResponse.json(post);
                }`,
            "[slug]/": {
              "route.ts": `import { NextResponse } from 'next/server';
                  import { getPostBySlug, updatePost, deletePost } from '@/lib/posts';
                  
                  export async function GET(request, { params }) {
                    const post = await getPostBySlug(params.slug);
                    return NextResponse.json(post);
                  }
                  
                  export async function PUT(request, { params }) {
                    const data = await request.json();
                    const post = await updatePost(params.slug, data);
                    return NextResponse.json(post);
                  }
                  
                  export async function DELETE(request, { params }) {
                    await deletePost(params.slug);
                    return NextResponse.json({ deleted: true });
                  }`,
            },
            "comments/": {
              "route.ts": `import { NextResponse } from 'next/server';
                  import { getComments, createComment } from '@/lib/comments';
                  
                  export async function GET(request) {
                    const { searchParams } = new URL(request.url);
                    const postId = searchParams.get('postId');
                    const comments = await getComments(postId);
                    return NextResponse.json(comments);
                  }
                  
                  export async function POST(request) {
                    const data = await request.json();
                    const comment = await createComment(data);
                    return NextResponse.json(comment);
                  }`,
            },
          },
        },
      },
      "components/": {
        "Header.tsx": `export default function Header() {
            return (
              <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                  <nav className="flex items-center justify-between">
                    <a href="/" className="text-2xl font-bold">Blog</a>
                    <div className="space-x-4">
                      <a href="/blog" className="hover:text-blue-600">Posts</a>
                      <a href="/about" className="hover:text-blue-600">About</a>
                      <a href="/contact" className="hover:text-blue-600">Contact</a>
                    </div>
                  </nav>
                </div>
              </header>
            );
          }`,
        "Footer.tsx": `export default function Footer() {
            return (
              <footer className="bg-gray-50 border-t">
                <div className="container mx-auto px-4 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="font-semibold mb-4">About</h3>
                      <p className="text-gray-600">Your blog description here.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Categories</h3>
                      <ul className="space-y-2">
                        <li><a href="/blog/tech" className="text-gray-600 hover:text-blue-600">Technology</a></li>
                        <li><a href="/blog/lifestyle" className="text-gray-600 hover:text-blue-600">Lifestyle</a></li>
                        <li><a href="/blog/travel" className="text-gray-600 hover:text-blue-600">Travel</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Subscribe</h3>
                      <form className="space-y-4">
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-2 border rounded"
                        />
                        <button
                          type="submit"
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Subscribe
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </footer>
            );
          }`,
        "BlogPost.tsx": `'use client';
            import { formatDate } from '@/lib/formatDate';
            import { markdownToHtml } from '@/lib/markdownToHtml';
            
            export function BlogPost({ post }) {
              return (
                <article className="prose lg:prose-xl mx-auto">
                  <header className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="mx-2">·</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </header>
                  <div
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
                    className="mt-8"
                  />
                  <footer className="mt-8 pt-8 border-t">
                    <div className="flex items-center space-x-4">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{post.author.name}</h3>
                        <p className="text-gray-600">{post.author.bio}</p>
                      </div>
                    </div>
                  </footer>
                </article>
              );
            }`,
        "CommentSection.tsx": `'use client';
            import { useState, useEffect } from 'react';
            
            export function CommentSection({ postId }) {
              const [comments, setComments] = useState([]);
              const [newComment, setNewComment] = useState('');
            
              useEffect(() => {
                fetchComments();
              }, [postId]);
            
              async function fetchComments() {
                const response = await fetch(\`/api/posts/comments?postId=\${postId}\`);
                const data = await response.json();
                setComments(data);
              }
            
              async function handleSubmit(e) {
                e.preventDefault();
                const response = await fetch('/api/posts/comments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ postId, content: newComment }),
                });
                const data = await response.json();
                setComments([...comments, data]);
                setNewComment('');
              }
            
              return (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold mb-4">Comments</h2>
                  <form onSubmit={handleSubmit} className="mb-8">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-4 border rounded"
                      rows={4}
                      placeholder="Leave a comment..."
                    />
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Post Comment
                    </button>
                  </form>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4">
                        <div className="flex items-center mb-2">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <span className="font-semibold">{comment.author.name}</span>
                          <time className="text-gray-600 ml-2">
                            {formatDate(comment.createdAt)}
                          </time>
                        </div>
                        <p className="text-gray-800">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }`,
      },
      "lib/": {
        "formatDate.ts": `export function formatDate(dateString: string) {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).format(date);
          }`,
        "markdownToHtml.ts": `import { marked } from 'marked';
            import DOMPurify from 'isomorphic-dompurify';
            
            export function markdownToHtml(markdown: string) {
              const html = marked(markdown);
              return DOMPurify.sanitize(html);
            }`,
        "posts.ts": `import { db } from './db';
            
            export async function getAllPosts() {
              return db.post.findMany({
                orderBy: { createdAt: 'desc' },
                include: { author: true },
              });
            }
            
            export async function getPostBySlug(slug: string) {
              return db.post.findUnique({
                where: { slug },
                include: { author: true },
              });
            }
            
            export async function createPost(data) {
              return db.post.create({
                data,
                include: { author: true },
              });
            }
            
            export async function updatePost(slug: string, data) {
              return db.post.update({
                where: { slug },
                data,
                include: { author: true },
              });
            }
            
            export async function deletePost(slug: string) {
              return db.post.delete({
                where: { slug },
              });
            }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
            @tailwind components;
            @tailwind utilities;
            
            .prose img {
              @apply rounded-lg shadow-md;
            }
            
            .prose a {
              @apply text-blue-600 hover:text-blue-800;
            }`,
      },
    },
  },

  "tech-website": {
    "src/": {
      "app/": {
        "layout.tsx": `import Header from '@/components/Header';
          import Footer from '@/components/Footer';
          
          export default function RootLayout({ children }) {
            return (
              <html lang="en">
                <body>
                  <Header />
                  {children}
                  <Footer />
                </body>
              </html>
            );
          }`,
        "page.tsx": `import Hero from '@/components/Hero';
          import ProductShowcase from '@/components/ProductShowcase';
          import Solutions from '@/components/Solutions';
          import FeatureHighlight from '@/components/FeatureHighlight';
          import CTASection from '@/components/CTASection';
          
          export default function Home() {
            return (
              <main>
                <Hero />
                <ProductShowcase />
                <Solutions />
                <FeatureHighlight />
                <CTASection />
              </main>
            );
          }`,
        "products/": {
          "page.tsx": `import { getAllProducts } from '@/lib/api';
            import ProductGrid from '@/components/ProductGrid';
            import ProductFilters from '@/components/ProductFilters';
            
            export default async function ProductsPage() {
              const products = await getAllProducts();
              
              return (
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold mb-8">Our Products</h1>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                      <ProductFilters />
                    </aside>
                    <main className="lg:col-span-3">
                      <ProductGrid products={products} />
                    </main>
                  </div>
                </div>
              );
            }`,
          "[id]/": {
            "page.tsx": `import { getProductById } from '@/lib/api';
              import TechSpecs from '@/components/TechSpecs';
              import ProductGallery from '@/components/ProductGallery';
              import RelatedProducts from '@/components/RelatedProducts';
              
              export default async function ProductPage({ params }) {
                const product = await getProductById(params.id);
                
                return (
                  <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <ProductGallery images={product.images} />
                      <div>
                        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                        <p className="text-xl text-gray-600 mb-6">{product.description}</p>
                        <TechSpecs specs={product.specifications} />
                        <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-8">
                          Request Demo
                        </button>
                      </div>
                    </div>
                    <RelatedProducts categoryId={product.categoryId} />
                  </div>
                );
              }`,
          },
        },
        "solutions/": {
          "page.tsx": `import { getAllSolutions } from '@/lib/api';
            import SolutionCard from '@/components/SolutionCard';
            import CaseStudies from '@/components/CaseStudies';
            
            export default async function SolutionsPage() {
              const solutions = await getAllSolutions();
              
              return (
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold mb-8">Enterprise Solutions</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map(solution => (
                      <SolutionCard key={solution.id} solution={solution} />
                    ))}
                  </div>
                  <CaseStudies />
                </div>
              );
            }`,
          "[id]/": {
            "page.tsx": `import { getSolutionById } from '@/lib/api';
              import SolutionOverview from '@/components/SolutionOverview';
              import BenefitsList from '@/components/BenefitsList';
              import IntegrationSection from '@/components/IntegrationSection';
              
              export default async function SolutionPage({ params }) {
                const solution = await getSolutionById(params.id);
                
                return (
                  <div className="container mx-auto px-4 py-8">
                    <SolutionOverview solution={solution} />
                    <BenefitsList benefits={solution.benefits} />
                    <IntegrationSection integrations={solution.integrations} />
                  </div>
                );
              }`,
          },
        },
        "about/": {
          "page.tsx": `import TeamSection from '@/components/TeamSection';
            import Timeline from '@/components/Timeline';
            import Values from '@/components/Values';
            
            export default function AboutPage() {
              return (
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold mb-8">About Us</h1>
                  <Values />
                  <Timeline />
                  <TeamSection />
                </div>
              );
            }`,
        },
        "contact/": {
          "page.tsx": `import ContactForm from '@/components/ContactForm';
            import ContactInfo from '@/components/ContactInfo';
            import LocationMap from '@/components/LocationMap';
            
            export default function ContactPage() {
              return (
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <ContactForm />
                    <div>
                      <ContactInfo />
                      <LocationMap />
                    </div>
                  </div>
                </div>
              );
            }`,
        },
      },
      "components/": {
        "Header.tsx": `'use client';
          import { useState } from 'react';
          import Link from 'next/link';
          import { Menu, X } from 'lucide-react';
          
          export default function Header() {
            const [isMenuOpen, setIsMenuOpen] = useState(false);
            
            return (
              <header className="bg-white shadow-sm">
                <nav className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold">TechCo</Link>
                    
                    <button
                      className="lg:hidden"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                      {isMenuOpen ? <X /> : <Menu />}
                    </button>
                    
                    <div className={'lg:flex space-x-8 ' + (isMenuOpen ? 'block' : 'hidden')}>
                      <Link href="/products" className="hover:text-blue-600">Products</Link>
                      <Link href="/solutions" className="hover:text-blue-600">Solutions</Link>
                      <Link href="/about" className="hover:text-blue-600">About</Link>
                      <Link href="/contact" className="hover:text-blue-600">Contact</Link>
                    </div>
                  </div>
                </nav>
              </header>
            );
          }`,
        "Hero.tsx": `export default function Hero() {
            return (
              <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <h1 className="text-5xl font-bold mb-6">
                      Innovation for the Future
                    </h1>
                    <p className="text-xl mb-8">
                      Leading the way in technological advancement with cutting-edge solutions.
                    </p>
                    <div className="space-x-4">
                      <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
                        Get Started
                      </button>
                      <button className="border border-white px-6 py-3 rounded-lg font-semibold">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          }`,
        "ProductShowcase.tsx": `'use client';
          import { useState } from 'react';
          import { Tab } from '@headlessui/react';
          
          export default function ProductShowcase() {
            const categories = ['Hardware', 'Software', 'Services'];
            
            return (
              <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8 text-center">Our Products</h2>
                <Tab.Group>
                  <Tab.List className="flex space-x-4 border-b mb-8">
                    {categories.map((category) => (
                      <Tab
                        key={category}
                        className={({ selected }) =>
                          'px-4 py-2 font-medium focus:outline-none ' +
                          (selected
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700')
                        }
                      >
                        {category}
                      </Tab>
                    ))}
                  </Tab.List>
                  <Tab.Panels>
                    {categories.map((category) => (
                      <Tab.Panel key={category}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Product cards would go here */}
                        </div>
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </section>
            );
          }`,
        "TechSpecs.tsx": `export default function TechSpecs({ specs }) {
            return (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="text-sm text-gray-500 mb-1">{key}</h3>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }`,
        "ContactForm.tsx": `'use client';
          import { useState } from 'react';
          
          export default function ContactForm() {
            const [formData, setFormData] = useState({
              name: '',
              email: '',
              subject: '',
              message: ''
            });
            
            const handleSubmit = async (e) => {
              e.preventDefault();
              // Form submission logic here
            };
            
            return (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                >
                  Send Message
                </button>
              </form>
            );
          }`,
      },
      "lib/": {
        "api.ts": `const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
          export async function getAllProducts() {
            const response = await fetch(\`\${BASE_URL}/products\`);
            return response.json();
          }
          
          export async function getProductById(id: string) {
            const response = await fetch(\`\${BASE_URL}/products/\${id}\`);
            return response.json();
          }
          
          export async function getAllSolutions() {
            const response = await fetch(\`\${BASE_URL}/solutions\`);
            return response.json();
          }
          
          export async function getSolutionById(id: string) {
            const response = await fetch(\`\${BASE_URL}/solutions/\${id}\`);
            return response.json();
          }`,
        "validation.ts": `import * as z from 'zod';
  
          export const contactFormSchema = z.object({
            name: z.string().min(2, 'Name is required'),
            email: z.string().email('Invalid email address'),
            subject: z.string().min(5, 'Subject is required'),
            message: z.string().min(10, 'Message is too short')
          });
          
          export const newsletterSchema = z.object({
            email: z.string().email('Invalid email address')
          });`,
        "analytics.ts": `export function trackPageView(url: string) {
            // Analytics implementation
          }
          
          export function trackEvent(name: string, properties: Record<string, any>) {
            // Event tracking implementation
          }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
          @tailwind components;
          @tailwind utilities;
          
          @layer components {
            .btn-primary {
              @apply bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors;
            }
            
            .btn-secondary {
              @apply border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors;
            }
            
            .input-field {
              @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent;
            }
          }`,
      },
    },
  },

  portfolio: {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
        return (
          <html lang="en">
            <body>{children}</body>
          </html>
        );
      }`,
        "page.tsx": `import Hero from '@/components/Hero';
        import ProductShowcase from '@/components/ProductShowcase';
        import SolutionShowcase from '@/components/SolutionShowcase';
        
        export default function Home() {
          return (
            <main>
              <Hero />
              <ProductShowcase />
              <SolutionShowcase />
            </main>
          );
        }`,
        "products/": {
          "page.tsx": `import ProductGrid from '@/components/ProductGrid';
          import { getAllProducts } from '@/lib/api';
          
          export default async function ProductsPage() {
            const products = await getAllProducts();
            return <ProductGrid products={products} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getProductById } from '@/lib/api';
            import ProductDetails from '@/components/ProductDetails';
            
            export default async function ProductPage({ params }) {
              const product = await getProductById(params.id);
              return <ProductDetails product={product} />;
            }`,
          },
        },
        "solutions/": {
          "page.tsx": `import SolutionGrid from '@/components/SolutionGrid';
          import { getAllSolutions } from '@/lib/api';
          
          export default async function SolutionsPage() {
            const solutions = await getAllSolutions();
            return <SolutionGrid solutions={solutions} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getSolutionById } from '@/lib/api';
            import SolutionDetails from '@/components/SolutionDetails';
            
            export default async function SolutionPage({ params }) {
              const solution = await getSolutionById(params.id);
              return <SolutionDetails solution={solution} />;
            }`,
          },
        },
        "about/": {
          "page.tsx": `import AboutContent from '@/components/AboutContent';
          
          export default function AboutPage() {
            return <AboutContent />;
          }`,
        },
        "contact/": {
          "page.tsx": `import ContactForm from '@/components/ContactForm';
          
          export default function ContactPage() {
            return <ContactForm />;
          }`,
        },
      },
      "components/": {
        "Hero.tsx": `export default function Hero() {
        return (
          <section className="bg-blue-600 text-white py-16">
            <h1 className="text-5xl font-bold">Welcome to Our Portfolio</h1>
            <p className="mt-4 text-lg">Discover our innovative products and solutions.</p>
          </section>
        );
      }`,
        "ProductShowcase.tsx": `export default function ProductShowcase() {
        return (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <div>{/* Product cards here */}</div>
          </section>
        );
      }`,
        "SolutionShowcase.tsx": `export default function SolutionShowcase() {
        return (
          <section className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-4">Our Solutions</h2>
            <div>{/* Solution cards here */}</div>
          </section>
        );
      }`,
        "ProductDetails.tsx": `export default function ProductDetails({ product }) {
        return (
          <section className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p>{product.description}</p>
          </section>
        );
      }`,
        "SolutionDetails.tsx": `export default function SolutionDetails({ solution }) {
        return (
          <section className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold">{solution.name}</h1>
            <p>{solution.description}</p>
          </section>
        );
      }`,
        "AboutContent.tsx": `export default function AboutContent() {
        return (
          <section className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold">About Us</h1>
            <p>We are a team dedicated to innovation.</p>
          </section>
        );
      }`,
        "ContactForm.tsx": `import { useState } from 'react';
        export default function ContactForm() {
          const [form, setForm] = useState({ name: '', email: '', message: '' });
          const handleSubmit = (e) => { e.preventDefault(); /* API logic here */ };
          return (
            <form onSubmit={handleSubmit}>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <textarea placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button type="submit">Send</button>
            </form>
          );
        }`,
      },
      "lib/": {
        "api.ts": `export async function getAllProducts() { /* API logic */ }
        export async function getProductById(id) { /* API logic */ }
        export async function getAllSolutions() { /* API logic */ }
        export async function getSolutionById(id) { /* API logic */ }`,
      },
      "types/": {
        "index.ts": `export interface Product { id: string; name: string; description: string; }
        export interface Solution { id: string; name: string; description: string; }`,
      },
    },
  },

  saas: {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
        return (
          <html lang="en">
            <body>
              <Header />
              {children}
              <Footer />
            </body>
          </html>
        );
      }`,
        "page.tsx": `import Hero from '@/components/Hero';
        import Features from '@/components/Features';
        import Pricing from '@/components/Pricing';
        import Testimonials from '@/components/Testimonials';
        
        export default function Home() {
          return (
            <main>
              <Hero />
              <Features />
              <Pricing />
              <Testimonials />
            </main>
          );
        }`,
        "dashboard/": {
          "layout.tsx": `export default function DashboardLayout({ children }) {
          return (
            <section className="dashboard-layout">
              <Sidebar />
              <main className="dashboard-content">{children}</main>
            </section>
          );
        }`,
          "page.tsx": `export default function DashboardHome() {
          return <Overview />;
        }`,
          "settings/": {
            "page.tsx": `import SettingsForm from '@/components/SettingsForm';
            export default function SettingsPage() {
              return <SettingsForm />;
            }`,
          },
          "analytics/": {
            "page.tsx": `import AnalyticsOverview from '@/components/AnalyticsOverview';
            export default function AnalyticsPage() {
              return <AnalyticsOverview />;
            }`,
          },
        },
        "pricing/": {
          "page.tsx": `import PricingPlans from '@/components/PricingPlans';
          export default function PricingPage() {
            return <PricingPlans />;
          }`,
        },
        "features/": {
          "page.tsx": `import FeatureDetails from '@/components/FeatureDetails';
          export default function FeaturesPage() {
            return <FeatureDetails />;
          }`,
        },
        "about/": {
          "page.tsx": `import AboutContent from '@/components/AboutContent';
          export default function AboutPage() {
            return <AboutContent />;
          }`,
        },
        "contact/": {
          "page.tsx": `import ContactForm from '@/components/ContactForm';
          export default function ContactPage() {
            return <ContactForm />;
          }`,
        },
      },
      "components/": {
        "Header.tsx": `export default function Header() {
        return (
          <header className="bg-gray-800 text-white py-4">
            <nav className="container mx-auto flex justify-between">
              <a href="/" className="text-lg font-bold">SaaS Platform</a>
              <div className="flex space-x-4">
                <a href="/features">Features</a>
                <a href="/pricing">Pricing</a>
                <a href="/dashboard">Dashboard</a>
                <a href="/contact">Contact</a>
              </div>
            </nav>
          </header>
        );
      }`,
        "Footer.tsx": `export default function Footer() {
        return (
          <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 SaaS Platform. All Rights Reserved.</p>
            </div>
          </footer>
        );
      }`,
        "Hero.tsx": `export default function Hero() {
        return (
          <section className="bg-blue-600 text-white py-16">
            <div className="container mx-auto text-center">
              <h1 className="text-5xl font-bold">Revolutionize Your Workflow</h1>
              <p className="mt-4 text-xl">Streamline your business operations with our powerful SaaS platform.</p>
              <div className="mt-6 space-x-4">
                <button className="btn-primary">Get Started</button>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
          </section>
        );
      }`,
        "Features.tsx": `export default function Features() {
        return (
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map feature cards here */}
              </div>
            </div>
          </section>
        );
      }`,
        "Pricing.tsx": `export default function Pricing() {
        return (
          <section className="py-16 bg-white">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map pricing cards here */}
              </div>
            </div>
          </section>
        );
      }`,
        "Testimonials.tsx": `export default function Testimonials() {
        return (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">What Our Clients Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map testimonial cards here */}
              </div>
            </div>
          </section>
        );
      }`,
        "Sidebar.tsx": `export default function Sidebar() {
        return (
          <aside className="w-64 bg-gray-800 text-white">
            <nav className="space-y-2">
              <a href="/dashboard">Overview</a>
              <a href="/dashboard/analytics">Analytics</a>
              <a href="/dashboard/settings">Settings</a>
            </nav>
          </aside>
        );
      }`,
      },
      "lib/": {
        "api.ts": `export async function fetchUserData() { /* API logic */ }
        export async function fetchAnalyticsData() { /* API logic */ }
        export async function fetchPricingPlans() { /* API logic */ }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
        @tailwind components;
        @tailwind utilities;

        .btn-primary {
          @apply bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700;
        }
        .btn-secondary {
          @apply bg-gray-100 text-blue-600 px-6 py-3 rounded hover:bg-gray-200;
        }`,
      },
      "types/": {
        "index.ts": `export interface User { id: string; name: string; email: string; }
        export interface PricingPlan { id: string; name: string; price: number; features: string[]; }`,
      },
    },
  },

  community: {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
        return (
          <html lang="en">
            <body>
              <Header />
              {children}
              <Footer />
            </body>
          </html>
        );
      }`,
        "page.tsx": `import Hero from '@/components/Hero';
        import Categories from '@/components/Categories';
        import PopularThreads from '@/components/PopularThreads';
        
        export default function Home() {
          return (
            <main>
              <Hero />
              <Categories />
              <PopularThreads />
            </main>
          );
        }`,
        "categories/": {
          "page.tsx": `import CategoryList from '@/components/CategoryList';
          import { getAllCategories } from '@/lib/api';
          
          export default async function CategoriesPage() {
            const categories = await getAllCategories();
            return <CategoryList categories={categories} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getCategoryById, getThreadsByCategory } from '@/lib/api';
            import ThreadList from '@/components/ThreadList';
            
            export default async function CategoryPage({ params }) {
              const category = await getCategoryById(params.id);
              const threads = await getThreadsByCategory(params.id);
              return (
                <>
                  <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
                  <ThreadList threads={threads} />
                </>
              );
            }`,
          },
        },
        "threads/": {
          "page.tsx": `import ThreadList from '@/components/ThreadList';
          import { getAllThreads } from '@/lib/api';
          
          export default async function ThreadsPage() {
            const threads = await getAllThreads();
            return <ThreadList threads={threads} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getThreadById, getCommentsByThread } from '@/lib/api';
            import ThreadDetails from '@/components/ThreadDetails';
            import CommentSection from '@/components/CommentSection';
            
            export default async function ThreadPage({ params }) {
              const thread = await getThreadById(params.id);
              const comments = await getCommentsByThread(params.id);
              return (
                <>
                  <ThreadDetails thread={thread} />
                  <CommentSection comments={comments} threadId={params.id} />
                </>
              );
            }`,
          },
        },
        "profile/": {
          "[id]/": {
            "page.tsx": `import { getUserProfile } from '@/lib/api';
            import UserProfile from '@/components/UserProfile';
            
            export default async function ProfilePage({ params }) {
              const user = await getUserProfile(params.id);
              return <UserProfile user={user} />;
            }`,
          },
        },
      },
      "components/": {
        "Header.tsx": `export default function Header() {
        return (
          <header className="bg-gray-800 text-white py-4">
            <nav className="container mx-auto flex justify-between">
              <a href="/" className="text-lg font-bold">Community Forum</a>
              <div className="flex space-x-4">
                <a href="/categories">Categories</a>
                <a href="/threads">Threads</a>
                <a href="/profile">Profile</a>
              </div>
            </nav>
          </header>
        );
      }`,
        "Footer.tsx": `export default function Footer() {
        return (
          <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 Community Forum. All Rights Reserved.</p>
            </div>
          </footer>
        );
      }`,
        "Hero.tsx": `export default function Hero() {
        return (
          <section className="bg-blue-600 text-white py-16">
            <div className="container mx-auto text-center">
              <h1 className="text-5xl font-bold">Welcome to the Community</h1>
              <p className="mt-4 text-xl">Join discussions, share knowledge, and connect with others.</p>
            </div>
          </section>
        );
      }`,
        "Categories.tsx": `export default function Categories() {
        return (
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map categories here */}
              </div>
            </div>
          </section>
        );
      }`,
        "PopularThreads.tsx": `export default function PopularThreads() {
        return (
          <section className="py-16 bg-white">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Popular Threads</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map popular threads here */}
              </div>
            </div>
          </section>
        );
      }`,
        "ThreadDetails.tsx": `export default function ThreadDetails({ thread }) {
        return (
          <section className="py-8">
            <h1 className="text-3xl font-bold">{thread.title}</h1>
            <p className="mt-4 text-gray-600">{thread.content}</p>
          </section>
        );
      }`,
        "CommentSection.tsx": `export default function CommentSection({ comments, threadId }) {
        return (
          <section className="py-8">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            {/* Map comments */}
            <form>{/* Add comment form */}</form>
          </section>
        );
      }`,
        "UserProfile.tsx": `export default function UserProfile({ user }) {
        return (
          <section className="py-8">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="mt-4 text-gray-600">Email: {user.email}</p>
          </section>
        );
      }`,
      },
      "lib/": {
        "api.ts": `export async function getAllCategories() { /* Fetch categories */ }
        export async function getCategoryById(id) { /* Fetch category by ID */ }
        export async function getAllThreads() { /* Fetch all threads */ }
        export async function getThreadsByCategory(categoryId) { /* Fetch threads by category */ }
        export async function getThreadById(id) { /* Fetch thread by ID */ }
        export async function getCommentsByThread(threadId) { /* Fetch comments by thread */ }
        export async function getUserProfile(userId) { /* Fetch user profile */ }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
        @tailwind components;
        @tailwind utilities;

        .btn-primary {
          @apply bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700;
        }
        .btn-secondary {
          @apply bg-gray-100 text-blue-600 px-6 py-3 rounded hover:bg-gray-200;
        }`,
      },
      "types/": {
        "index.ts": `export interface User { id: string; name: string; email: string; }
        export interface Category { id: string; name: string; description: string; }
        export interface Thread { id: string; title: string; content: string; categoryId: string; }
        export interface Comment { id: string; content: string; userId: string; threadId: string; }`,
      },
    },
  },

  learning: {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
        return (
          <html lang="en">
            <body>
              <Header />
              {children}
              <Footer />
            </body>
          </html>
        );
      }`,
        "page.tsx": `import Hero from '@/components/Hero';
        import FeaturedCourses from '@/components/FeaturedCourses';
        import Testimonials from '@/components/Testimonials';
        
        export default function Home() {
          return (
            <main>
              <Hero />
              <FeaturedCourses />
              <Testimonials />
            </main>
          );
        }`,
        "courses/": {
          "page.tsx": `import CourseList from '@/components/CourseList';
          import { getAllCourses } from '@/lib/api';
          
          export default async function CoursesPage() {
            const courses = await getAllCourses();
            return <CourseList courses={courses} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getCourseById, getLessonsByCourse } from '@/lib/api';
            import CourseDetails from '@/components/CourseDetails';
            import LessonList from '@/components/LessonList';
            
            export default async function CoursePage({ params }) {
              const course = await getCourseById(params.id);
              const lessons = await getLessonsByCourse(params.id);
              return (
                <>
                  <CourseDetails course={course} />
                  <LessonList lessons={lessons} />
                </>
              );
            }`,
          },
        },
        "lessons/": {
          "[id]/": {
            "page.tsx": `import { getLessonById } from '@/lib/api';
            import LessonDetails from '@/components/LessonDetails';
            
            export default async function LessonPage({ params }) {
              const lesson = await getLessonById(params.id);
              return <LessonDetails lesson={lesson} />;
            }`,
          },
        },
        "dashboard/": {
          "layout.tsx": `export default function DashboardLayout({ children }) {
          return (
            <section className="dashboard-layout">
              <Sidebar />
              <main className="dashboard-content">{children}</main>
            </section>
          );
        }`,
          "page.tsx": `export default function DashboardHome() {
          return <UserProgress />;
        }`,
          "enrollments/": {
            "page.tsx": `import EnrolledCourses from '@/components/EnrolledCourses';
            export default function EnrollmentsPage() {
              return <EnrolledCourses />;
            }`,
          },
          "profile/": {
            "page.tsx": `import ProfileSettings from '@/components/ProfileSettings';
            export default function ProfilePage() {
              return <ProfileSettings />;
            }`,
          },
        },
      },
      "components/": {
        "Header.tsx": `export default function Header() {
        return (
          <header className="bg-gray-800 text-white py-4">
            <nav className="container mx-auto flex justify-between">
              <a href="/" className="text-lg font-bold">LMS</a>
              <div className="flex space-x-4">
                <a href="/courses">Courses</a>
                <a href="/dashboard">Dashboard</a>
              </div>
            </nav>
          </header>
        );
      }`,
        "Footer.tsx": `export default function Footer() {
        return (
          <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 LMS. All Rights Reserved.</p>
            </div>
          </footer>
        );
      }`,
        "Hero.tsx": `export default function Hero() {
        return (
          <section className="bg-blue-600 text-white py-16">
            <div className="container mx-auto text-center">
              <h1 className="text-5xl font-bold">Learn Anytime, Anywhere</h1>
              <p className="mt-4 text-xl">Explore thousands of courses and grow your skills.</p>
            </div>
          </section>
        );
      }`,
        "FeaturedCourses.tsx": `export default function FeaturedCourses() {
        return (
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Featured Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map featured courses here */}
              </div>
            </div>
          </section>
        );
      }`,
        "CourseDetails.tsx": `export default function CourseDetails({ course }) {
        return (
          <section className="py-8">
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="mt-4 text-gray-600">{course.description}</p>
          </section>
        );
      }`,
        "LessonDetails.tsx": `export default function LessonDetails({ lesson }) {
        return (
          <section className="py-8">
            <h1 className="text-3xl font-bold">{lesson.title}</h1>
            <p className="mt-4 text-gray-600">{lesson.content}</p>
          </section>
        );
      }`,
        "UserProgress.tsx": `export default function UserProgress() {
        return (
          <section className="py-8">
            <h2 className="text-3xl font-bold mb-4">Your Progress</h2>
            {/* Progress tracker implementation */}
          </section>
        );
      }`,
        "Sidebar.tsx": `export default function Sidebar() {
        return (
          <aside className="w-64 bg-gray-800 text-white">
            <nav className="space-y-2">
              <a href="/dashboard">Overview</a>
              <a href="/dashboard/enrollments">Enrollments</a>
              <a href="/dashboard/profile">Profile</a>
            </nav>
          </aside>
        );
      }`,
      },
      "lib/": {
        "api.ts": `export async function getAllCourses() { /* Fetch all courses */ }
        export async function getCourseById(id) { /* Fetch course by ID */ }
        export async function getLessonsByCourse(courseId) { /* Fetch lessons by course ID */ }
        export async function getLessonById(id) { /* Fetch lesson by ID */ }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
        @tailwind components;
        @tailwind utilities;

        .btn-primary {
          @apply bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700;
        }
        .btn-secondary {
          @apply bg-gray-100 text-blue-600 px-6 py-3 rounded hover:bg-gray-200;
        }`,
      },
      "types/": {
        "index.ts": `export interface Course { id: string; name: string; description: string; }
        export interface Lesson { id: string; title: string; content: string; courseId: string; }
        export interface User { id: string; name: string; email: string; }`,
      },
    },
  },

  news: {
    "src/": {
      "app/": {
        "layout.tsx": `export default function RootLayout({ children }) {
        return (
          <html lang="en">
            <body>
              <Header />
              {children}
              <Footer />
            </body>
          </html>
        );
      }`,
        "page.tsx": `import Hero from '@/components/Hero';
        import TrendingArticles from '@/components/TrendingArticles';
        import Categories from '@/components/Categories';
        
        export default function Home() {
          return (
            <main>
              <Hero />
              <TrendingArticles />
              <Categories />
            </main>
          );
        }`,
        "categories/": {
          "page.tsx": `import CategoryList from '@/components/CategoryList';
          import { getAllCategories } from '@/lib/api';
          
          export default async function CategoriesPage() {
            const categories = await getAllCategories();
            return <CategoryList categories={categories} />;
          }`,
          "[id]/": {
            "page.tsx": `import { getCategoryById, getArticlesByCategory } from '@/lib/api';
            import ArticleList from '@/components/ArticleList';
            
            export default async function CategoryPage({ params }) {
              const category = await getCategoryById(params.id);
              const articles = await getArticlesByCategory(params.id);
              return (
                <>
                  <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
                  <ArticleList articles={articles} />
                </>
              );
            }`,
          },
        },
        "articles/": {
          "[id]/": {
            "page.tsx": `import { getArticleById } from '@/lib/api';
            import ArticleDetails from '@/components/ArticleDetails';
            
            export default async function ArticlePage({ params }) {
              const article = await getArticleById(params.id);
              return <ArticleDetails article={article} />;
            }`,
          },
        },
        "search/": {
          "page.tsx": `import { searchArticles } from '@/lib/api';
          import ArticleList from '@/components/ArticleList';
          
          export default async function SearchPage({ searchParams }) {
            const results = await searchArticles(searchParams.query);
            return (
              <div>
                <h1 className="text-3xl font-bold mb-4">Search Results</h1>
                <ArticleList articles={results} />
              </div>
            );
          }`,
        },
      },
      "components/": {
        "Header.tsx": `export default function Header() {
        return (
          <header className="bg-gray-800 text-white py-4">
            <nav className="container mx-auto flex justify-between">
              <a href="/" className="text-lg font-bold">News Portal</a>
              <div className="flex space-x-4">
                <a href="/categories">Categories</a>
                <a href="/search">Search</a>
              </div>
            </nav>
          </header>
        );
      }`,
        "Footer.tsx": `export default function Footer() {
        return (
          <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto text-center">
              <p>&copy; 2024 News Portal. All Rights Reserved.</p>
            </div>
          </footer>
        );
      }`,
        "Hero.tsx": `export default function Hero() {
        return (
          <section className="bg-blue-600 text-white py-16">
            <div className="container mx-auto text-center">
              <h1 className="text-5xl font-bold">Stay Informed</h1>
              <p className="mt-4 text-xl">Your daily source of trusted news and updates.</p>
            </div>
          </section>
        );
      }`,
        "TrendingArticles.tsx": `export default function TrendingArticles() {
        return (
          <section className="py-16 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-6">Trending Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Map trending articles here */}
              </div>
            </div>
          </section>
        );
      }`,
        "ArticleDetails.tsx": `export default function ArticleDetails({ article }) {
        return (
          <section className="py-8">
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <p className="mt-4 text-gray-600">{article.content}</p>
            <p className="mt-4 text-sm text-gray-500">Published on {article.publishedDate}</p>
          </section>
        );
      }`,
        "ArticleList.tsx": `export default function ArticleList({ articles }) {
        return (
          <ul>
            {articles.map((article) => (
              <li key={article.id} className="mb-4">
                <a href={\`/articles/\${article.id}\`} className="text-blue-600 hover:underline">
                  {article.title}
                </a>
              </li>
            ))}
          </ul>
        );
      }`,
      },
      "lib/": {
        "api.ts": `export async function getAllCategories() { /* Fetch all categories */ }
        export async function getCategoryById(id) { /* Fetch category by ID */ }
        export async function getArticlesByCategory(categoryId) { /* Fetch articles by category */ }
        export async function getArticleById(id) { /* Fetch article by ID */ }
        export async function searchArticles(query) { /* Search articles */ }`,
      },
      "styles/": {
        "globals.css": `@tailwind base;
        @tailwind components;
        @tailwind utilities;

        .btn-primary {
          @apply bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700;
        }
        .btn-secondary {
          @apply bg-gray-100 text-blue-600 px-6 py-3 rounded hover:bg-gray-200;
        }`,
      },
      "types/": {
        "index.ts": `export interface Article { id: string; title: string; content: string; publishedDate: string; }
        export interface Category { id: string; name: string; description: string; }`,
      },
    },
  },
};
