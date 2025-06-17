import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAttendanceSessions } from "../../../api/Attendance";
import { TokenStore } from "../../../../TokenStore";

const AttendanceScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const router = useRouter();

  const statusColors = {
    present: "#4CAF50",
    partial: "#FF9800",
    absent: "#F44336",
    holiday: "#03A9F4",
  };

  const statusIcons = {
    present: "check-circle",
    partial: "remove-circle",
    absent: "cancel",
    holiday: "event",
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const takeAttendance = () => {
    console.log("Take attendance button pressed");
    router.push("/(teacher)/attendancepage");
  };

  const fetchAttendanceData = async () => {
    const token = await TokenStore.getToken();
    const teacher = await TokenStore.getUserInfo();
    const teacherId = teacher.id;
    await getAttendanceSessions(
      1,
      10,
      token,
      undefined,
      undefined,
      teacherId,
      (data) => {
        console.log("Attendance data fetched successfully", data);
        setAttendanceData(data);
      },
      () => {
        console.log("Error fetching attendance data");
      }
    );
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Check if attendance for today is already taken
  const today = new Date().toISOString().split("T")[0];
  const attendanceTakenToday = attendanceData.some(
    (item) => item.date === today
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Attendance</Text>

      {/* Take Today's Attendance Button */}
      <TouchableOpacity
        style={[
          styles.attendanceButton,
          attendanceTakenToday && { backgroundColor: "#ccc" },
        ]}
        onPress={takeAttendance}
        disabled={attendanceTakenToday}
      >
        <MaterialIcons name="add-circle" size={24} color="#fff" />
        <Text style={styles.buttonText}>
          {attendanceTakenToday
            ? "Attendance Already Taken Today"
            : "Take Today's Attendance"}
        </Text>
      </TouchableOpacity>

      {/* Attendance History Section */}
      <Text style={styles.sectionTitle}>Attendance History</Text>

      {attendanceData?.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            router.push({
              pathname: "/(teacher)/attendance_lookout",
              params: { data: JSON.stringify(item) },
            });
          }}
          style={styles.attendanceCard}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardTitle}>{item.class_name}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
            <MaterialIcons
              name={statusIcons[item.status]}
              size={24}
              color={statusColors[item.status]}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  attendanceButton: {
    backgroundColor: "#03A9F4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  attendanceCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: "#777",
  },
});
