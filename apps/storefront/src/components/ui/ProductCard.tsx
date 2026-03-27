import Link from 'next/link';
import type { Product } from '@/types';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  compact?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  compact = false,
}: ProductCardProps) {
  const discount = product.discountPercent || 0;
  const hasOldPrice = product.oldPrice && product.oldPrice > product.price;

  if (compact) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr auto',
          gap: '12px',
          padding: '12px',
          background: 'var(--black2)',
          border: '1px solid var(--gray1)',
          borderRadius: 'var(--radius)',
          transition: 'var(--tr)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '60px',
            background: 'var(--black3)',
            border: '1px solid var(--gray1)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <svg viewBox="0 0 80 60" fill="none" style={{ width: '50px', height: '40px' }}>
              <rect
                x="10"
                y="15"
                width="60"
                height="30"
                rx="2"
                stroke="var(--gray2)"
                strokeWidth="2"
              />
            </svg>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/product/${product.slug}`}
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--white2)',
              marginBottom: '4px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {product.name}
          </Link>
          <div style={{ fontSize: '11px', color: 'var(--gray3)' }}>
            {product.brand?.name && <span>{product.brand.name} • </span>}
            <span>Арт: {product.sku}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--white2)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {product.price.toLocaleString('ru-RU')} ₽
          </div>
          {hasOldPrice && (
            <div
              style={{ fontSize: '11px', color: 'var(--gray3)', textDecoration: 'line-through' }}
            >
              {product.oldPrice?.toLocaleString('ru-RU')} ₽
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--black2)',
        border: '1px solid var(--gray1)',
        borderRadius: 'var(--radius)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        position: 'relative',
        transition: 'border-color var(--tr), transform var(--tr)',
        overflow: 'hidden',
      }}
    >
      {/* Badges */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 2,
        }}
      >
        {discount > 0 && (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 7px',
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius)',
              background: 'var(--orange)',
              color: '#fff',
            }}
          >
            -{discount}%
          </span>
        )}
        {product.available === false && (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 7px',
              fontFamily: 'var(--font-display)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: 'var(--radius)',
              background: 'var(--gray1)',
              color: 'var(--gray4)',
            }}
          >
            Нет в наличии
          </span>
        )}
      </div>

      {/* Image */}
      <div
        style={{
          aspectRatio: '4/3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--black3)',
          padding: '16px',
          borderBottom: '1px solid var(--gray1)',
        }}
      >
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <svg viewBox="0 0 120 90" fill="none" style={{ width: '110px', height: '82px' }}>
            <rect
              x="10"
              y="22"
              width="100"
              height="54"
              rx="2"
              stroke="var(--gray2)"
              strokeWidth="2"
            />
            <rect
              x="20"
              y="29"
              width="28"
              height="38"
              rx="1"
              stroke="var(--orange)"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '11px 13px 9px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '11px', marginBottom: '5px', color: 'var(--orange)' }}>
          {product.rating}{' '}
          <span style={{ color: 'var(--gray3)', fontSize: '11px', marginLeft: '4px' }}>
            ({product.reviewsCount})
          </span>
        </div>
        <Link
          href={`/product/${product.slug}`}
          style={{
            fontSize: '12px',
            lineHeight: 1.4,
            color: 'var(--white)',
            flex: 1,
            marginBottom: '5px',
            textDecoration: 'none',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Link>
        <div style={{ fontSize: '11px', color: 'var(--gray3)', lineHeight: 1.35 }}>
          {product.brand?.name || ''}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 13px 10px',
          borderTop: '1px solid var(--gray1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '7px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '18px',
              color: 'var(--white2)',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          {hasOldPrice && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--gray3)',
                textDecoration: 'line-through',
                whiteSpace: 'nowrap',
              }}
            >
              {product.oldPrice?.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onAddToCart?.(product.id)}
            disabled={!product.available}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '6px 8px',
              fontSize: '11px',
              background: product.available ? 'var(--orange)' : 'var(--gray2)',
              color: '#fff',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              textTransform: 'uppercase',
              border: 'none',
              cursor: product.available ? 'pointer' : 'not-allowed',
              opacity: product.available ? 1 : 0.6,
            }}
          >
            В корзину
          </button>
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(product.id)}
              style={{
                width: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--black3)',
                border: '1px solid var(--gray1)',
                borderRadius: 'var(--radius)',
                color: 'var(--gray4)',
                cursor: 'pointer',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '14px', height: '14px' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
