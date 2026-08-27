import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setGeneratedPin(null);

    if (!stripe || !elements) {
      setErrorMsg("Please complete payment first to generate pin.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMsg("Please complete payment first to generate pin.");
      return;
    }

    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName,
      },
    });

    if (error) {
      setErrorMsg(error.message || "Your card was declined.");
      setLoading(false);
    } else if (paymentMethod) {
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPin(randomPin);
      setLoading(false);
    } else {
      setErrorMsg("Please complete payment first to generate pin.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="cardholder-name" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
          Cardholder Name
        </label>
        <input
          id="cardholder-name"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Jane Doe"
          required
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
          Card Details
        </label>
        <div style={{ padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px', background: '#fafafa' }}>
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#424770' } } }} />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={!stripe || loading}
        style={{ width: '100%', padding: '12px', background: '#635bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
      >
        {loading ? 'Processing...' : 'Pay & Generate PIN'}
      </button>

      {errorMsg && (
        <div style={{ marginTop: '16px', padding: '10px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: '4px', color: '#cf1322', fontSize: '14px', fontWeight: '500' }}>
          Error: {errorMsg}
        </div>
      )}

      {generatedPin && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#389e0d', fontWeight: 'bold' }}>Payment Successful!</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '22px', letterSpacing: '2px', color: '#237804' }}>
            <strong>{generatedPin}</strong>
          </p>
        </div>
      )}
    </form>
  );
};

export default function App() {
  const [publishableKey, setPublishableKey] = useState('');
  const [stripePromise, setStripePromise] = useState<any>(null);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (publishableKey.trim()) {
      setStripePromise(loadStripe(publishableKey.trim()));
    }
  };

  if (!stripePromise) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Enter Stripe Key</h2>
          <form onSubmit={handleKeySubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="stripe-key-input" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#333', fontWeight: '500' }}>
                Publishable Key
              </label>
              <input
                id="stripe-key-input"
                type="text"
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_test_..."
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#635bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
            >
              Start Checkout
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '420px', width: '100%', padding: '24px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Secure PIN Generator</h2>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
