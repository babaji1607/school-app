import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { TokenStore } from '../../../TokenStore';
import { getUserInfo } from '../../api/Auth';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';




export default function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // const requestUserPermission = async () => {
    //     const authStatus = await messaging().requestPermission();
    //     const enabled =
    //         authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //         authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    //     if (enabled) {
    //         console.log("Authorization status:", authStatus);
    //     }
    // };

    const checkAuth = async () => {
        try {
            const token = await TokenStore.getToken(); // ✅ Await the token
            console.log('Resolved Token:', token);

            if (token) {
                getUserInfo(token, (data) => {
                    console.log('User Info:', data);
                    if (data.detail === 'Not authenticated') {
                        TokenStore.clearAll();
                        setIsAuthenticated(false);
                    } else {
                        setIsAuthenticated(true);
                        setRole(data.role);
                        // TokenStore.setUserInfo(data)
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
            console.error('Error during auth check:', err);
            setIsAuthenticated(false);
        }
    };



    const requestUserPermission = async () => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log("Authorization status:", authStatus);
                await messaging().subscribeToTopic('global');
                console.log("Subscribed to global topic");
                return true;
            }
        } catch (error) {
            console.log("Permission request error:", error);
        }
        return false;
    };

    useEffect(() => {
        checkAuth()
        let unsubscribeOnMessage: () => void;
        let notificationClickSubscription: Notifications.Subscription;

        const initializeNotifications = async () => {
            // Ask for user permission and get FCM token
            const permissionGranted = await requestUserPermission();
            if (permissionGranted) {
                try {
                    const token = await messaging().getToken();
                    await TokenStore.setNotificationToken(token)
                    console.log("FCM Token:", token);
                } catch (error) {
                    console.log("FCM token error:", error);
                }
            }

            // Handle local notification tap
            const handleNotificationClick = (response) => {
                const screen = response?.notification?.request?.content?.data?.screen;
                if (screen) {
                    // navigation.navigate(screen);
                }
            };

            // Subscribe to notification click (local)
            notificationClickSubscription =
                Notifications.addNotificationResponseReceivedListener(
                    handleNotificationClick
                );

            // Handle app open from background notification
            messaging().onNotificationOpenedApp((remoteMessage) => {
                const screen = remoteMessage?.data?.screen;
                if (screen) {
                    console.log("Opened from background:", screen);
                    // navigation.navigate(screen);
                }
            });

            // Handle app open from quit state
            const initialNotification = await messaging().getInitialNotification();
            if (initialNotification?.data?.screen) {
                console.log("Opened from quit state:", initialNotification.data.screen);
                // navigation.navigate(initialNotification.data.screen);
            }

            // Handle notifications in foreground
            unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
                const { title, body } = remoteMessage.notification || {};
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title,
                        body,
                        data: remoteMessage.data || {},
                    },
                    trigger: null,
                });
            });

            // Handle notifications in background
            messaging().setBackgroundMessageHandler(async (remoteMessage) => {
                const { title, body } = remoteMessage.notification || {};
                console.log("Handled in background:", remoteMessage);
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title,
                        body,
                        data: remoteMessage.data || {},
                    },
                    trigger: null,
                });
            });

            // Set notification handler (foreground local notifications)
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                }),
            });
        };

        initializeNotifications();

        // Cleanup
        return () => {
            if (unsubscribeOnMessage) unsubscribeOnMessage();
            if (notificationClickSubscription) notificationClickSubscription.remove();
        };
    }, []);


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

    // Fallback for unknown role
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Unknown role: {role}</Text>
        </View>
    );
}
