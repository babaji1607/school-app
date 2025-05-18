import { useClerk } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'

export const SignOutButton = () => {
    // Use `useClerk()` to access the `signOut()` function
    const { signOut } = useClerk()

    const handleSignOut = async () => {
        try {
            await signOut()
            // Redirect to your desired page
            Linking.openURL(Linking.createURL('/'))
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    return (
        <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
        >
            <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
    )
}

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const styles = StyleSheet.create({
    signOutButton: {
        backgroundColor: '#ef4444', // Red color for sign out
        paddingVertical: isSmallDevice ? 10 : 12,
        paddingHorizontal: isSmallDevice ? 16 : 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        minWidth: 100,
    },
    signOutText: {
        color: '#ffffff',
        fontSize: isSmallDevice ? 14 : 16,
        fontWeight: '600',
    }
});