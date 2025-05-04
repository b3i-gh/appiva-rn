import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { saveData, loadData } from "../storage/storage";
import { exportBackup } from "../utils/exportBackup";
import { restoreBackup } from "../utils/restoreBackup";

const SettingsScreen = () => {
  const [dailyRate, setDailyRate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setDailyRate(String((await loadData("dailyRate")) ?? 80));
    };
    fetchData();
  }, []);

  const handleSave = () => {
    const rate = parseFloat(dailyRate);

    if (isNaN(rate)) {
      Alert.alert("⚠️ Invalid input", "Please enter valid numbers.");
      return;
    }

    saveData("dailyRate", rate);
    Alert.alert("✅ Saved", "Settings have been saved!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Daily Salary (€)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={dailyRate}
          onChangeText={setDailyRate}
        />
      </View>

      <Button title="💾 Save Settings" onPress={handleSave} />
      <Button
        title="📤 Export Backup"
        onPress={() => {
          exportBackup()
            .then(() => console.log("Backup exported"))
            .catch(() => Alert.alert("❌ Error", "Failed to export backup"));
        }}
      />

      <Button
        title="📥 Restore from Backup"
        onPress={() => {
          restoreBackup()
            .then(() => Alert.alert("✅ Restored", "Backup has been restored!"))
            .catch(() => Alert.alert("❌ Error", "Failed to restore backup"));
        }}
      />
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
