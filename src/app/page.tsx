import Products from '@/components/Products';
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
}