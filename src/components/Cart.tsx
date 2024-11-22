'use client';
import { useCart } from '@/hooks/useCart';

export default function Cart() {
  const { items, removeFromCart, updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 mb-4">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-600">${item.price}</p>
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
      ))}
      <div className="border-t pt-4 mt-4">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <button className="w-full bg-green-500 text-white py-2 rounded mt-4 hover:bg-green-600">
          Checkout
        </button>
      </div>
    </div>
  );
}