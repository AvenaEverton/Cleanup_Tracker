import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity, Image, Animated,
    Easing, StyleSheet, Linking, ScrollView, ActivityIndicator, Alert
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Modal } from 'react-native';

const NEW_GREEN = '#4CAF50';
const ORANGE = '#FFA500';

const EventCard = ({ event }) => {
    const router = useRouter();
  
     const imageSource = event.imageUrl
      ? { uri: event.imageUrl }
      : require('../../assets/images/NasAppIcon.png');
  
    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() =>
          router.push({
            pathname: '/event',
            params: { event: JSON.stringify(event) },
          })
        }
      >
        <Image source={imageSource} style={styles.eventImage} resizeMode="cover" />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.eventDate}>{event.formattedDate || event.date}</Text>
          <Text style={styles.eventLocation} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} /> {event.location}
          </Text>
          <Text style={styles.eventParticipants}>
            <Ionicons name="people-outline" size={12} /> {event.participants || 0} joining
          </Text>
        </View>
      </TouchableOpacity>
    );
};

export default function HomeScreen() {
    const { darkMode } = useContext(ThemeContext);
    const waveAnim = useRef(new Animated.Value(0)).current;
    const arrowAnim = useRef(new Animated.Value(0)).current;
    const router = useRouter();
    const { username: routeUsername } = useLocalSearchParams();
    const [username, setUsername] = useState(routeUsername || "Guest");
    const [localProfilePicture, setLocalProfilePicture] = useState(null);
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const newEventRef = useRef(null);
    const [showEventsModal, setShowEventsModal] = useState(false);

    // Tooltip states and refs
    const searchRef = useRef(null);
    const [searchTooltipVisible, setSearchTooltipVisible] = useState(false);
    const mapRef = useRef(null);
    const [mapTooltipVisible, setMapTooltipVisible] = useState(false);
    const eventsMenuRef = useRef(null);
    const [eventsMenuTooltipVisible, setEventsMenuTooltipVisible] = useState(false);
    const learnRef = useRef(null);
    const [learnTooltipVisible, setLearnTooltipVisible] = useState(false);
    const recentEventRef = useRef(null);
    const [recentEventTooltipVisible, setRecentEventTooltipVisible] = useState(false);
    const joinCleanUpRef = useRef(null);
    const [joinCleanUpTooltipVisible, setJoinCleanUpTooltipVisible] = useState(false);
    const profileRef = useRef(null);
    const [profileTooltipVisible, setProfileTooltipVisible] = useState(false);

    const floatingTipRef = useRef(null);
    const [showFloatingTip, setShowFloatingTip] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://backend-rt98.onrender.com/events");
            if (response.data) {
                // Just use the raw event data without image URL transformation
                setAllEvents(response.data);
                setEvents(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
            Alert.alert("Error", "Could not load events. Please try again later.");
            setEvents([]);
            setAllEvents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const testEndpoint = async () => {
        try {
            const testUrl = "https://backend-rt98.onrender.com/events";
            console.log("Testing endpoint:", testUrl);

            const response = await fetch(testUrl);
            console.log("Response status:", response.status);

            const data = await response.json();
            console.log("Response data:", data);

            Alert.alert(
                "Endpoint Test",
                `Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`,
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error("Test failed:", error);
            Alert.alert(
                "Test Failed",
                error.message,
                [{ text: "OK" }]
            );
        }
    };

    useEffect(() => {
        const checkNewUser = async () => {
            try {
                const isNewUser = await AsyncStorage.getItem('isNewUser');
                const hasRegistered = await AsyncStorage.getItem('hasRegistered');

                if (isNewUser === null || hasRegistered === 'true') {
                    setSearchTooltipVisible(true);
                    setShowFloatingTip(true);
                    await AsyncStorage.setItem('isNewUser', 'false');
                } else {
                    setShowFloatingTip(false);
                }
            } catch (error) {
                console.error("Error checking user status:", error);
            }
        };

        const getUsernameAndEvents = async () => {
            setLoading(true);
            try {
                const storedUsername = await AsyncStorage.getItem("username");
                const userDataString = await AsyncStorage.getItem("userData");

                let finalUsername = "Guest";

                if (userDataString) {
                    try {
                        const userData = JSON.parse(userDataString);
                        if (userData.fullName) finalUsername = userData.fullName;
                        if (userData.picture) setLocalProfilePicture(userData.picture);
                    } catch (parseError) {
                        console.error("Error parsing userData:", parseError);
                    }
                }

                if (storedUsername) {
                    finalUsername = storedUsername;
                }

                setUsername(finalUsername);
            } catch (error) {
                console.error("Failed to retrieve data:", error);
                setUsername("Guest");
            } finally {
                setLoading(false);
            }
        };

        const initializeApp = async () => {
            await getUsernameAndEvents();
            await fetchEvents();
            await checkNewUser();
        };

        initializeApp();

        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: 0,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(arrowAnim, {
                    toValue: -10,
                    duration: 750,
                    easing: Easing.easeInOut,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowAnim, {
                    toValue: 0,
                    duration: 750,
                    easing: Easing.easeInOut,
                    useNativeDriver: true,
                }),
            ])
        ).start();

    }, [waveAnim, arrowAnim, fetchEvents]);

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [fetchEvents])
    );

    const handleNewEvent = useCallback((newEvent) => {
        if (newEvent && !events.some(event => event.id === newEvent.id)) {
            setEvents(prevEvents => {
                const updatedEvents = [newEvent, ...prevEvents];
                const sortedEvents = updatedEvents.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                });
                return sortedEvents;
            });
        }
    }, [events]);

    useEffect(() => {
        newEventRef.current = handleNewEvent;
    }, [handleNewEvent]);

    const startWalkthrough = () => {
        setSearchTooltipVisible(true);
        setShowFloatingTip(false);
    };

    const openAllEventsModal = () => {
        setShowEventsModal(true);
    };

    return (
        <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
            {/* Floating Tip Icon */}
            <TouchableOpacity
                style={styles.floatingTip}
                onPress={startWalkthrough}
                ref={floatingTipRef}
            >
                <Ionicons name="information-circle-outline" size={40} color="#fff" />
            </TouchableOpacity>

            <Tooltip
                isVisible={searchTooltipVisible}
                content={
                    <View style={styles.tooltipContent}>
                        <Text style={styles.tooltipTitle}>Search Bar</Text>
                        <Text style={styles.tooltipDescription}>
                            Use this bar to find specific content within the app.
                        </Text>
                    </View>
                }
                placement="bottom"
                onClose={() => {
                    setSearchTooltipVisible(false);
                    setMapTooltipVisible(true);
                }}
                useReactNativeModal={true}
                childWrapperStyle={styles.tooltipWrapper}
                containerStyle={styles.tooltipContainer}
            >
                <View style={styles.searchContainer} ref={searchRef}>
                    <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#999" />
                    <Ionicons name="search" size={20} color="#666" />
                </View>
            </Tooltip>

            <View style={[styles.headerBackground, { backgroundColor: darkMode ? 'rgba(0, 0, 50, 0.9)' : NEW_GREEN }]}>
                <View style={styles.overlayContent}>
                    <View style={styles.greetingContainer}>
                        <Text style={[styles.greetingText]}>Hello!</Text>
                        <Animated.Text style={{ fontSize: 32, marginLeft: 50, marginTop: -40 }}>
                            <Text>👋</Text>
                        </Animated.Text>
                        <Text style={[styles.usernameText]}>{username}</Text>
                    </View>
                    <Tooltip
                        isVisible={profileTooltipVisible}
                        content={
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipTitle}>Your Profile</Text>
                                <Text style={styles.tooltipDescription}>
                                    Tap here to view and manage your profile information.
                                </Text>
                            </View>
                        }
                        placement="bottom"
                        onClose={() => setProfileTooltipVisible(false)}
                        useReactNativeModal={true}
                        childWrapperStyle={styles.tooltipWrapper}
                        containerStyle={styles.tooltipContainer}
                    >
                        <TouchableOpacity
                            onPress={() => router.push("/tabs/profile")}
                            style={{ marginTop: -30 }}
                            ref={profileRef}
                        >
                            {localProfilePicture ? (
                                <Image source={{ uri: localProfilePicture }} style={styles.profileIcon} />
                            ) : (
                                <Ionicons name="person-circle" size={70} color="#F7F7F7" />
                            )}
                        </TouchableOpacity>
                    </Tooltip>
                </View>
            </View>

            <View style={styles.menuWrapper}>
                <View style={[styles.menuContainer, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: '#fff' }]}>
                    <Tooltip
                        isVisible={mapTooltipVisible}
                        content={
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipTitle}>Explore Map</Text>
                                <Text style={styles.tooltipDescription}>
                                    Opens a map to explore nearby locations and events.
                                </Text>
                            </View>
                        }
                        placement="bottom"
                        onClose={() => {
                            setMapTooltipVisible(false);
                            setEventsMenuTooltipVisible(true);
                        }}
                        useReactNativeModal={true}
                        childWrapperStyle={styles.tooltipWrapper}
                        containerStyle={styles.tooltipContainer}
                    >
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                const mapUrl = 'https://maps.google.com/?cid=4431869677863938686';
                                Linking.openURL(mapUrl);
                            }}
                            ref={mapRef}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : NEW_GREEN }]}>
                                <Ionicons name="map" size={30} color="#F0FFF0" />
                            </View>
                            <Text style={[styles.menuText, darkMode ? styles.darkText : styles.lightText]}>Map</Text>
                        </TouchableOpacity>
                    </Tooltip>

                    <Tooltip
                        isVisible={eventsMenuTooltipVisible}
                        content={
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipTitle}>View Events</Text>
                                <Text style={styles.tooltipDescription}>
                                    View a list of upcoming and ongoing events.
                                </Text>
                            </View>
                        }
                        placement="bottom"
                        onClose={() => {
                            setEventsMenuTooltipVisible(false);
                            setLearnTooltipVisible(true);
                        }}
                        useReactNativeModal={true}
                        childWrapperStyle={styles.tooltipWrapper}
                        containerStyle={styles.tooltipContainer}
                    >
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={openAllEventsModal}
                            ref={eventsMenuRef}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : NEW_GREEN }]}>
                                <Ionicons name="calendar" size={30} color="#F0FFF0" />
                            </View>
                            <Text style={[styles.menuText, darkMode ? styles.darkText : styles.lightText]}>Events</Text>
                        </TouchableOpacity>
                    </Tooltip>

                    <Tooltip
                        isVisible={learnTooltipVisible}
                        content={
                            <View style={styles.tooltipContent}>
                                <Text style={styles.tooltipTitle}>Learn More</Text>
                                <Text style={styles.tooltipDescription}>
                                    Access educational materials and learn more about our initiatives.
                                </Text>
                            </View>
                        }
                        placement="bottom"
                        onClose={() => {
                            setLearnTooltipVisible(false);
                            setRecentEventTooltipVisible(true);
                        }}
                        useReactNativeModal={true}
                        childWrapperStyle={styles.tooltipWrapper}
                        containerStyle={styles.tooltipContainer}
                    >
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/learn")} ref={learnRef}>
                            <View style={[styles.iconContainer, { backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : NEW_GREEN }]}>
                                <Ionicons name="book" size={30} color="#F0FFF0" />
                            </View>
                            <Text style={[styles.menuText, darkMode ? styles.darkText : styles.lightText]}>Learn</Text>
                        </TouchableOpacity>
                    </Tooltip>
                </View>
            </View>

            <Tooltip
    isVisible={recentEventTooltipVisible}
    content={
        <View style={styles.tooltipContent}>
            <Text style={styles.tooltipTitle}>Recent Events</Text>
            <Text style={styles.tooltipDescription}>
                Check out the most recent events happening around you.
            </Text>
        </View>
    }
    onClose={() => setRecentEventTooltipVisible(false)}
>
    <View style={[styles.recentEvent, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : { backgroundColor: '#fff' }]} ref={recentEventRef}>
        <Text style={[styles.recentEventText, darkMode ? styles.darkText : styles.lightText]}>
            Recent Events
        </Text>
        {loading ? (
            <ActivityIndicator size="small" color="#4CAF50" style={styles.loadingIndicator} />
        ) : events && events.length > 0 ? (
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsScrollContainer}
            >
      {events.map((event, index) => (
  <EventCard 
    key={event.id ?? `${event.title}-${event.date}-${index}`} 
    event={event} 
  />
))}
            </ScrollView>
        ) : (
            <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={40} color="#9E9E9E" />
                <Text style={[styles.noEventsText, darkMode ? styles.darkText : styles.lightText]}>
                    No events available
                </Text>
            </View>
        )}
    </View>
</Tooltip>

<Tooltip
    isVisible={joinCleanUpTooltipVisible}
    content={
        <View style={styles.tooltipContent}>
            <Text style={styles.tooltipTitle}>Join Clean-Up</Text>
            <Text style={styles.tooltipDescription}>
                Tap here to participate in our community clean-up initiatives.
            </Text>
        </View>
    }
    placement="top"
    onClose={() => {
        setJoinCleanUpTooltipVisible(false);
        setProfileTooltipVisible(true);
    }}
    useReactNativeModal={true}
    childWrapperStyle={styles.tooltipWrapper}
    containerStyle={styles.tooltipContainer}
>
    <View style={[styles.cleanUpContainer, { backgroundColor: darkMode ? 'rgba(0, 0, 50, 0.9)' : NEW_GREEN }]} ref={joinCleanUpRef}>
        <Image source={require("../../assets/images/waste_nobg.png")} style={styles.cleanUpBackgroundImage} />
        <Animated.View style={{ transform: [{ translateY: arrowAnim }] }}>
            <Ionicons name="arrow-up" size={40} color={ORANGE} />
        </Animated.View>
        <View>
            <Text style={styles.cleanUpText}>Let's Clean up</Text>
            <Text style={styles.cleanUpCount}></Text>
        </View>
        <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => router.push('../../tabs/notifications')} // 👈 Updated navigation
        >
            <Text style={styles.joinButtonText}>Join Clean-Up</Text>
        </TouchableOpacity>
    </View>
</Tooltip>
 
            {/* All Events Modal */}
            <Modal
    visible={showEventsModal}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setShowEventsModal(false)}
>
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Events</Text>
            <ScrollView>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#4CAF50" />
                        <Text style={{ marginTop: 10 }}>Loading events...</Text>
                    </View>
                ) : allEvents && allEvents.length > 0 ? (
                    allEvents.map((event) => (
                        <View
                        key={event.id ?? `${event.title}-${event.date}-${Math.random().toString(36).substring(7)}`}
                            style={{
                                marginBottom: 15,
                                padding: 15,
                                backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9',
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: '#ccc',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 2,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: darkMode ? '#fff' : '#333', marginBottom: 6 }}>
                                📌 {event.title}
                            </Text>

                            <Text style={{ fontSize: 14, color: darkMode ? '#ddd' : '#555', marginBottom: 10 }}>
                                {event.description}
                            </Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons name="calendar-outline" size={16} color={darkMode ? '#4CAF50' : '#008000'} />
                                <Text style={{ marginLeft: 6, color: darkMode ? '#ccc' : '#444' }}>
                                    {new Date(event.event_date).toLocaleDateString() || 'No date'}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons name="time-outline" size={16} color={darkMode ? '#FFA500' : '#ff8c00'} />
                                <Text style={{ marginLeft: 6, color: darkMode ? '#ccc' : '#444' }}>
                                    {event.time || 'TBD'}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons name="location-outline" size={16} color={darkMode ? '#87CEEB' : '#2196F3'} />
                                <Text style={{ marginLeft: 6, color: darkMode ? '#ccc' : '#444' }}>
                                    {event.location || 'No location'}
                                </Text>
                            </View>

                            {event.additional_details && (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="information-circle-outline" size={16} color={darkMode ? '#FFB6C1' : '#e91e63'} />
                                    <Text style={{ marginLeft: 6, color: darkMode ? '#ccc' : '#444' }}>
                                        {event.additional_details}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={styles.noEventsContainer}>
                        <Ionicons name="calendar-outline" size={40} color="#9E9E9E" />
                        <Text style={[styles.noEventsText, darkMode ? styles.darkText : styles.lightText]}>
                            No events available
                        </Text>
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowEventsModal(false)}
            >
                <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>       

</View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 50,
    },
    lightBackground: {
        backgroundColor: "#f4f4f4",
    },
    darkBackground: {
        backgroundColor: "#121212",
    },
    darkText: {
        color: "#F7F7F7",
    },
    lightText: {
        color: "#121212",
    },
    headerBackground: {
        height: 200,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    overlayContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    greetingContainer: {
        flexDirection: 'column',
        alignItems: "center",
        marginBottom: 20,
        paddingTop: 5,
    },
    greetingText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        textShadowColor: "#000000",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 3,
        marginRight: 80,
        marginTop: -10
    },
    usernameText: {
        fontSize: 36,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    profileIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#008000",
        position: 'absolute',
        top: 0,
        left: 5,
        right: 50,
        marginTop: -30,
        elevation: 10,
        zIndex: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    menuWrapper: {
        marginTop: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    menuContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    menuItem: {
        alignItems: "center",
    },
    iconContainer: {
        backgroundColor: '#3559E0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 5,
    },
    menuText: {
        fontSize: 14,
    },
    recentEvent: {
        backgroundColor: "#fff",
        borderRadius: 8,  // reduced from 10
        padding: 5,      // reduced from 7
        marginTop: 8,    // reduced from 10
        marginBottom: -10,
        borderWidth: 1,
        borderColor: "#008000",
        height: '60%',
        minHeight: 20,   // reduced from 50
        justifyContent: "flex-start",
    },
    recentEventText: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "bold",
    },
    cleanUpContainer: {
        backgroundColor: NEW_GREEN,
        borderRadius: 10,
        padding: 20,
        height: 200,
        justifyContent: "space-between",
        marginTop: -150,
        marginBottom: 20,
    },
    cleanUpText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#F7F7F7",
        textAlign: "left",
        textShadowColor: "rgba(0, 0, 0, 0.8)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 6,
        elevation: 5,
        zIndex: 999,
    },
    cleanUpCount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FBFBFB",
        textShadowColor: "rgba(0, 0,0, 0.5)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    joinButton: {
        backgroundColor: "#008000",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    joinButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    cleanUpBackgroundImage: {
        position: "absolute",
        width: "110%",
        height: "120%",
        resizeMode: "cover",
        right: 3,
        blurRadius: 10,
        opacity: 0.5,
    },
    eventCard: {
        width: 220,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    eventImage: {
        width: '100%',
        height: 120,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        backgroundColor: '#f5f5f5',
    },
    eventImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    eventInfo: {
        padding: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: -50,
    },
    eventDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: 15,
        color: '#4CAF50',
        marginBottom: 4,
    },
    eventParticipants: {
        fontSize: 15,
        color: '#666',
    },
    tooltipWrapper: {
        zIndex: 1000,
    },
    tooltipContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    tooltipContent: {
        alignItems: 'center',
    },
    tooltipTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00000',
        marginBottom: 8,
    },
    tooltipDescription: {
        fontSize: 14,
        color: '#00000',
        textAlign: 'center',
        lineHeight: 20,
    },
    floatingTip: {
        position: 'absolute',
        top: 20,
        right: 10,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 140,
    },
    noEventsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noEventsText: {
        marginTop: 10,
        textAlign: 'center',
        color: '#9E9E9E',
    },
    retryButton: {
        marginTop: 15,
        backgroundColor: NEW_GREEN,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 15,
        alignSelf: 'center',
        backgroundColor: NEW_GREEN,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});