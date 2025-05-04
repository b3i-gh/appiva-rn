import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { loadData } from "../storage/storage";
import { format, parseISO } from "date-fns";
import { calculateNetFromGross } from "../utils/finance";
import { useFocusEffect } from "@react-navigation/native";

type WorkDay = {
  [date: string]: boolean;
};

type MonthSummary = {
  month: string;
  workedDays: number;
  gross: number;
  net: number;
  taxes: number;
};

const YearScreen = () => {
  const [summary, setSummary] = useState<MonthSummary[]>([]);
  const [dailyRate, setDailyRate] = useState<number>(80);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        const workDays = (await loadData("workDays")) ?? {};
        const rate = (await loadData("dailyRate")) ?? 80;
        setDailyRate(rate);

        const months: { [month: string]: number } = {};

        // Count worked days per month
        Object.entries(workDays).forEach(([dateStr, worked]) => {
          if (!worked) return;
          const monthKey = format(parseISO(dateStr), "yyyy-MM");
          months[monthKey] = (months[monthKey] || 0) + 1;
        });

        const summaryData: MonthSummary[] = Object.entries(months).map(
          ([month, count]) => {
            const gross = count * rate;
            const {
              redditoImponibile,
              impostaSostitutiva,
              contributiInps,
              net,
            } = calculateNetFromGross(gross);

            return {
              month,
              workedDays: count,
              gross,
              net,
              taxes: impostaSostitutiva + contributiInps,
            };
          }
        );

        // Sort chronologically
        summaryData.sort((a, b) => a.month.localeCompare(b.month));

        setSummary(summaryData);
      };
      fetchData();
    }, [])
  );

  const total = summary.reduce(
    (acc, curr) => ({
      month: "TOTAL",
      workedDays: acc.workedDays + curr.workedDays,
      gross: acc.gross + curr.gross,
      net: acc.net + curr.net,
      taxes: acc.taxes + curr.taxes,
    }),
    { month: "TOTAL", workedDays: 0, gross: 0, net: 0, taxes: 0 }
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.rowHeader}>
        <Text style={styles.cell}>Month</Text>
        <Text style={styles.cell}>Days</Text>
        <Text style={styles.cell}>Gross</Text>
        <Text style={styles.cell}>Net</Text>
        <Text style={styles.cell}>Taxes</Text>
      </View>
      {summary.map((item) => (
        <View key={item.month} style={styles.row}>
          <Text style={styles.cell}>
            {format(parseISO(item.month + "-01"), "MMM yyyy")}
          </Text>
          <Text style={styles.cell}>{item.workedDays}</Text>
          <Text style={styles.cell}>€{item.gross.toFixed(2)}</Text>
          <Text style={styles.cell}>€{item.net.toFixed(2)}</Text>
          <Text style={styles.cell}>€{item.taxes.toFixed(2)}</Text>
        </View>
      ))}
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.cell}>{total.month}</Text>
        <Text style={styles.cell}>{total.workedDays}</Text>
        <Text style={styles.cell}>€{total.gross.toFixed(2)}</Text>
        <Text style={styles.cell}>€{total.net.toFixed(2)}</Text>
        <Text style={styles.cell}>€{total.taxes.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};

export default YearScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  rowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 4,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 6,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
  },
});
