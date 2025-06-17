import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchStudentAttendanceCalendar } from "../../../api/Attendance";
import { TokenStore } from "../../../../TokenStore";

const AttendanceScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceData, setAttendanceData] = useState([])

  // ✅ Dummy attendance data from backend
  // const attendanceData = [
  //   { date: "2025-06-01", status: "present" },
  //   { date: "2025-06-02", status: "present" },
  //   { date: "2025-06-03", status: "present" },
  //   { date: "2025-06-04", status: "absent" },
  //   { date: "2025-06-05", status: "absent" },
  //   { date: "2025-06-06", status: "present" },
  // ];

  // ✅ Dummy holiday list
  const upcomingHolidays = [
    { id: "1", name: "Happy Holi", date: "March 25, 2025", icon: "celebration" },
    { id: "2", name: "Akshaya Tritiya", date: "April 18, 2025", icon: "event" },
    { id: "3", name: "Sheetala Ashtami", date: "April 20, 2025", icon: "church" },
  ];

  // ✅ Mark attendance on calendar
  const markedDates = useMemo(() => {
    const marks = {};
    attendanceData.forEach((item, index) => {
      const isFirst = index === 0 || attendanceData[index - 1].status !== item.status;
      const isLast = index === attendanceData.length - 1 || attendanceData[index + 1].status !== item.status;
      const isMiddle = !isFirst && !isLast;

      marks[item.date] = {
        startingDay: isFirst,
        endingDay: isLast,
        color: item.status === "present" ? "#4CAF50" : "#F44336",
        textColor: "#fff",
        ...(isMiddle && {
          startingDay: false,
          endingDay: false,
        }),
      };
    });
    return marks;
  }, [attendanceData]);

  const populateData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
      const formatted = `${year}-${month}`;
      const token = await TokenStore.getToken()
      const student = await TokenStore.getUserInfo()
      const studentId = student?.id
      fetchStudentAttendanceCalendar(
        studentId,
        formatted,
        token,
        (data) => {
          console.log('successfully fetched attendance', data)
          setAttendanceData(data)
        },
        (error) => {
          console.log(error, 'Error')
        }
      )
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    populateData()
  }, [])



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Attendance</Text>

      {/* 📅 Calendar */}
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          todayTextColor: "#03A9F4",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          arrowColor: "#333",
          monthTextColor: "#333",
          textDayFontWeight: "500",
          textMonthFontWeight: "700",
          textDayHeaderFontWeight: "600",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />

      {/* 🔵 Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <Text>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F44336" }]} />
          <Text>Absent</Text>
        </View>
      </View>

      {/* 🎉 Upcoming Holidays */}
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
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 30,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
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
