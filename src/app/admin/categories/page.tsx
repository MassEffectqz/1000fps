'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  order: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingCategory(null);
        setFormData({
          name: '',
          slug: '',
          description: '',
          parentId: '',
          order: 0,
          isActive: true,
        });
        loadCategories();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
      order: category.order,
      isActive: category.isActive,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить категорию? Товары останутся без категории.')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadCategories();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      order: 0,
      isActive: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center text-gray4">
          <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  // Строим дерево категорий
  const buildCategoryTree = (cats: Category[], parentId: string | null = null): Category[] => {
    return cats
      .filter(c => c.parentId === parentId)
      .map(category => ({
        ...category,
        children: buildCategoryTree(cats, category.id),
      }));
  };

  const categoryTree = buildCategoryTree(categories);

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const paddingLeft = level * 24;
    
    return (
      <tr key={category.id} className="border-b border-gray1 last:border-b-0 hover:bg-black3 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${paddingLeft}px` }}>
            {category.children && category.children.length > 0 && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray4">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            )}
            <span className="text-[13px] font-bold text-white">{category.name}</span>
            {!category.isActive && (
              <span className="text-[9px] px-2 py-[2px] bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-[var(--radius)]">
                Не активна
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-[12px] text-gray4 font-mono">{category.slug}</td>
        <td className="px-4 py-3 text-[13px] text-gray4">
          {category._count?.products || 0}
        </td>
        <td className="px-4 py-3 text-[13px] text-gray4">
          {category.parent ? category.parent.name : '—'}
        </td>
        <td className="px-4 py-3 text-center">
          <span className="text-[13px] text-gray3">{category.order}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-[6px]">
            <button
              onClick={() => handleEdit(category)}
              className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="w-7 h-7 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-red-500 hover:text-red-500"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[13px] h-[13px]">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderCategoryRows = (cats: Category[], level: number = 0): React.ReactNode[] => {
    let rows: React.ReactNode[] = [];
    cats.forEach(category => {
      rows.push(renderCategoryRow(category, level));
      if (category.children && category.children.length > 0) {
        rows = rows.concat(renderCategoryRows(category.children, level + 1));
      }
    });
    return rows;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-[20px] font-bold text-white mb-1">Категории</h1>
          <p className="text-[13px] text-gray4">Управление категориями и подкатегориями товаров</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
        >
          + Добавить категорию
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-black2 border border-gray1 rounded-[var(--radius)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray1">
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Название</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Slug</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Товаров</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Родитель</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Порядок</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold tracking-wider uppercase text-gray3 bg-black3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {categoryTree.length > 0 ? (
                renderCategoryRows(categoryTree)
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto mb-3 opacity-50">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <div>Категорий ещё нет</div>
                    <div className="text-[12px] mt-1">Нажмите &quot;Добавить категорию&quot; чтобы создать первую</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-black2 border border-gray1 rounded-[var(--radius)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray1 sticky top-0 bg-black2 z-10">
              <h2 className="font-display text-[18px] font-bold text-white">
                {editingCategory ? 'Редактирование категории' : 'Новая категория'}
              </h2>
              <button
                onClick={handleModalClose}
                className="w-8 h-8 bg-black3 border border-gray1 rounded-[var(--radius)] flex items-center justify-center text-gray4 transition-colors hover:border-orange hover:text-orange"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                    Название категории *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
                    placeholder="Например: Видеокарты"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors font-mono"
                    placeholder="video-karty"
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    required
                  />
                  <div className="text-[11px] text-gray3 mt-1">Только латинские буквы, цифры и дефисы</div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors resize-none"
                    placeholder="Краткое описание категории"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                      Родительская категория
                    </label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Без родителя (корневая)</option>
                      {categories
                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                        .filter(c => !c.parentId)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray3 mb-2">
                      Порядок отображения
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-black3 border border-gray1 rounded-[var(--radius)] px-4 py-[8px] text-white text-[13px] outline-none focus:border-orange transition-colors"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 p-4 bg-black3 border border-gray1 rounded-[var(--radius)] cursor-pointer hover:border-gray2 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 accent-orange"
                    />
                    <span className="text-[13px] font-semibold text-white">Активная категория</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray1">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-5 py-[10px] bg-black3 border border-gray1 rounded-[var(--radius)] text-[13px] font-semibold text-gray4 hover:text-white hover:border-gray2 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-[10px] bg-orange text-white rounded-[var(--radius)] text-[13px] font-semibold hover:bg-orange2 transition-colors"
                >
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
