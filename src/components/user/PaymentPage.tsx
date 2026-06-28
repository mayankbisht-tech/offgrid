import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { Footer } from '../shared/Footer';

const parsePrice = (price: string) => Number.parseFloat(price.replace(/[^\d.-]/g, '')) || 0;

export const PaymentPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { cartItems, clearCart } = useContext(AppContext);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const subtotal = cartItems.reduce((acc, item) => acc + parsePrice(item.price) * item.qty, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/payments/details?method=${paymentMethod}`);
      const details = await response.json();
      setPaymentDetails(details);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeOrder = () => {
    clearCart();
    navigate('/dashboard');
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col text-[#1A1A1A]" style={{ backgroundColor: '#F7F3EF' }}>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-[32px] font-bold text-[#1A1A1A] mb-4" style={syne}>
            Your cart is empty
          </h1>
          <p className="text-[#5C5C5C] mb-8" style={font}>
            Add some items to your cart before proceeding to payment.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3 bg-[#950606] text-white text-[14px] font-semibold uppercase tracking-wider rounded hover:bg-[#950606] transition-colors"
            style={font}
          >
            Back to Shop
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-[#1A1A1A] bg-white">
      <div className="flex-1 flex flex-col md:flex-row">
        <main className="flex-1 md:w-3/5 lg:w-1/2 md:flex md:justify-end px-6 md:px-12 py-10">
          <div className="w-full max-w-xl md:pr-8">
            <div className="mb-10">
              <h1 className="text-[32px] font-bold tracking-tighter text-[#950606] mb-2" style={syne}>
                PAYMENT
              </h1>
              <div className="flex items-center gap-2 mt-4 text-[12px] text-[#5C5C5C]" style={font}>
                <span>Information</span>
                <span className="text-[#950606]">-&gt;</span>
                <span className="font-semibold text-[#1A1A1A]">Payment</span>
              </div>
            </div>

            {!paymentDetails ? (
              <>
                <div className="mb-8">
                  <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-4" style={syne}>
                    Payment Method
                  </h2>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 border border-[rgba(109,15,49,0.15)] rounded-lg cursor-pointer hover:border-[#950606] transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="w-5 h-5 text-[#950606] focus:ring-[#950606]"
                      />
                      <span className="text-[16px] font-medium" style={font}>
                        UPI (PhonePe, Google Pay, Paytm, etc.)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-[rgba(109,15,49,0.15)] rounded-lg cursor-pointer hover:border-[#950606] transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="w-5 h-5 text-[#950606] focus:ring-[#950606]"
                      />
                      <span className="text-[16px] font-medium" style={font}>
                        Bank Transfer (NEFT/RTGS/IMPS)
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full px-8 py-4 bg-[#950606] text-white text-[15px] font-semibold rounded-lg hover:bg-[#950606] transition-colors disabled:opacity-50"
                  style={{ ...font, boxShadow: '0 4px 14px 0 rgba(170, 48, 0, 0.39)' }}
                >
                  {isProcessing ? 'Processing...' : 'Continue with Payment'}
                </button>
              </>
            ) : (
              <div className="bg-[#faf7f5] border border-[rgba(109,15,49,0.15)] rounded-lg p-6">
                <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-4" style={syne}>
                  Payment Instructions
                </h2>

                {paymentMethod === 'upi' ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        UPI ID:
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-[rgba(109,15,49,0.15)] px-2 py-1 rounded text-[12px] font-mono" style={font}>
                          {paymentDetails.upiId}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(paymentDetails.upiId)}
                          className="text-[#950606] text-[12px] hover:underline"
                          style={font}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Amount:
                      </p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]" style={font}>
                        INR {total.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Instructions:
                      </p>
                      <p className="text-[14px] text-[#5C5C5C]" style={font}>
                        {paymentDetails.instructions}
                      </p>
                    </div>

                    <p className="text-[12px] text-[#5C5C5C] pt-4" style={font}>
                      After completing the payment, your order will be processed within 24 hours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Bank Name:
                      </p>
                      <p className="text-[16px] font-medium" style={font}>
                        {paymentDetails.bankName}
                      </p>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Account Number:
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-[rgba(109,15,49,0.15)] px-2 py-1 rounded text-[12px] font-mono" style={font}>
                          {paymentDetails.accountNumber}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(paymentDetails.accountNumber)}
                          className="text-[#950606] text-[12px] hover:underline"
                          style={font}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        IFSC Code:
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="bg-[rgba(109,15,49,0.15)] px-2 py-1 rounded text-[12px] font-mono" style={font}>
                          {paymentDetails.ifscCode}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(paymentDetails.ifscCode)}
                          className="text-[#950606] text-[12px] hover:underline"
                          style={font}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Amount:
                      </p>
                      <p className="text-[24px] font-bold text-[#1A1A1A]" style={font}>
                        INR {total.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg p-4">
                      <p className="text-[14px] font-medium mb-2" style={font}>
                        Instructions:
                      </p>
                      <p className="text-[14px] text-[#5C5C5C]" style={font}>
                        {paymentDetails.instructions}
                      </p>
                    </div>

                    <p className="text-[12px] text-[#5C5C5C] pt-4" style={font}>
                      After completing the transfer, your order will be processed within 24 hours.
                    </p>
                  </div>
                )}

                <button
                  onClick={completeOrder}
                  className="w-full mt-6 px-8 py-4 bg-[#950606] text-white text-[15px] font-semibold rounded-lg hover:bg-[#950606] transition-colors"
                  style={{ ...font, boxShadow: '0 4px 14px 0 rgba(170, 48, 0, 0.39)' }}
                >
                  Complete Order
                </button>
              </div>
            )}
          </div>
        </main>

        <aside className="md:w-2/5 lg:w-1/2 bg-[#faf7f5] border-l border-[rgba(109,15,49,0.15)] px-6 md:px-12 py-10 md:min-h-screen border-t md:border-t-0">
          <div className="w-full max-w-lg md:pl-8 sticky top-10">
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-6" style={syne}>
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <div className="relative w-16 h-16 rounded-lg overflow-visible bg-white border border-[rgba(109,15,49,0.15)] shrink-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-[10px] text-gray-500" style={font}>
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold z-10"
                      style={font}
                    >
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#1A1A1A] leading-tight" style={font}>
                      {item.name}
                    </p>
                    <p className="text-[12px] text-[#5C5C5C] mt-1" style={font}>
                      Size: M
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-medium text-[#1A1A1A]" style={font}>
                      {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-[rgba(109,15,49,0.15)] pt-6">
              <div className="flex justify-between text-[#5C5C5C] text-[14px]" style={font}>
                <span>Subtotal</span>
                <span className="font-medium text-[#1A1A1A]">INR {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#5C5C5C] text-[14px]" style={font}>
                <span>Shipping</span>
                <span className="text-[12px]">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-[rgba(109,15,49,0.15)]">
              <span className="text-[16px] font-semibold text-[#1A1A1A]" style={font}>
                Total
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#5C5C5C]" style={font}>
                  INR
                </span>
                <span className="text-[24px] font-bold text-[#1A1A1A]" style={font}>
                  INR {total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};
