import AsyncStorage from "@react-native-async-storage/async-storage";

// storage.ts
export const STORAGE_KEYS = {
  workDays: "workDays",
  dailyRate: "dailyRate",
  netPercent: "netPercent",
  taxPercent: "taxPercent",
  expenses: "expenses",
};

export const saveData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Failed to save:", e);
  }
};

export const loadData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Failed to load:", e);
    return null;
  }
};

export const deleteData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to delete:", e);
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error("Failed to clear:", e);
  }
};
