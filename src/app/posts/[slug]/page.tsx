import { getPostBySlug } from '@/lib/posts';

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
}