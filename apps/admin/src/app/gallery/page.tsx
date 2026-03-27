'use client';

import { useState } from 'react';
import { useMedia, useUploadMedia, useDeleteMedia } from '@/hooks/useApi';

interface MediaItem {
  id: number;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function GalleryPanel() {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: mediaData, isLoading } = useMedia();
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const images = ((mediaData as unknown as { data?: MediaItem[] })?.data) || [];

  const toggleSelect = (id: number) => {
    if (selectedImages.includes(id)) {
      setSelectedImages(selectedImages.filter((i) => i !== id));
    } else {
      setSelectedImages([...selectedImages, id]);
    }
  };

  const deleteSelected = () => {
    if (confirm(`Удалить ${selectedImages.length} изображений?`)) {
      selectedImages.forEach(id => deleteMutation.mutate(id));
      setSelectedImages([]);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            width: '32px',
            height: '32px',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        >
          <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Загрузка галереи...
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Галерея
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Управление изображениями</p>
        </div>
        <div className="flex flex-c gap-8">
          {selectedImages.length > 0 && (
            <button className="btn btn--danger" onClick={deleteSelected}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Удалить ({selectedImages.length})
            </button>
          )}
          <div
            className="flex"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
            }}
          >
            <button
              className={`btn btn--ghost btn--sm ${viewMode === 'grid' ? 'btn--primary' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`btn btn--ghost btn--sm ${viewMode === 'list' ? 'btn--primary' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
          <label className="btn btn--primary" style={{ cursor: 'pointer' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            Загрузить
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach(file => uploadMutation.mutate(file));
              }}
            />
          </label>
        </div>
      </div>

      {/* UPLOAD ZONE */}
      <label className="upload-zone mb-16" style={{ cursor: 'pointer' }}>
        <div className="upload-zone__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <div className="upload-zone__title">Перетащите изображения сюда</div>
        <div className="upload-zone__sub">или кликните для выбора файлов (JPG, PNG, WebP)</div>
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(file => uploadMutation.mutate(file));
          }}
        />
      </label>

      {/* GALLERY */}
      {images.length === 0 ? (
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.5 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p>Нет изображений</p>
          </div>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="gallery-grid">
            {images.map((img) => (
              <div key={img.id} className="gallery-item" onClick={() => toggleSelect(img.id)}>
                <div className="gallery-item__img">
                  <img src={img.url} alt={img.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="gallery-item__over">
                  <button className="tbl-btn" onClick={(e) => { e.stopPropagation(); window.open(img.url, '_blank'); }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="14"
                      height="14"
                    >
                      <path d="M1 4v6h6M3.51 15a2.121 2.121 0 003 3L15 9.5l-3-3L3.51 15z" />
                    </svg>
                  </button>
                  <button className="tbl-btn tbl-btn--danger" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(img.id); }}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      width="14"
                      height="14"
                    >
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card__body card__body--flush">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input type="checkbox" style={{ width: '16px', height: '16px' }} onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedImages(images.map(img => img.id));
                        } else {
                          setSelectedImages([]);
                        }
                      }} />
                    </th>
                    <th>Изображение</th>
                    <th>Имя</th>
                    <th>Размер</th>
                    <th>Дата</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img) => (
                    <tr key={img.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedImages.includes(img.id)}
                          onChange={() => toggleSelect(img.id)}
                          style={{ width: '16px', height: '16px' }}
                        />
                      </td>
                      <td>
                        <img
                          src={img.url}
                          alt={img.filename}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius)',
                          }}
                        />
                      </td>
                      <td className="text-white">{img.filename}</td>
                      <td className="text-muted">{formatFileSize(img.size)}</td>
                      <td className="mono f11">{new Date(img.createdAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <div className="tbl-actions">
                          <button className="tbl-btn" onClick={() => window.open(img.url, '_blank')}>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M1 4v6h6M3.51 15a2.121 2.121 0 003 3L15 9.5l-3-3L3.51 15z" />
                            </svg>
                          </button>
                          <button className="tbl-btn tbl-btn--danger" onClick={() => deleteMutation.mutate(img.id)}>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </>
  );
}
