export const saveData = (key: string, data: any): void => {
  try {
    localStorage.setItem(`rangetrack_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};
export const loadData = (key: string): any => {
  try {
    const data = localStorage.getItem(`rangetrack_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return null;
  }
};
export const clearData = (key: string): void => {
  try {
    localStorage.removeItem(`rangetrack_${key}`);
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error);
  }
};