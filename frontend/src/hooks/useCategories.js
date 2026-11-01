import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);

  // Load categories from localStorage on mount
  useEffect(() => {
    const loadedCategories = storageService.getCategories();
    setCategories(loadedCategories);
  }, []);

  /**
   * Add a new category
   * @param {string} categoryName - Category name
   */
  const addCategory = (categoryName) => {
    const name = (categoryName || '').trim();
    if (!name || categories.some(cat => cat.toLowerCase() === name.toLowerCase())) {
      return false;
    }
    const newCategories = [...categories, name];
    if (!storageService.saveCategories(newCategories)) {
      return false;
    }
    setCategories(newCategories);
    return true;
  };

  /**
   * Delete a category
   * @param {string} categoryName - Category name to delete
   */
  const deleteCategory = (categoryName) => {
    const newCategories = categories.filter(cat => cat !== categoryName);
    setCategories(newCategories);
    storageService.saveCategories(newCategories);
  };

  /**
   * Rename a category
   * @param {string} oldName - Current category name
   * @param {string} newName - New category name
   */
  const renameCategory = (oldName, newName) => {
    if (categories.includes(newName)) {
      return false;
    }
    const newCategories = categories.map(cat =>
      cat === oldName ? newName : cat
    );
    setCategories(newCategories);
    storageService.saveCategories(newCategories);
    return true;
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    renameCategory
  };
};
