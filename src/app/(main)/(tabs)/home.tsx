import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const TabHome = () => {
    return (
        <View>
            <Text>TabHome</Text>
            <Link href='/about'>Go to about page</Link>
            
        </View>
    )
}

export default TabHome
