"use client";

import { useCart } from "@/app/context/CartContext";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white text-center">
        Checkout
      </h1>

      {cart.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-400 text-center">
          Your cart is empty
        </p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="border p-4 mb-3 rounded flex justify-between"
            >
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                {/* <p>Speed: {item.speed}</p> */}
                <p>Price: ₹{item.price}</p>
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="bg-black text-white px-4 py-2 mt-4"
          >
            Clear Cart
          </button>
        </>
      )}
    </div>
  );
}