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
    const tabBarHeight = isSmallScreen ? 75 : 85
    
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

            <Tabs 
                initialRouteName='home' 
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        height: tabBarHeight,
                        paddingTop: isSmallScreen ? 8 : 10,
                        paddingBottom: isSmallScreen ? 5 : 8,
                        borderTopEndRadius: 25,
                        borderTopStartRadius: 25,
                        paddingHorizontal: isVerySmallScreen ? 5 : 10,
                    },
                    tabBarLabelStyle: {
                        marginTop: isSmallScreen ? 2 : 5,
                        fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : 12,
                        fontWeight: '500',
                        textAlign: 'center',
                        flexWrap: 'wrap',
                    },
                    tabBarIconStyle: {
                        marginTop: isSmallScreen ? 3 : 5,
                        marginBottom: 1,
                    },
                    tabBarActiveTintColor: '#F72C5B',
                    tabBarInactiveTintColor: '#888',
                    tabBarItemStyle: {
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: isVerySmallScreen ? 2 : 4,
                    },
                    tabBarAllowFontScaling: false, // Prevents font scaling issues
                }}
            >
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons 
                                name='home' 
                                size={isSmallScreen ? 22 : 25} 
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
                                size={isSmallScreen ? 22 : 25} 
                                color={color} 
                            />
                        ),
                        title: isVerySmallScreen ? 'Alerts' : 'Notifications'
                    }}
                    name='notifications' 
                />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Octicons 
                                name='check-circle' 
                                size={isSmallScreen ? 22 : 25} 
                                color={color} 
                            />
                        ),
                        title: 'Attendance'
                    }}
                    name='attendance' 
                />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <Octicons 
                                name='note' 
                                size={isSmallScreen ? 22 : 25} 
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
                                size={isSmallScreen ? 22 : 25} 
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