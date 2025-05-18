import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import { SignOutButton } from '../Components/SignOutButton'
import { Redirect } from 'expo-router'

export default function Page() {
    const { user } = useUser()

    return (
        <View>
            <SignedIn>
                <Redirect href={'/(home)/(tabs)/home'} />
                <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
            </SignedIn>
            <SignedOut>
                <Redirect href={'/(auth)/auth'} />
            </SignedOut>
        </View>
    )
}