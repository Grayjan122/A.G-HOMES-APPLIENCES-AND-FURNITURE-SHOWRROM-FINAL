'use client';

import Link from 'next/link';

export default function PaymentCancelled() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '2rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#fed7d7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '3rem'
        }}>
          ✕
        </div>
        <h1 style={{
          color: '#2d3748',
          marginBottom: '1rem'
        }}>
          Payment Cancelled
        </h1>
        <p style={{
          color: '#718096',
          marginBottom: '2rem'
        }}>
          Your payment was cancelled. No charges were made. You can continue shopping and complete your purchase later.
        </p>
        <Link
          href="/shop"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Return to Shop
        </Link>
      </div>
    </div>
  );
}

