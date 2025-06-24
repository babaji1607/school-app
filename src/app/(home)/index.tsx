import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { TokenStore } from '../../../TokenStore';
import { getUserInfo } from '../../api/Auth';
import messaging from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications'

export default function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null); // ✅ new state


    const requestPermissions = async () => {
        // Only for Android 13+
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission for notifications was denied');
            }
        }
    };


    useEffect(() => {
        const checkOnboarding = async () => {
            const value = await SecureStore.getItemAsync('hasOnboarded');
            setHasOnboarded(value === 'true');
        };
        checkOnboarding();
        requestPermissions()
    }, []);



    useEffect(() => {
        if (hasOnboarded === false) return; // wait before checking auth
        checkAuth();
    }, [hasOnboarded]);

    const checkAuth = async () => {
        try {
            const token = await TokenStore.getToken();
            if (token) {
                getUserInfo(token, (data) => {
                    if (data.detail === 'Not authenticated') {
                        TokenStore.clearAll();
                        setIsAuthenticated(false);
                    } else {
                        setIsAuthenticated(true);
                        setRole(data.role);
                        if (data.teacher_profile) {
                            TokenStore.setUserInfo(data.teacher_profile);
                        } else if (data.student_profile) {
                            TokenStore.setUserInfo(data.student_profile);
                        }
                    }
                });
            } else {
                setIsAuthenticated(false);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setIsAuthenticated(false);
        }
    };

    // You can keep your notification setup logic as is here...

    // Wait for onboarding check first
    if (hasOnboarded === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Redirect to onboarding screen if not completed
    if (!hasOnboarded) {
        return <Redirect href="/(onboarding)/home" />;
    }

    // Then wait for auth check
    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/auth" />;
    }

    if (role === 'admin') {
        return <Redirect href="/(admin)/(tabs)/attendance" />;
    }

    if (role === 'teacher') {
        return <Redirect href="/(teacher)/(tabs)/home" />;
    }

    if (role === 'student') {
        return <Redirect href="/(home)/(tabs)/home" />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Unknown role: {role}</Text>
        </View>
    );
}
