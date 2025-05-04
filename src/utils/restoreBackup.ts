import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { saveData, clearAllData } from "../storage/storage";

export const restoreBackup = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri);
    const data = JSON.parse(content);

    // Basic structure validation
    if (!data || typeof data !== "object")
      throw new Error("Invalid backup format");

    const { exportedAt, dailyRate, workDays, expenses } = data;
    console.log(exportedAt, dailyRate, workDays, expenses);
    if (
      typeof dailyRate !== "number" ||
      typeof workDays !== "object" ||
      !Array.isArray(expenses)
    ) {
      throw new Error("Missing or invalid fields in backup");
    }

    // Clear all existing data first
    await clearAllData();

    // Restore the backup data
    saveData("dailyRate", dailyRate);
    saveData("workDays", workDays);
    saveData("expenses", expenses);

    return true;
  } catch (error) {
    console.error("Restore error:", error);
    throw error;
  }
};
