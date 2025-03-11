import { Tabs } from 'expo-router'
import { MaterialIcons, Octicons } from '@expo/vector-icons'

const TabRoot = () => {
    return (
        <Tabs initialRouteName='home' screenOptions={{
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
                name='home' />
            <Tabs.Screen
                options={{
                    tabBarIcon: ({ color }) => (
                        <Octicons name='person-fill' size={25} color={color} />
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
    )
}

export default TabRoot
