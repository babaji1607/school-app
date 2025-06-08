import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'

const AttendanceLookout = () => {
    const [attendanceData, setAttendanceData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const params = useLocalSearchParams()

    // Format date without external libraries
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        const day = days[date.getDay()]
        const month = months[date.getMonth()]
        const dateNum = date.getDate()
        const year = date.getFullYear()

        return `${day}, ${month} ${dateNum}, ${year}`
    }

    useEffect(() => {
        // Add a flag to prevent duplicate processing
        let isActive = true;

        try {
            if (params && params.data) {
                // Process the parameters - Expo Router serializes objects to strings
                // We need to parse any JSON string parameters back to objects
                let processedData;

                try {
                    processedData = JSON.parse(params.data);
                    console.log('Successfully parsed attendance data:', processedData);
                } catch (parseErr) {
                    console.error('Error parsing params.data:', parseErr);
                    // If data is already an object, just use it directly
                    processedData = typeof params.data === 'object' ? params.data : {};
                }

                // Ensure date is properly handled
                if (!processedData.date) {
                    processedData.date = new Date().toISOString();
                }

                // Only update state if component is still mounted
                if (isActive) {
                    setAttendanceData(processedData);
                }
            } else if (isActive) {
                setError('No attendance data provided');
            }
        } catch (err) {
            console.error('Error processing navigation params:', err);
            if (isActive) {
                setError('Failed to process attendance data');
            }
        } finally {
            if (isActive) {
                setLoading(false);
            }
        }

        // Cleanup function to prevent state updates after unmount
        return () => {
            isActive = false;
        };
    }, [])

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )
    }

    if (!attendanceData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No attendance data found</Text>
            </View>
        )
    }

    // Ensure students is always an array
    const students = Array.isArray(attendanceData.records) ? attendanceData.records : []

    // Calculate statistics
    const presentCount = students.filter(student => student.status === 'present').length
    const absentCount = students.length - presentCount
    const attendancePercentage = students.length > 0
        ? Math.round((presentCount / students.length) * 100)
        : 0

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

            <ScrollView style={styles.scrollView}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Attendance Record</Text>
                    <Text style={styles.dateText}>{formatDate(attendanceData.date || new Date())}</Text>
                </View>

                {/* Class Details */}
                <View style={styles.classInfoContainer}>
                    <Text style={styles.className}>{attendanceData.class_name || 'Class Name'}</Text>
                    <Text style={styles.classDetails}>
                        {attendanceData.subject || 'Subject'} • {attendanceData.section || ''} • {attendanceData.room || ''}
                    </Text>
                </View>

                {/* Attendance Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{presentCount}</Text>
                        <Text style={styles.summaryLabel}>Present</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{absentCount}</Text>
                        <Text style={styles.summaryLabel}>Absent</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{attendancePercentage}%</Text>
                        <Text style={styles.summaryLabel}>Attendance</Text>
                    </View>
                </View>

                {/* Students List */}
                <View style={styles.studentsContainer}>
                    <Text style={styles.sectionTitle}>Students</Text>

                    {students.length === 0 ? (
                        <Text style={styles.emptyStateText}>No students in this record</Text>
                    ) : (
                        students.map((student, index) => (
                            <View
                                key={student.id || student.student_id || `student-${index}`}
                                style={[
                                    styles.studentRow,
                                    index === students.length - 1 ? null : styles.studentRowBorder
                                ]}
                            >
                                <View style={styles.studentInfo}>
                                    <Text style={styles.studentName}>{student.student_name}</Text>
                                    <Text
                                        style={[
                                            styles.statusText,
                                            student.status === 'present' ? styles.presentText : styles.absentText
                                        ]}
                                    >
                                        {student.status === 'present' ? 'Present' : 'Absent'}
                                    </Text>
                                </View>

                                <View style={styles.statusIndicator}>
                                    <View
                                        style={[
                                            styles.indicator,
                                            student.status === 'present' ? styles.presentIndicator : styles.absentIndicator
                                        ]}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Additional Information */}
                <View style={styles.additionalInfoContainer}>
                    <Text style={styles.infoLabel}>Teacher ID:</Text>
                    <Text style={styles.infoValue}>{attendanceData.teacher_id || 'Not available'}</Text>

                    <Text style={styles.infoLabel}>Submission Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(attendanceData.date || new Date())}</Text>

                    {attendanceData.notes && (
                        <>
                            <Text style={styles.infoLabel}>Notes:</Text>
                            <Text style={styles.infoValue}>{attendanceData.notes}</Text>
                        </>
                    )}
                </View>

                {/* Back Button */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Back to Records</Text>
                    </TouchableOpacity>
                </View>

                {/* Extra space at bottom */}
                <View style={styles.bottomSpace} />
            </ScrollView>
        </SafeAreaView>
    )
}

export default AttendanceLookout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#555',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#D32F2F',
        textAlign: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 16,
        color: '#666666',
    },
    classInfoContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    className: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 5,
    },
    classDetails: {
        fontSize: 14,
        color: '#666666',
    },
    summaryContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 10,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666666',
        marginTop: 3,
    },
    studentsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 15,
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 10,
        paddingHorizontal: 15,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    studentRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333333',
        marginBottom: 2,
    },
    statusText: {
        fontSize: 14,
    },
    presentText: {
        color: '#4CAF50',
    },
    absentText: {
        color: '#F44336',
    },
    statusIndicator: {
        paddingHorizontal: 8,
    },
    indicator: {
        height: 12,
        width: 12,
        borderRadius: 6,
    },
    presentIndicator: {
        backgroundColor: '#4CAF50',
    },
    absentIndicator: {
        backgroundColor: '#F44336',
    },
    emptyStateText: {
        textAlign: 'center',
        color: '#999999',
        padding: 20,
        fontStyle: 'italic',
    },
    additionalInfoContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 12,
    },
    actionsContainer: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomSpace: {
        height: 20,
    },
})