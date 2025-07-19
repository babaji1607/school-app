import { Tabs } from 'expo-router'
import { MaterialIcons, Octicons, Ionicons, Feather } from '@expo/vector-icons'
import { View, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'

const TabRoot = () => {
    const router = useRouter()
    const { width } = Dimensions.get('window')

    // Determine if we're on a smaller screen
    const isSmallScreen = width < 380
    const isVerySmallScreen = width < 350

    // Dynamic tab bar height based on screen size
    const tabBarHeight = isSmallScreen ? 80 : 90

    return (
        <View style={{ flex: 1, backgroundColor: "#f5b0c0" }}>
            {/* Profile FAB - fixed position on all screens */}
            <TouchableOpacity
                style={{
                    backgroundColor: '#F72C5B',
                    width: 40,
                    height: 40,
                    borderRadius: 28,
                    position: 'absolute',
                    top: 15,
                    right: 20,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999,
                }}
                onPress={() => {
                    router.push('/(home)/(tabs)/profile')
                }}>
                <Ionicons name='person-outline' color='#ffffff' size={25} />
            </TouchableOpacity>

            {/* Elevated Attendance Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: tabBarHeight - 25, // Position above the tab bar
                    left: width / 2 - 30, // Center horizontally
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: '#F72C5B',
                    elevation: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    borderWidth: 7,
                    borderColor: '#f5b0c0',
                }}
                onPress={() => {
                    router.push('/(home)/(tabs)/attendance')
                }}>
                <Octicons
                    name='check-circle'
                    size={28}
                    color='#ffffff'
                />
            </TouchableOpacity>

            <Tabs
                initialRouteName='home'
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        height: tabBarHeight,
                        paddingTop: isSmallScreen ? 10 : 12,
                        paddingBottom: isSmallScreen ? 8 : 10,
                        borderTopEndRadius: 25,
                        borderTopStartRadius: 25,
                        paddingHorizontal: isVerySmallScreen ? 8 : 12,
                        backgroundColor: '#ffffff',
                    },
                    tabBarLabelStyle: {
                        marginTop: isSmallScreen ? 4 : 6,
                        fontSize: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
                        fontWeight: '500',
                        textAlign: 'center',
                    },
                    tabBarIconStyle: {
                        marginTop: isSmallScreen ? 4 : 6,
                        marginBottom: 2,
                    },
                    tabBarActiveTintColor: '#F72C5B',
                    tabBarInactiveTintColor: '#888',
                    tabBarItemStyle: {
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: isVerySmallScreen ? 4 : 6,
                        minHeight: 50,
                    },
                    tabBarAllowFontScaling: false,
                }}
            >
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons
                                name='home'
                                size={isSmallScreen ? 23 : 26}
                                color={color}
                            />
                        ),
                        title: 'Home'
                    }}
                    name='home'
                />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Feather
                                name='bell'
                                size={isSmallScreen ? 23 : 26}
                                color={color}
                            />
                        ),
                        title: isVerySmallScreen ? 'Alerts' : 'Notifications'
                    }}
                    name='notifications'
                />
                {/* Hidden attendance tab - functionality handled by floating button */}
                <Tabs.Screen
                    options={{
                        href: null, // Hide from tab bar
                    }}
                    name='attendance'
                />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Octicons
                                name='note'
                                size={isSmallScreen ? 23 : 26}
                                color={color}
                            />
                        ),
                        title: 'Diary'
                    }}
                    name='diary'
                />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons
                                name='payment'
                                size={isSmallScreen ? 23 : 26}
                                color={color}
                            />
                        ),
                        title: isVerySmallScreen ? 'Fee' : isSmallScreen ? 'Fees' : 'Fee Payment'
                    }}
                    name='feepayment'
                />
                {/* Profile screen included in tabs but hidden from tab bar */}
                <Tabs.Screen
                    options={{
                        href: null,
                    }}
                    name='profile'
                />
            </Tabs>
        </View>
    )
}

export default TabRoot