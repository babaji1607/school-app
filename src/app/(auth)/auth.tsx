import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native'; // ✅ Lottie import
import { adminLogin } from '../../api/Auth';
import { TokenStore } from '../../../TokenStore';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import messaging from '@react-native-firebase/messaging';
import { updateStudent } from '../../api/Students';
import schoolbus from '../../assets/lottieFiles/schoolbus.json'

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen({ navigation }) {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const navigateBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        router.push('/(admin)/(tabs)/home');
        break;
      case 'teacher':
        router.push('/(teacher)/(tabs)/attendance');
        break;
      default: // student
        router.push('/(home)/(tabs)/home');
        break;
    }
  };

  const updateStudentDeviceToken = async (studentData) => {
    const notification_token = await TokenStore.getNotificationToken();
    const token = await TokenStore.getToken();
    const updatedData = { ...studentData, notification_token };

    await updateStudent(
      token,
      updatedData.id,
      updatedData,
      (data) => console.log("Token updated successfully", data),
      (error) => console.log("Token update failed", error)
    );
  };

  const handleLogin = async () => {
    if (!userID || !password) {
      Alert.alert('Login Error', 'Please enter both User ID and Password');
      return;
    }

    setIsLoading(true);

    ['student_global', 'teacher_global'].forEach(async (topic) => {
      await messaging().unsubscribeFromTopic(topic);
    });

    try {
      const response = await adminLogin(
        userID,
        password,
        async (data) => {
          if (data && data.access_token) {
            TokenStore.setToken(data.access_token);

            if (data.teacher_profile) {
              TokenStore.setUserInfo(data.teacher_profile);
            } else if (data.student_profile) {
              TokenStore.setUserInfo(data.student_profile);
              messaging().subscribeToTopic(data.student_profile.class_id);
              updateStudentDeviceToken(data.student_profile);
            }

            await messaging().subscribeToTopic('global');

            if (data.role === 'teacher') {
              await messaging().subscribeToTopic('teacher');
            } else {
              await messaging().subscribeToTopic('student');
            }

            navigateBasedOnRole(data.role);
          }
        },
        () => {
          Alert.alert(
            'Login Failed',
            'Invalid credentials or server error. Please try again.'
          );
        }
      );

      if (!response.success) {
        Alert.alert('Login Error', response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { }, []);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* ✅ Lottie Animation */}
            <LottieView
              source={schoolbus} // Adjust path if needed
              autoPlay
              loop
              style={styles.lottie}
            />

            <Text style={styles.heading}>Login</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="User ID"
                value={userID}
                onChangeText={setUserID}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={moderateScale(20)}
                  color="#FF7979"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
            >
              <View style={styles.customGradient}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: scale(20),
  },
  content: {
    flex: 1,
    padding: scale(20),
    justifyContent: 'center',
    minHeight: Dimensions.get('window').height - 100, // Ensures content takes full height
  },
  lottie: {
    width: '100%',
    height: verticalScale(150),
    alignSelf: 'center',
    marginBottom: verticalScale(10),
  },
  heading: {
    fontSize: isTablet ? moderateScale(22) : moderateScale(24),
    fontWeight: 'bold',
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: verticalScale(15),
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FF7979',
    borderRadius: moderateScale(25),
    padding: moderateScale(12),
    paddingHorizontal: moderateScale(15),
    fontSize: moderateScale(14),
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#FF7979',
    borderRadius: moderateScale(25),
    padding: moderateScale(12),
    paddingHorizontal: moderateScale(15),
    paddingRight: moderateScale(40),
    fontSize: moderateScale(14),
  },
  eyeIcon: {
    position: 'absolute',
    right: moderateScale(15),
    top: moderateScale(12),
  },
  loginButton: {
    marginTop: verticalScale(10),
    borderRadius: moderateScale(25),
    overflow: 'hidden',
  },
  customGradient: {
    height: verticalScale(45),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(25),
    backgroundColor: '#FF7979',
    shadowColor: '#FFB546',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: isTablet ? moderateScale(15) : moderateScale(16),
  },
});