export interface Author {
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
}