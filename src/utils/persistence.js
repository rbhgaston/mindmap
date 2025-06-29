const STORAGE_KEY = 'mindmap_state';

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const loadState = () => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return null;
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
}; 