import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions, Animated, TouchableOpacity, RefreshControl } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Calendar, LibraryBig, MessageCircle, Newspaper, ArrowRight } from 'lucide-react-native';
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

    const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animations

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
        // const showtoken = async () => {
        //     let token = await getToken({ template: 'default-one' });
        //     console.log(token);
        // };
        // showtoken();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    // Function to render events in pairs
    const renderEventPairs = () => {
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

            {/* Linear Gradient Overlay - Much cleaner! */}
            <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.4, 0.55, 1]}
                style={styles.gradientOverlay}
            />
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />

            {/* Content Container */}
            <View style={styles.eventContentWrapper}>
                {/* <View style={styles.eventContent}>
                </View> */}
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

    return (
        <SafeAreaView style={styles.container}>
            <Animated.ScrollView
                style={{ opacity: fadeAnim, paddingTop: 60, }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#F72C5B']} // Android
                        tintColor="#F72C5B" // iOS
                        title="Pull to refresh..." // iOS
                        titleColor="#666" // iOS
                        progressBackgroundColor="#ffffff" // Android
                        progressViewOffset={60} // Adjust for the paddingTop offset
                    />
                }
            >
                {/* gallary route  */}
                {/* News Carousel */}
                <View
                    id="carousel-component"
                    dataSet={{ kind: "basic-layouts", name: "normal" }}
                >

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
                            <View style={styles.carouselItem}>
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
                                    <Text style={styles.carouselDescription}>{item.description}</Text>
                                </View>
                            </View>
                        )}
                    />
                </View>
                <View style={styles.gallaryBox}>
                    <TouchableOpacity
                        onPress={() => {
                            router.push('/(home)/gallary')
                        }}
                        style={styles.gallaryButton}>
                        {/* Gradient Overlay */}
                        <LinearGradient
                            colors={['#00d2ff', '#3a7bd5', '#6a11cb']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            locations={[0, 0.5, 1]}
                            style={StyleSheet.absoluteFillObject} // Covers whole button
                        />

                        {/* Text Above the Gradient */}
                        <View style={styles.gallaryContent}>
                            <Text style={styles.gallaryText}>School Gallery</Text>
                            <ArrowRight color="white" size={30} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Quick Access Menu */}
                {/* <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickAccess}
                >
                    {quickAccessItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Pressable key={item.id} style={styles.quickAccessItem}>
                                <View style={styles.quickAccessIconContainer}>
                                    <Icon size={24} color="#2563eb" />
                                </View>
                                <Text style={styles.quickAccessText}>{item.title}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView> */}

                {/* Upcoming Events - Two Cards Per Row */}
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
        // paddingBottom: 20,
    },
    gallaryBox: {
        width: '100%',
        height: 150,
        overflow: 'hidden',
        padding: 15
    },
    gallaryButton: {
        borderRadius: 30,
        padding: 20,
        backgroundColor: 'cyan',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        overflow: 'hidden'
    },
    gallaryText: {
        color: 'white',
        fontSize: 28,
    },
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
        // backgroundColor: 'rgba(0,0,0,0.5)',
        // borderBottomLeftRadius: 15,
        // borderBottomRightRadius: 15,
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
    quickAccess: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    quickAccessItem: {
        alignItems: 'center',
        marginRight: 24,
    },
    quickAccessIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickAccessText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
        color: '#1e293b',
    },
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
        width: '48%', // Slightly less than 50% to allow for spacing
        borderColor: 'white',
        height: 320, // Fixed height for consistent sizing
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
    eventContent: {
        flex: 1,
    },
    eventTitle: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: '#fff',
        marginBottom: 4,
        zIndex: 3
    },
    eventDate: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
        color: '#2563eb',
        marginBottom: 4,
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
    // gallaryButton: {
    //     borderRadius: 30,
    //     overflow: 'hidden',
    //     width: '100%',
    //     height: '100%',
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     position: 'relative',
    // },

    gallaryContent: {
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        gap: 20
    },
    // gallaryText: {
    //     color: 'white',
    //     fontSize: 28,
    //     fontFamily: 'Inter-Bold',
    //     textAlign: 'center',
    //     textShadowColor: 'rgba(0, 0, 0, 0.4)',
    //     textShadowOffset: { width: 1, height: 1 },
    //     textShadowRadius: 6,
    // },

});