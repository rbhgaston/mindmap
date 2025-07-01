const STORAGE_KEY = 'mindmap_state';

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const saveLayoutState = (layoutType, state) => {
  try {
    const layoutKey = `${STORAGE_KEY}_${layoutType}`;
    localStorage.setItem(layoutKey, JSON.stringify(state));
  } catch (error) {
    console.error(`Failed to save ${layoutType} layout state to localStorage:`, error);
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

export const loadLayoutState = (layoutType) => {
  try {
    const layoutKey = `${STORAGE_KEY}_${layoutType}`;
    const savedState = localStorage.getItem(layoutKey);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error(`Failed to load ${layoutType} layout state from localStorage:`, error);
  }
  return null;
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear all layout-specific states
    const layoutTypes = ['horizontal', 'vertical', 'radial', 'force'];
    layoutTypes.forEach(layoutType => {
      localStorage.removeItem(`${STORAGE_KEY}_${layoutType}`);
    });
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};

export const clearLayoutState = (layoutType) => {
  try {
    const layoutKey = `${STORAGE_KEY}_${layoutType}`;
    localStorage.removeItem(layoutKey);
  } catch (error) {
    console.error(`Failed to clear ${layoutType} layout state from localStorage:`, error);
  }
}; 