import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { Redirect } from 'expo-router'

export default function Page() {
    // const { user } = useUser()

    return (
        <View>
            <Redirect href={'/(home)/(tabs)/home'} />
            <Text>Hello App</Text>
            {/* <Redirect href={'/(auth)/auth'} /> */}
        </View>
    )
}