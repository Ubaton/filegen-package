import { Post } from '@/types';

export function getPosts(): Post[] {
  // Implement your data fetching logic here
  return [];
}

export function getFeaturedPosts(): Post[] {
  return getPosts().filter((post) => post.featured);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}