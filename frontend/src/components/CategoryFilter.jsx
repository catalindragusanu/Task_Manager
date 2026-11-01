import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, onAddCategory }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      const success = onAddCategory(newCategory.trim());
      if (success) {
        setNewCategory('');
        setShowAddForm(false);
        toast.success('Category added');
      } else {
        toast.error('Category already exists or could not be saved');
      }
    }
  };

  return (
    <div className="category-filter">
      <div className="category-chips">
        <button
          className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          aria-label="Show all tasks"
        >
          All Tasks
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
            aria-pressed={selectedCategory === category}
            aria-label={`Filter by ${category}`}
          >
            {category}
          </button>
        ))}
        <button
          className="category-chip add-category"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-label="Add category"
        >
          + Add
        </button>
      </div>

      {showAddForm && (
        <form className="add-category-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            autoFocus
          />
          <button type="submit" className="btn-small">Add</button>
          <button
            type="button"
            className="btn-small"
            onClick={() => {
              setShowAddForm(false);
              setNewCategory('');
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default CategoryFilter;
