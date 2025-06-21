import { Tabs } from 'expo-router'
import { MaterialIcons, Octicons, Ionicons, Feather } from '@expo/vector-icons'
import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const TabRoot = () => {
    const router = useRouter()
    return (
        <View style={{ flex: 1, backgroundColor: '#f5b0c0' }}>
            {/* Profile FAB - fixed position on all screens */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#F72C5B',
                    width: 40,
                    height: 40,
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
                <Ionicons name='person-outline' color='#ffffff' size={25} />
            </TouchableOpacity>

            <Tabs initialRouteName='home' screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 85,
                    paddingTop: 10,
                    borderTopEndRadius: 25,
                    borderTopStartRadius: 25,
                },
                tabBarLabelStyle: {
                    marginTop: 5, // space between icon and label
                    fontSize: 12, // optional: control label size
                },
                tabBarIconStyle: {
                    marginTop: 5,
                    marginBottom: 1, // optional: push icon down a bit
                },
                tabBarActiveTintColor: '#F72C5B',
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