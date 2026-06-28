import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { GradientImg, Icon } from '../shared/UI';

export const CheckoutPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { cartItems } = useContext(AppContext);

  const subtotal = cartItems.reduce((acc, i) => acc + parseFloat(i.price.replace(/[^\d.-]/g, '')) * i.qty, 0);
  const shipping: number = subtotal > 0 ? 0 : 0; // Free shipping
  const total = subtotal + shipping;

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen text-[#1A1A1A]" style={{ backgroundColor: '#F7F3EF' }}>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-20 flex flex-col items-center justify-center text-center">
          <Icon name="shopping_bag" size={64} className="text-[rgba(109,15,49,0.15)] mb-6" />
          <h1 className="text-[32px] font-bold text-[#1A1A1A] mb-4" style={syne}>Your cart is empty</h1>
          <p className="text-[#5C5C5C] mb-8" style={font}>Add some items to your cart before checking out.</p>
          <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-[#950606] text-white text-[14px] font-semibold uppercase tracking-wider rounded hover:bg-[#950606] transition-colors" style={font}>Back to Shop</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-[#1A1A1A] bg-white">

      {/* Left Column: Forms */}
      <main className="flex-1 md:w-3/5 lg:w-1/2 md:flex md:justify-end px-6 md:px-12 py-10">
        <div className="w-full max-w-xl md:pr-8">

          {/* Header */}
          <div className="mb-10">
            <Link to="/" className="text-[32px] font-bold tracking-tighter" style={syne}>
              <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span>
            </Link>
            <div className="flex items-center gap-2 mt-4 text-[12px] text-[#5C5C5C]" style={font}>
              <Link to="/shop" className="hover:text-[#950606] transition-colors">Cart</Link>
              <Icon name="chevron_right" size={14} />
              <span className="font-semibold text-[#1A1A1A]">Information & Shipping</span>
              <Icon name="chevron_right" size={14} />
              <span className="opacity-50">Payment</span>
            </div>
          </div>

          {/* Express Checkout */}
          <div className="mb-8">
            <p className="text-center text-[12px] text-[#5C5C5C] mb-4" style={font}>Express checkout</p>
            <div className="flex gap-4 justify-center">
              <button className="flex-1 h-12 rounded bg-[#5a31f4] text-white flex items-center justify-center hover:opacity-80 transition-opacity font-bold" style={font}>
                UPI Pay
              </button>
              <button className="flex-1 h-12 rounded bg-[#950606] text-white flex items-center justify-center hover:opacity-80 transition-opacity font-bold" style={font}>
                Bank Transfer
              </button>
            </div>
          </div>

          <div className="relative flex items-center py-5 mb-8">
            <div className="flex-grow border-t border-[rgba(109,15,49,0.15)]"></div>
            <span className="flex-shrink-0 mx-4 text-[#5C5C5C] text-[12px]" style={font}>OR</span>
            <div className="flex-grow border-t border-[rgba(109,15,49,0.15)]"></div>
          </div>

          {/* Forms */}
          <form className="space-y-8" onSubmit={e => e.preventDefault()}>

            {/* Contact */}
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-4" style={syne}>Contact</h2>
              <input type="email" placeholder="Email or mobile phone number" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
              <div className="flex items-center gap-2 mt-3">
                <input type="checkbox" id="news" className="accent-[#950606] w-4 h-4 rounded border-[rgba(109,15,49,0.15)]" />
                <label htmlFor="news" className="text-[14px] text-[#5C5C5C]" style={font}>Email me with news and offers</label>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-4" style={syne}>Shipping address</h2>
              <div className="space-y-4">
                <select className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all appearance-none" style={font}>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First name" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                  <input type="text" placeholder="Last name" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                </div>
                <input type="text" placeholder="Address" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                <div className="grid grid-cols-3 gap-4">
                  <input type="text" placeholder="City" className="col-span-1 w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                  <select className="col-span-1 w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all appearance-none" style={font}>
                    <option>State</option>
                    <option>Maharashtra</option>
                    <option>Delhi</option>
                    <option>Karnataka</option>
                  </select>
                  <input type="text" placeholder="PIN code" className="col-span-1 w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
                </div>
                <input type="tel" placeholder="Phone" className="w-full bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all" style={font} />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <Link to="/shop" className="text-[14px] text-[#950606] hover:underline hidden md:block" style={font}>&lt; Return to shop</Link>
              <button
                onClick={() => navigate('/payment')}
                className="w-full md:w-auto px-8 py-4 bg-[#950606] text-white text-[15px] font-semibold rounded-lg hover:bg-[#950606] transition-colors"
                style={{ ...font, boxShadow: '0 4px 14px 0 rgba(170, 48, 0, 0.39)' }}
              >
                Proceed to payment
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* Right Column: Summary */}
      <aside className="md:w-2/5 lg:w-1/2 bg-[#faf7f5] border-l border-[rgba(109,15,49,0.15)] px-6 md:px-12 py-10 md:min-h-screen border-t md:border-t-0">
        <div className="w-full max-w-lg md:pl-8 sticky top-10">

          {/* Cart Items */}
          <div className="space-y-4 mb-8">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-lg overflow-visible bg-white border border-[rgba(109,15,49,0.15)] shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <GradientImg gradient={item.gradient} className="h-full w-full" />
                    )}
                  </div>
                  {/* Badge */}
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold z-10" style={font}>
                    {item.qty}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight" style={font}>{item.name}</p>
                  <p className="text-[12px] text-[#5C5C5C] mt-1" style={font}>Size: M / Stealth</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-medium text-[#1A1A1A]" style={font}>{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Discount Code */}
          <div className="flex gap-3 mb-8 border-y border-[rgba(109,15,49,0.15)] py-6">
            <input type="text" placeholder="Discount code" className="flex-1 bg-white border border-[rgba(109,15,49,0.15)] px-4 py-3.5 text-[14px] rounded-lg focus:outline-none focus:border-[#950606] focus:ring-1 focus:ring-[#950606] transition-all uppercase" style={font} />
            <button className="px-6 py-3.5 bg-[rgba(109,15,49,0.15)] text-[#5C5C5C] text-[14px] font-semibold rounded-lg hover:bg-[#d6aba0] transition-colors" style={font}>Apply</button>
          </div>

          {/* Bill Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-[#5C5C5C] text-[14px]" style={font}>
              <span>Subtotal</span>
              <span className="font-medium text-[#1A1A1A]">â‚¹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#5C5C5C] text-[14px]" style={font}>
              <span>Shipping</span>
              <span className="text-[12px]">{shipping === 0 ? 'Calculated at next step' : `â‚¹${shipping.toLocaleString('en-IN')}`}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[rgba(109,15,49,0.15)]">
            <span className="text-[16px] font-semibold text-[#1A1A1A]" style={font}>Total</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#5C5C5C]" style={font}>INR</span>
              <span className="text-[24px] font-bold text-[#1A1A1A]" style={font}>â‚¹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>
      </aside>

    </div>
  );
};
