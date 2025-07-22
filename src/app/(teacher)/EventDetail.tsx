import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';

const EventDetails = () => {
    const { event } = useLocalSearchParams();

    let parsedEvent = null;

    try {
        parsedEvent = event ? JSON.parse(event as string) : null;
    } catch (error) {
        console.error('Invalid event JSON passed:', error);
    }

    if (!parsedEvent) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Invalid event data.</Text>
            </View>
        );
    }

    const { title = 'Untitled', description = 'No Description', imageUrl = 'Not available' } = parsedEvent;

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>
                    {description?.toString() ?? 'No description'}
                </Text>
                <View style={{ height: 80 }} />
            </ScrollView>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default EventDetails;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        padding: 20,
        paddingBottom: 100,
        backgroundColor: '#f5b0c0',
        height: '100%'
    },
    image: {
        width: '100%',
        height: 400,
        borderRadius: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
    backButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: width,
        backgroundColor: '#F72C5B',
        paddingVertical: 16,
        alignItems: 'center',
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
