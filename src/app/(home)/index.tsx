import { Text, View } from 'react-native'
import { Redirect } from 'expo-router'

export default function Page() {

    // logic will be here for auth and everything


    return (
        <View>
            <Redirect href='/(auth)/auth' />
            {/* <Text>Hello App</Text> */}
        </View>
    )
}