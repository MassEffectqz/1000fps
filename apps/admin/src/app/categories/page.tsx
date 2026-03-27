'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getAuthToken } from '@/lib/tokenUtils';

// ============================================
// Types
// ============================================

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  products: number;
  position: number;
  description?: string;
  imageUrl?: string;
}

interface CreateCategoryData {
  name: string;
  slug: string;
  parentId?: number | null;
  position?: number;
  description?: string;
  imageUrl?: string;
}

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  position: number;
  description?: string;
  imageUrl?: string;
  _count?: {
    products: number;
  };
  children?: ApiCategory[];
}

// ============================================
// Constants
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ============================================
// Component
// ============================================

export default function CategoriesPanel() {
  const [activePanel, setActivePanel] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    parentId: null,
    position: 0,
    description: '',
    imageUrl: '',
  });

  const onPanelChange = (panel: string) => {
    setActivePanel(panel);
  };

  // Загрузка категорий
  const fetchCategories = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/categories`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();
      const data: ApiCategory[] = result.data || [];

      // Преобразуем данные API в формат для таблицы
      const flatCategories: Category[] = [];

      const flattenCategories = (cats: ApiCategory[], parentId: number | null = null) => {
        cats.forEach((cat) => {
          flatCategories.push({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId,
            products: cat._count?.products ?? 0,
            position: cat.position,
            description: cat.description,
            imageUrl: cat.imageUrl,
          });
          if (cat.children && cat.children.length > 0) {
            flattenCategories(cat.children, cat.id);
          }
        });
      };

      flattenCategories(data);
      setCategories(flatCategories);

      // Разворачиваем все родительские категории по умолчанию
      const rootCats = data.filter(cat => !cat.parentId || cat.parentId === null);
      setExpandedParents(rootCats.map((c) => c.id));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleParent = (id: number) => {
    setExpandedParents((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const rootCategories = categories.filter((c) => c.parentId === null);
  const getChildCategories = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: null,
      position: categories.length + 1,
      description: '',
      imageUrl: '',
    });
    setShowModal(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
      position: category.position,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAuthToken();
      const url = editingCategory
        ? `${API_URL}/categories/${editingCategory.id}`
        : `${API_URL}/categories`;

      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Ошибка при сохранении категории');
    }
  };

  const deleteCategory = async (id: number, name: string) => {
    // Проверка на наличие дочерних категорий
    const hasChildren = categories.some(c => c.parentId === id);
    if (hasChildren) {
      alert('Нельзя удалить категорию с подкатегориями. Сначала удалите или переместите подкатегории.');
      return;
    }

    if (!confirm(`Удалить категорию "${name}"?`)) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Ошибка сети' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  return (
    <AdminLayout activePanel={activePanel} onPanelChange={onPanelChange}>
      {/* HEADER */}
      <div className="flex flex-c gap-10 mb-16" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Категории
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Управление деревом категорий</p>
        </div>
        <div className="flex flex-c gap-8">
          <button className="btn btn--primary" onClick={openCreate}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Добавить категорию
          </button>
        </div>
      </div>

      {/* CATEGORY TREE */}
      <div className="card">
        <div className="card__head">
          <span className="card__title">Дерево категорий</span>
          <span className="badge badge--muted">{categories.length} категорий</span>
        </div>
        <div className="card__body card__body--flush">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              Загрузка...
            </div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
              <button className="btn btn--primary" onClick={fetchCategories}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                  style={{ marginRight: '8px' }}
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
                Повторить
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-3)' }}>
              Категории не найдены
            </div>
          ) : (
            <div className="cat-tree">
              {rootCategories.map((root) => (
                <div key={root.id}>
                  {/* Root Category */}
                  <div className="cat-row cat-row--root">
                    <button
                      onClick={() => toggleParent(root.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0',
                        marginRight: '8px',
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        width="14"
                        height="14"
                        style={{
                          transform: expandedParents.includes(root.id)
                            ? 'rotate(90deg)'
                            : 'rotate(0deg)',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                    <span className="cat-label">{root.name}</span>
                    <span className="cat-count">{root.products} тов.</span>
                    <div className="flex gap-6">
                      <button className="tbl-btn" onClick={() => openEdit(root)}>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="12"
                          height="12"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="tbl-btn tbl-btn--danger"
                        onClick={() => deleteCategory(root.id, root.name)}
                      >
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
                  </div>

                  {/* Child Categories */}
                  {expandedParents.includes(root.id) &&
                    getChildCategories(root.id).map((child) => (
                      <div key={child.id} className="cat-row cat-row--child">
                        <span className="cat-label">{child.name}</span>
                        <span className="cat-count">{child.products} тов.</span>
                        <div className="flex gap-6">
                          <button className="tbl-btn" onClick={() => openEdit(child)}>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="12"
                              height="12"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="tbl-btn tbl-btn--danger"
                            onClick={() => deleteCategory(child.id, child.name)}
                          >
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
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      <div
        className={`modal-overlay ${showModal ? 'is-active' : ''}`}
        onClick={() => setShowModal(false)}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal__head">
            <span className="modal__title">
              {editingCategory ? 'Редактирование категории' : 'Новая категория'}
            </span>
            <button className="modal__close" onClick={() => setShowModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal__body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Название <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Slug <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Родительская категория</label>
                  <select
                    className="form-select"
                    value={formData.parentId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : null })
                    }
                  >
                    <option value="">Без родительской</option>
                    {rootCategories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Позиция</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL изображения</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="modal__foot">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!formData.name || !formData.slug}
              >
                {editingCategory ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
