import { Tabs } from 'expo-router'
import { MaterialIcons, Octicons, Ionicons, Feather } from '@expo/vector-icons'
import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const TabRoot = () => {
    const router = useRouter()
    return (
        <View style={{ flex: 1 }}>
            {/* Profile FAB - fixed position on all screens */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#007AFF',
                    width: 30,
                    height: 30,
                    // display: 'hidden',
                    borderRadius: 28,
                    position: 'absolute',
                    top: 15, // Position above tab bar
                    right: 20,
                    elevation: 8, // More elevation for better shadow on Android
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999, // Ensure it's above other elements
                }}
                onPress={() => {
                    router.push('/(teacher)/(tabs)/profile')
                }}>
                <Ionicons name='person-outline' color='#ffffff' size={18} />
            </TouchableOpacity>

            <Tabs initialRouteName='home' screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingTop: 5
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#888',
            }}>
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name='home' size={25} color={color} />
                        ),
                        title: 'Home'
                    }}
                    name='home' />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Feather name='bell' size={25} color={color} />
                        ),
                        title: 'Notifications'
                    }}
                    name='notifications' />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Octicons name='check-circle' size={25} color={color} />
                        ),
                        title: 'Attendance'
                    }}
                    name='attendance' />
                {/* Profile screen included in tabs but hidden from tab bar */}
                <Tabs.Screen
                    options={{
                        href: null, // This prevents the tab from being accessible through the URL
                        // tabBarButton: () => null, // This removes the tab button from the tab bar
                    }}
                    name='profile' />
            </Tabs>
        </View>
    )
}

export default TabRoot