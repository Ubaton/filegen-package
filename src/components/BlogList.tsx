import Link from 'next/link';
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
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
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
}