'use client';

import { useEffect, useState } from 'react';

const BLOCK_UNTIL_DATE = new Date('2026-05-05T00:00:00');

export function PaymentBlocker() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const now = new Date();
    if (now >= BLOCK_UNTIL_DATE) {
      setIsBlocked(true);
    }
  }, []);

  if (!isClient || !isBlocked) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--color-black2, #1a1a1a)',
          border: '2px solid var(--color-orange, #ff6b00)',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '500px',
          textAlign: 'center',
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ 
            width: '64px', 
            height: '64px', 
            color: 'var(--color-orange, #ff6b00)',
            marginBottom: '20px',
          }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        
        <h2 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: '16px',
            fontFamily: 'var(--font-display, system-ui)',
          }}
        >
          Доступ заблокирован
        </h2>
        
        <p 
          style={{
            fontSize: '16px',
            color: '#ccc',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}
        >
          Заказ не оплачен до 05.05.2026, свяжитесь с разработчиком в ВК или Телеграме
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a 
            href="https://vk.com/aezqsm"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0077FF',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Написать в VK
          </a>
          <a 
            href="https://t.me/Aezqsm"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0088cc',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Написать в Telegram
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentBlocker;