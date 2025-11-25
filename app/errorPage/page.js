'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          background: '#fff',
          padding: '50px 40px',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
        }}
      >
        <h1
          style={{
            fontSize: '80px',
            margin: '0',
            color: '#e63946',
            fontWeight: 'bold',
          }}
        >
          401
        </h1>
        <p
          style={{
            marginTop: '15px',
            fontSize: '20px',
            color: '#555',
          }}
        >
          Oops! Unauthorized access! Please login to continue.
        </p>

        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: '30px',
            padding: '12px 28px',
            fontSize: '18px',
            backgroundColor: '#1d4ed8',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#2563eb')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#1d4ed8')
          }
        >
          Go Back to Login
        </button>
      </div>
    </div>
  );
}
