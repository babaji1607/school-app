import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TokenStore } from '../../../TokenStore'
import { fetchClassroomsByTeacher } from '../../api/Classes'
import { submitAttendance } from '../../api/Attendance'
import { router } from 'expo-router'

const AttendancePage = () => {
  const [classroom, setClassroom] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Format date without external libraries
  const formatDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    const day = days[date.getDay()]
    const month = months[date.getMonth()]
    const dateNum = date.getDate()
    const year = date.getFullYear()

    return `${day}, ${month} ${dateNum}, ${year}`
  }

  const currentDate = formatDate(new Date())

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true)
        const token = await TokenStore.getToken()
        const teacher = await TokenStore.getUserInfo()

        fetchClassroomsByTeacher(token, teacher.id, (data) => {
          console.log('Classrooms:', data)

          if (data && data.length > 0) {
            setClassroom(data[0])

            // Transform students data into required format with the exact structure needed for submission
            if (data[0].students && Array.isArray(data[0].students)) {
              const studentsList = data[0].students.map(student => ({
                student_id: student.id || student.student_id,
                student_name: student.name || student.student_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                status: 'absent' // Changed default from 'present' to 'absent'
              }))
              setStudents(studentsList)
            } else {
              setStudents([])
            }
          }
          setLoading(false)
        }, (error) => {
          console.error('Error fetching classrooms:', error)
          setError('Failed to load classroom data')
          setLoading(false)
        })
      } catch (err) {
        console.error('Error in fetch operation:', err)
        setError('An unexpected error occurred')
        setLoading(false)
      }
    }

    fetchClassrooms()
  }, [])

  const toggleAttendance = (studentId) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.student_id === studentId
          ? {
            student_id: student.student_id,
            student_name: student.student_name,
            status: student.status === 'present' ? 'absent' : 'present'
          }
          : student
      )
    )
  }

  const handleSubmit = () => {
    // Show confirmation modal instead of submitting immediately
    setShowConfirmation(true)
  }

  const confirmSubmit = async () => {
    try {
      // Format the data to match what the submitAttendance function expects
      const token = await TokenStore.getToken()
      const teacher = await TokenStore.getUserInfo()
      const formattedDate = new Date().toISOString().split('T')[0];

      // This is crucial - map our data structure to what the API function expects
      const formattedStudents = students.map(student => ({
        id: student.student_id,             // The API expects 'id' not 'student_id'
        status: student.status,             // Status remains the same
        name: student.student_name          // The API expects 'name' not 'student_name'
      }))

      console.log('Submitting attendance data:', formattedStudents)

      submitAttendance(
        token,
        formattedDate,
        teacher.id,
        teacher.subject,
        classroom.name,
        formattedStudents,
        (data) => {
          console.log('Attendance submitted successfully:', data)
          // You could add success messaging here
          router.back()
        },
        (error) => {
          console.error('Error submitting attendance:', error)
          setError('Failed to submit attendance')
        }
      )
      setShowConfirmation(false)
    } catch (err) {
      console.error('Error preparing submission:', err)
      setError('Failed to prepare attendance data')
    }
  }

  const cancelSubmit = () => {
    setShowConfirmation(false)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading classroom data...</Text>
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
          <Text style={styles.headerTitle}>Attendance</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>

        {/* Class Details */}
        <View style={styles.classInfoContainer}>
          {classroom && (
            <>
              <Text style={styles.className}>{classroom.name || 'Class Name'}</Text>
              <Text style={styles.classDetails}>
                {classroom.subject || 'Subject'} • {classroom.section || 'Section'} • {classroom.room || 'Room'}
              </Text>
            </>
          )}
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
            <Text style={styles.emptyStateText}>No students in this class</Text>
          ) : (
            students.map((student, index) => (
              <View
                key={student.student_id}
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

                <TouchableOpacity
                  onPress={() => toggleAttendance(student.student_id)}
                  style={styles.checkboxContainer}
                >
                  <View
                    style={[
                      styles.checkbox,
                      student.status === 'present' && styles.checkboxChecked
                    ]}
                  >
                    {student.status === 'present' && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Mark all students as present while maintaining the required structure
              setStudents(prevStudents =>
                prevStudents.map(student => ({
                  student_id: student.student_id,
                  student_name: student.student_name,
                  status: 'present'
                }))
              )
            }}
          >
            <Text style={styles.actionButtonText}>Mark All Present</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => {
              // Mark all students as absent while maintaining the required structure
              setStudents(prevStudents =>
                prevStudents.map(student => ({
                  student_id: student.student_id,
                  student_name: student.student_name,
                  status: 'absent'
                }))
              )
            }}
          >
            <Text style={styles.actionButtonTextSecondary}>Mark All Absent</Text>
          </TouchableOpacity>
        </View>

        {/* Extra space to ensure we can scroll past the fixed button */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Submit Button (Fixed at bottom) */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={cancelSubmit}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirm Submission</Text>
            <Text style={styles.modalText}>
              Are you sure you want to submit attendance? This action cannot be undone.
            </Text>

            <View style={styles.attendanceSummary}>
              <Text style={styles.attendanceSummaryText}>
                Present: {presentCount} | Absent: {absentCount} | Total: {students.length}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelSubmit}
              >
                <Text style={styles.cancelButtonText}>No, Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmSubmit}
              >
                <Text style={styles.confirmButtonText}>Yes, Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default AttendancePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Space for fixed button
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
  checkboxContainer: {
    padding: 8,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A90E2',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#999999',
    padding: 20,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginRight: 0,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpace: {
    height: 20,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    color: '#555555',
    lineHeight: 22,
  },
  attendanceSummary: {
    backgroundColor: '#F5F5F7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  attendanceSummaryText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
})