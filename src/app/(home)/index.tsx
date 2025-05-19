import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { TokenStore } from '../../../TokenStore';
import { getUserInfo } from '../../api/Auth';

export default function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await TokenStore.getToken(); // ✅ Await the token
                console.log('Resolved Token:', token);

                if (token) {
                    getUserInfo(token, (data) => {
                        if (data.detail === 'Not authenticated') {
                            TokenStore.clearAll();
                            setIsAuthenticated(false);
                        } else {
                            setIsAuthenticated(true);
                            setRole(data.role);
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

        checkAuth();
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
