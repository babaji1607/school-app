import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

const Information = () => {
    const handlePhonePress = (phoneNumber) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleLocationPress = () => {
        // Replace with your actual Google Maps link
        const googleMapsUrl = 'https://maps.google.com/?q=aadarsh+Nagar+behind+yadav+panchayat+bhavan+ajmer+road+Beawar';
        Linking.openURL(googleMapsUrl);
    };

    // Embedded Google Maps URL - replace coordinates with your actual location
    // For Beawar, Rajasthan approximate coordinates: 26.1011, 74.3221
    const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=aadarsh+Nagar+behind+yadav+panchayat+bhavan+ajmer+road+Beawar&zoom=15`;

    // Alternative: Direct iframe embed (if you have the embed link from Google Maps)
    const mapHtml = `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; }
                    iframe { width: 100%; height: 100%; border: 0; }
                </style>
            </head>
            <body>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.8!2d74.3221!3d26.1011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA2JzA0LjAiTiA3NMKwMTknMTkuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.contactCard}>
                {/* Phone Numbers Section */}
                <View style={styles.contactSection}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="phone" size={24} color="#F72C5B" />
                    </View>
                    <View style={styles.contactContent}>
                        <Text style={styles.contactLabel}>Phone Numbers:</Text>
                        <TouchableOpacity onPress={() => handlePhonePress('9680110591')}>
                            <Text style={styles.phoneNumber}>9680110591</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handlePhonePress('9214438677')}>
                            <Text style={styles.phoneNumber}>9214438677</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Address Section */}
                <View style={styles.contactSection}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="location-on" size={24} color="#F72C5B" />
                    </View>
                    <View style={styles.contactContent}>
                        <Text style={styles.contactLabel}>Address:</Text>
                        <Text style={styles.addressText}>
                            Aadarsh Nagar, behind Yadav Panchayat Bhavan,{'\n'}
                            Ajmer Road, Beawar
                        </Text>
                    </View>
                </View>

                {/* Map Section */}
                <View style={styles.mapSection}>
                    <View style={styles.mapHeader}>
                        <MaterialIcons name="map" size={20} color="#F72C5B" />
                        <Text style={styles.mapHeaderText}>Our Location</Text>
                    </View>

                    <View style={styles.mapContainer}>
                        <WebView
                            source={{ html: mapHtml }}
                            style={styles.map}
                            scrollEnabled={false}
                            bounces={false}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            scalesPageToFit={true}
                        />

                        {/* Overlay for better interaction */}
                        <TouchableOpacity
                            style={styles.mapOverlay}
                            onPress={handleLocationPress}
                            activeOpacity={0.7}
                        >
                            <View style={styles.mapOverlayContent}>
                                <MaterialIcons name="open-in-new" size={20} color="white" />
                                <Text style={styles.mapOverlayText}>Open in Maps</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Full Screen Map Button */}
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={handleLocationPress}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="navigation" size={20} color="white" />
                    <Text style={styles.mapButtonText}>Get Directions</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    contactSection: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        alignItems: 'center',
        paddingTop: 2,
    },
    contactContent: {
        flex: 1,
        paddingLeft: 8,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    phoneNumber: {
        fontSize: 16,
        color: '#F72C5B',
        fontWeight: '500',
        paddingVertical: 4,
        textDecorationLine: 'underline',
    },
    addressText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    mapSection: {
        marginBottom: 20,
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    mapHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 8,
    },
    mapContainer: {
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    map: {
        flex: 1,
    },
    mapOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(247, 44, 91, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapOverlayContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapOverlayText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F72C5B',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 8,
    },
    mapButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
        marginHorizontal: 8,
    },
});

export default Information;