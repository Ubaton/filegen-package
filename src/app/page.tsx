import BlogList from '@/components/BlogList';
import FeaturedPosts from '@/components/FeaturedPosts';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Blog</h1>
      <FeaturedPosts />
      <BlogList />
    </main>
  );
}