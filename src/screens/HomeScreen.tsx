import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { saveData, loadData } from "../storage/storage";
import { format } from "date-fns";
import { calculateNetFromGross } from "../utils/finance";
import { useFocusEffect } from "@react-navigation/native";

type WorkDay = {
  [date: string]: boolean; // e.g., { "2025-04-19": true }
};

const HomeScreen = () => {
  const [workDays, setWorkDays] = useState<WorkDay>({});
  const [dailyRate, setDailyRate] = useState<number>(80); // default value
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  // Load saved data on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const stored = await loadData("workDays");
        if (stored) setWorkDays(stored);

        const savedRate = await loadData("dailyRate");
        if (savedRate !== null) {
          setDailyRate(savedRate);
        }
      };
      fetchData();
    }, [])
  );

  // Save data on changes
  useEffect(() => {
    saveData("workDays", workDays);
  }, [workDays]);

  // Toggle a day as worked or not
  const handleDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;
    setWorkDays((prev) => {
      const newWorkDays = { ...prev };
      if (newWorkDays[dateStr]) {
        delete newWorkDays[dateStr];
      } else {
        newWorkDays[dateStr] = true;
      }
      return newWorkDays;
    });
  };

  const currentMonth = format(new Date(), "yyyy-MM");

  const workedDaysInMonth = Object.keys(workDays).filter((d) =>
    d.startsWith(currentMonth)
  ).length;

  const gross = workedDaysInMonth * dailyRate;
  const net = gross * 0.8; // example formula
  const taxes = gross * 0.2;

  const markedDates = Object.keys(workDays).reduce((acc, date) => {
    acc[date] = { selected: true, marked: true, selectedColor: "#4caf50" };
    return acc;
  }, {} as any);

  const stats = useMemo(() => {
    const workedDates = Object.keys(workDays).filter((date) =>
      date.startsWith(selectedMonth)
    );

    const daysWorked = workedDates.length;
    const totalGross = daysWorked * dailyRate;

    const { redditoImponibile, impostaSostitutiva, contributiInps, net } =
      calculateNetFromGross(totalGross);

    return {
      daysWorked,
      totalGross,
      redditoImponibile,
      impostaSostitutiva,
      contributiInps,
      net,
    };
  }, [selectedMonth, workDays, dailyRate]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Calendar
        firstDay={1}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        enableSwipeMonths
        current={selectedMonth}
        onMonthChange={(currentMonth: { year: any; month: any }) => {
          const newMonth = `${currentMonth.year}-${String(
            currentMonth.month
          ).padStart(2, "0")}`;
          setSelectedMonth(newMonth);
        }}
      />
      <View style={styles.stats}>
        <Text style={styles.statText}>✅ Days Worked: {stats.daysWorked}</Text>
        <Text style={styles.statText}>
          💰 Gross: €{stats.totalGross.toFixed(2)}
        </Text>
        <Text style={styles.statText}>
          📉 Reddito Imponibile: €{stats.redditoImponibile.toFixed(2)}
        </Text>
        <Text style={styles.statText}>
          🧾 Imposta Sostitutiva (5%): €{stats.impostaSostitutiva.toFixed(2)}
        </Text>
        <Text style={styles.statText}>
          🧾 Contributi INPS (26.07%): €{stats.contributiInps.toFixed(2)}
        </Text>
        <Text style={styles.statText}>
          💸 Totale Tasse: €
          {(stats.impostaSostitutiva + stats.contributiInps).toFixed(2)}
        </Text>
        <Text style={styles.statText}>💵 Net: €{stats.net.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  summary: {
    marginVertical: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
  },
  stats: {
    marginTop: 30,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  statText: {
    fontSize: 16,
    marginBottom: 8,
  },
});
