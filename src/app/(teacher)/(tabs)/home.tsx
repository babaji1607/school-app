import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, Animated, TouchableOpacity, RefreshControl } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Calendar, LibraryBig, MessageCircle, Newspaper, ArrowRight, Camera, Sparkles } from 'lucide-react-native';
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { getActiveEvents } from '../../../api/Events';
import { TokenStore } from '../../../../TokenStore';
import { LinearGradient } from 'react-native-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomePage() {
    const [fontsLoaded] = useFonts({
        'Inter-Regular': Inter_400Regular,
        'Inter-SemiBold': Inter_600SemiBold,
        'Inter-Bold': Inter_700Bold,
    });

    const router = useRouter()

    const [events, setEvents] = useState([])
    const [refreshing, setRefreshing] = useState(false);

    const scrollOffsetValue = useSharedValue(0);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const galleryButtonScale = useRef(new Animated.Value(1)).current;

    const populateEvents = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
            }

            const token = await TokenStore.getToken()
            await getActiveEvents(
                token,
                (data) => {
                    console.log("Events fetched successfully", data)
                    setEvents(data)
                    if (isRefreshing) {
                        setRefreshing(false);
                    }
                },
                (error) => {
                    console.log(error)
                    if (isRefreshing) {
                        setRefreshing(false);
                    }
                }
            )
        } catch (e) {
            console.log(e)
            if (isRefreshing) {
                setRefreshing(false);
            }
        }
    }

    const onRefresh = () => {
        populateEvents(true);
    };

    const handleGalleryPress = () => {
        Animated.sequence([
            Animated.timing(galleryButtonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(galleryButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => {
            router.push('/(home)/gallary');
        });
    };

    useEffect(() => {
        // Fade-in animation for the entire screen
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        populateEvents()
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    // Function to render events in pairs
    const renderEventPairs = () => {
        if (events.length === 0) {
            return (
                <View style={styles.emptyEventsContainer}>
                    <Calendar size={60} color="#cbd5e1" />
                    <Text style={styles.emptyEventsText}>No upcoming events</Text>
                    <Text style={styles.emptyEventsSubtext}>Check back later for exciting events!</Text>
                </View>
            );
        }

        const pairs = [];
        for (let i = 0; i < events.length; i += 2) {
            pairs.push(
                <View key={`pair-${i}`} style={styles.eventRow}>
                    <EventCard event={events[i]} fadeAnim={fadeAnim} />
                    {i + 1 < events.length && <EventCard event={events[i + 1]} fadeAnim={fadeAnim} />}
                </View>
            );
        }
        return pairs;
    };

    // Event Card Component
    const EventCard = ({ event, fadeAnim }) => (
        <Animated.View style={[styles.eventCard, { opacity: fadeAnim }]}>
            <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.4, 0.55, 1]}
                style={styles.gradientOverlay}
            />
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

            <View style={styles.eventContentWrapper}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text
                    style={styles.eventDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {event.description}
                </Text>
                <TouchableOpacity onPress={() => {
                    router.push({
                        pathname: '/(home)/EventDetail',
                        params: { event: JSON.stringify(event) }
                    })
                }} style={styles.readMoreButton}>
                    <Text style={styles.readMoreText}>Read More</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    // Empty Carousel Component
    const EmptyCarousel = () => (
        <View style={styles.emptyCarouselContainer}>
            <LinearGradient
                colors={['#e2e8f0', '#f1f5f9']}
                style={styles.emptyCarouselGradient}
            />
            <View style={styles.emptyCarouselContent}>
                <Newspaper size={40} color="#94a3b8" />
                <Text style={styles.emptyCarouselText}>No featured events</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                style={{ opacity: fadeAnim, paddingTop: 60, }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#F72C5B']}
                        tintColor="#F72C5B"
                        title="Pull to refresh..."
                        titleColor="#666"
                        progressBackgroundColor="#ffffff"
                        progressViewOffset={60}
                    />
                }
            >
                {/* News Carousel */}
                <View
                    id="carousel-component"
                    dataSet={{ kind: "basic-layouts", name: "normal" }}
                >
                    {events.length > 0 ? (
                        <Carousel
                            loop={true}
                            width={width}
                            height={250}
                            snapEnabled={true}
                            pagingEnabled={true}
                            autoPlay={true}
                            autoPlayInterval={3000}
                            data={events.slice(0, 3)}
                            defaultScrollOffsetValue={scrollOffsetValue}
                            style={{ width: "100%" }}
                            onSnapToItem={(index) => console.log("current index:", index)}
                            renderItem={({ item }) => (
                                <Pressable onPress={() => {
                                    router.push({
                                        pathname: '/(home)/EventDetail',
                                        params: { event: JSON.stringify(item) }
                                    })
                                }} style={styles.carouselItem}>
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.carouselImage}
                                        resizeMode="cover"
                                    />
                                    <LinearGradient
                                        colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                                        locations={[0, 0.4, 0.55, 1]}
                                        style={styles.gradientOverlay}
                                    />
                                    <View style={styles.carouselContent}>
                                        <Text style={styles.carouselTitle}>{item.title}</Text>
                                        <Text
                                            style={styles.carouselDescription}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.description}
                                        </Text>
                                    </View>
                                </Pressable>
                            )}
                        />
                    ) : (
                        <EmptyCarousel />
                    )}
                </View>

                {/* Enhanced Gallery Button */}
                <View style={styles.galleryBox}>
                    <Animated.View style={{ transform: [{ scale: galleryButtonScale }] }}>
                        <TouchableOpacity
                            onPress={handleGalleryPress}
                            style={styles.galleryButton}
                            activeOpacity={0.9}
                        >
                            {/* Multi-layer gradient for depth */}
                            <LinearGradient
                                colors={['#667eea', '#764ba2', '#f093fb']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                locations={[0, 0.5, 1]}
                                style={StyleSheet.absoluteFillObject}
                            />

                            {/* Subtle overlay for sophistication */}
                            <LinearGradient
                                colors={['rgba(255,255,255,0.1)', 'transparent', 'rgba(0,0,0,0.1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFillObject}
                            />

                            {/* Content with enhanced styling */}
                            <View style={styles.galleryContent}>
                                <View style={styles.galleryIconContainer}>
                                    <Camera color="white" size={28} />
                                    <Sparkles
                                        color="rgba(255,255,255,0.8)"
                                        size={16}
                                        style={styles.sparkleIcon}
                                    />
                                </View>
                                <View style={styles.galleryTextContainer}>
                                    <Text style={styles.galleryTitle}>School Gallery</Text>
                                    <Text style={styles.gallerySubtitle}>Explore memories</Text>
                                </View>
                                <View style={styles.arrowContainer}>
                                    <ArrowRight color="white" size={24} />
                                </View>
                            </View>

                            {/* Shine effect */}
                            <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
                                start={{ x: -1, y: -1 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.shineEffect}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Upcoming Events */}
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>Upcoming Events</Text>
                    {renderEventPairs()}
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5b0c0',
    },

    // Empty states
    emptyCarouselContainer: {
        height: 250,
        marginHorizontal: 8,
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCarouselGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    emptyCarouselContent: {
        alignItems: 'center',
    },
    emptyCarouselText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
    },
    emptyEventsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyEventsText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        color: '#64748b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptyEventsSubtext: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },

    // Enhanced Gallery Button
    galleryBox: {
        width: '100%',
        height: 160,
        padding: 15,
    },
    galleryButton: {
        borderRadius: 24,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    galleryContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        zIndex: 3,
    },
    galleryIconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sparkleIcon: {
        position: 'absolute',
        top: -8,
        right: -8,
    },
    galleryTextContainer: {
        flex: 1,
        marginLeft: 20,
    },
    galleryTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 26,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    gallerySubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    arrowContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    shineEffect: {
        position: 'absolute',
        top: 0,
        left: -100,
        right: -100,
        bottom: 0,
        transform: [{ rotate: '15deg' }],
    },

    // Carousel styles
    carouselItem: {
        flex: 1,
        borderRadius: 15,
        overflow: 'hidden',
        marginHorizontal: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    carouselContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    carouselTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        color: '#ffffff',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        zIndex: 2
    },
    carouselDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        zIndex: 2
    },

    // Events section
    eventsSection: {
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 60,
    },
    sectionTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1e293b',
        marginBottom: 16,
    },
    eventRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    eventCard: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '48%',
        borderColor: 'white',
        height: 320,
    },
    eventImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        zIndex: 0,
        position: 'absolute',
    },
    eventContentWrapper: {
        flex: 1,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 10
    },
    eventTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 4,
        zIndex: 3
    },
    eventDescription: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#fff',
        marginBottom: 4,
        lineHeight: 18,
        zIndex: 3
    },
    readMoreButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 2
    },
    readMoreText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 13,
        color: '#000000',
        textAlign: 'center',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
});