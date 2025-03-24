import { Tabs } from 'expo-router'
import { MaterialIcons, Octicons, Ionicons, Feather } from '@expo/vector-icons'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

const TabRoot = () => {
    const router = useRouter()
    return (
        <View style={{ flex: 1, }}>
            <View style={{ alignItems: 'flex-end', width: '100%', padding: 10, gap: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => {
                    router.push('/(home)/profile')
                }}>
                    <Ionicons name='person-outline' size={20} />
                </TouchableOpacity>
            </View>
            <Tabs initialRouteName='index' screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingTop: 5
                },
                tabBarActiveTintColor: '#007AFF', // Change active tab color
                tabBarInactiveTintColor: '#888', // Change inactive tab color
            }}>
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => ( // Use color prop
                            <MaterialIcons name='home' size={25} color={color} />
                        ),
                        title: 'Home'
                    }}
                    name='index' />
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => ( // Use color prop
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
                <Tabs.Screen
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialIcons name='payment' size={25} color={color} />
                        ),
                        title: 'Fee Payment'
                    }}
                    name='feepayment' />
            </Tabs>
        </View >
    )
}

export default TabRoot
