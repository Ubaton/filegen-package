export default {
"blog-post": {
  "src/": {
    "app/": {
      "layout.tsx": `
      import React from "react"

      export default function RootLayout({ children }) {
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
};