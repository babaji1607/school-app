import React, { useState } from "react";
import {
  StyleSheet, Text, View, ScrollView
} from "react-native";
import { Calendar, toDateId } from "@marceloterreiro/flash-calendar";
import { MaterialIcons } from "@expo/vector-icons";

const today = toDateId(new Date());

const AttendanceScreen = () => {
  const [selectedDate, setSelectedDate] = useState(today);

  // Marked Dates with Colors & Labels
  const markedDates = {
    "2025-03-05": { color: "#4CAF50", label: "Present" },
    "2025-03-10": { color: "#FF9800", label: "Half Day" },
    "2025-03-15": { color: "#F44336", label: "Absent" },
    "2025-03-20": { color: "#03A9F4", label: "Holiday" },
  };

  // Upcoming Holidays Data
  const upcomingHolidays = [
    { id: "1", name: "Happy Holi", date: "March 25, 2025", icon: "celebration" },
    { id: "2", name: "Akshya Tritya", date: "April 18, 2025", icon: "event" },
    { id: "3", name: "Sheetalastmi", date: "April 20, 2025", icon: "church" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Attendance</Text>

      {/* Flash Calendar */}
      <Calendar
        calendarActiveDateRanges={[{ startId: selectedDate, endId: selectedDate }]}
        calendarMonthId={today}
        calendarFormatLocale="en-US"
        onCalendarDayPress={setSelectedDate}
        calendarDayStyle={(dateId) => ({
          borderWidth: markedDates[dateId] ? 3 : 0,
          borderColor: markedDates[dateId]?.color || "transparent",
          borderRadius: 25,
        })}
      />

      {/* Attendance Legend */}
      <View style={styles.legendContainer}>
        {Object.entries(markedDates).map(([_, { color, label }]) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendCircle, { borderColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Holidays Section */}
      <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
      {upcomingHolidays.map((item) => (
        <View key={item.id} style={styles.holidayCard}>
          <MaterialIcons name={item.icon} size={24} color="#03A9F4" />
          <View style={styles.holidayTextContainer}>
            <Text style={styles.holidayName}>{item.name}</Text>
            <Text style={styles.holidayDate}>{item.date}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#222",
  },
  holidayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  holidayTextContainer: {
    marginLeft: 10,
  },
  holidayName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  holidayDate: {
    fontSize: 14,
    color: "#666",
  },
});
