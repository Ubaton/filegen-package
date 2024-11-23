import Link from 'next/link';
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
                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
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
}