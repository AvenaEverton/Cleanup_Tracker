import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, FlatList, ImageBackground, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow, differenceInHours, differenceInDays, differenceInMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ThemeContext } from '../../context/ThemeContext';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

const NOTIFICATIONS_VIEWED_KEY = "notificationsViewed";
const EVENT_ENDED_THRESHOLD_HOURS = 24;
const API_BASE_URL = "https://backend-rt98.onrender.com";

const backgroundImage = require('../../assets/images/reportbg.jpg');

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NotificationsScreen = ({ onNewEvent }) => {
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewedNotifications, setViewedNotifications] = useState({});
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const navigation = useNavigation();
    const { darkMode: isDarkMode } = useContext(ThemeContext);

    const newEventSound = useRef(new Audio.Sound());

    const colors = isDarkMode
        ? {
            text: '#f7fafc',
            background: 'rgba(0, 0, 50, 0.8)',
            card: 'rgba(0, 0, 50, 0.9)',
            border: 'rgba(255, 255, 255, 0.2)',
            primary: 'blue',
            notifText: '#a0aec0',
            eventContainer: 'rgba(0, 0, 100, 0.7)',
            eventText: '#fff',
            detailText: '#fff'
        }
        : {
            text: 'black',
            background: 'rgba(255,255,255,0.7)',
            card: 'white',
            border: '#ddd',
            primary: 'green',
            notifText: '#558b2f',
            eventContainer: 'rgba(255, 255, 255, 1)',
            eventText: '#333',
            detailText: '#666'
        };

    const fetchEventDetails = useCallback(async (eventId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const eventData = await response.json();
            return eventData;
        } catch (error) {
            console.error("Error fetching event details:", error);
            Alert.alert("Error", `Failed to load event details: ${error.message}`);
            return null;
        }
    }, []);

    const playNewEventSound = useCallback(async () => {
        try {
            await newEventSound.current.loadAsync(require('../../assets/sounds/new_event.wav'));
            await newEventSound.current.playAsync();
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }, []);

    const fetchNotifications = useCallback(async (currentUserId) => {
        console.log("API Query userId:", currentUserId);
        try {
            const response = await fetch(
                `${API_BASE_URL}/getNotifications?userId=${currentUserId}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();
            console.log("API Response Data:", data);

            const notificationsWithDetails = await Promise.all(
                data.notifications.map(async (notif) => {
                    if (notif.event_id) {
                        const eventDetails = await fetchEventDetails(notif.event_id);
                        return { ...notif, ...eventDetails };
                    }
                    return notif;
                })
            );
            setNotifications(notificationsWithDetails);

            const storedViewedNotifications = await AsyncStorage.getItem(
                NOTIFICATIONS_VIEWED_KEY
            );
            let initialViewed = {};
            if (storedViewedNotifications) {
                initialViewed = JSON.parse(storedViewedNotifications);
            }
            const updatedViewed = { ...initialViewed };
            notificationsWithDetails.forEach((notif) => {
                if (!updatedViewed[notif.notif_id]) {
                    updatedViewed[notif.notif_id] = false;
                }
            });
            setViewedNotifications(updatedViewed);
        } catch (err) {
            setError(err.message || "Failed to fetch notifications");
            console.error(" Fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchEventDetails]);  // Removed 'notifications' from dependency array

    useEffect(() => {
        const fetchUserIdAndInitialNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                if (storedUserId) {
                    console.log("Retrieved userId:", storedUserId);
                    setUserId(storedUserId);
                    await fetchNotifications(storedUserId);
                } else {
                    const errorMessage = "userId not found in AsyncStorage";
                    setError(errorMessage);
                    console.error(errorMessage);
                    setLoading(false);
                }
            } catch (err) {
                const errorMessage = err.message || "Failed to fetch userId";
                setError(errorMessage);
                console.error("AsyncStorage error:", err);
                setLoading(false);
            }
        };

        fetchUserIdAndInitialNotifications();

        const intervalId = setInterval(async () => {
            if (userId) {
                await fetchNotifications(userId);
            }
        }, 15000);

        return () => {
            clearInterval(intervalId);
            if (newEventSound.current) {
                newEventSound.current.unloadAsync();
            }
        };
    }, [fetchNotifications, userId, playNewEventSound]);  // Removed newEventSound

    const handleNotificationPress = async (notification) => {
        const updatedViewed = {
            ...viewedNotifications,
            [notification.notif_id]: true,
        };
        setViewedNotifications(updatedViewed);

        try {
            await AsyncStorage.setItem(
                NOTIFICATIONS_VIEWED_KEY,
                JSON.stringify(updatedViewed)
            );
        } catch (error) {
            console.error("Error saving viewed notifications:", error);
        }

        setSelectedNotification(notification.event_id ? notification : { message: notification.message, created_at: notification.created_at, notif_id: notification.notif_id });
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedNotification(null);
    };

    const handleJoinEvent = async (eventId) => {
        if (!userId) {
            Alert.alert("Error", "User ID not found. Please try again.");
            return;
        }
        setIsJoining(true);
        try {
            const response = await fetch(`${API_BASE_URL}/joinEvent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    eventId: eventId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            Alert.alert("Success", "You have successfully joined the event!");
            closeModal();
        } catch (error) {
            console.error("Error joining event:", error);
            Alert.alert("Error", error.message || "Failed to join the event. Please try again.");
        } finally {
            setIsJoining(false);
        }
    };

    const renderItem = ({ item }) => {
        console.log("Rendering item:", item);
        if (!item || typeof item !== "object") {
            return (
                <View style={[styles.notificationItem, styles.invalidItem]}>
                    <Text style={styles.message}>Invalid Item</Text>
                    <Text style={styles.detail}>{JSON.stringify(item)}</Text>
                </View>
            );
        }

        const isViewed = viewedNotifications[item.notif_id];
        const isEvent = item.event_id !== undefined && item.event_id !== null;
        const eventDate = item.event_date ? new Date(item.event_date) : null;
        const now = new Date();
        const notificationCreatedAt = new Date(item.created_at);
        const diffHours = isEvent ? differenceInHours(now, notificationCreatedAt) : 0;
        const diffDays = isEvent ? differenceInDays(now, notificationCreatedAt) : 0;
        const diffMonths = isEvent ? differenceInMonths(now, notificationCreatedAt) : 0;
        const isEventEnded = isEvent && diffHours >= EVENT_ENDED_THRESHOLD_HOURS;

        let eventLabel = '';
        if (isEvent) {
            if (diffHours < 24) {
                eventLabel = "New Event";
            }
            else if (diffDays < 30) {
                eventLabel = `Event (${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago)`;
            }
            else {
                eventLabel = `Event (${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago)`;
            }
        }

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    isViewed ? styles.viewedNotification : styles.unviewedNotification,
                    isEvent ? { backgroundColor: colors.eventContainer } : {}
                ]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={styles.iconContainer}>
                    {!isViewed && <View style={styles.unreadIndicator} />}
                </View>
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.message,
                        isViewed ? styles.viewedMessage : styles.unviewedMessage,
                        isEvent ? { color: colors.eventText } : {}
                    ]}>
                        {isEvent ? eventLabel : item.message || "No message"}
                    </Text>
                    <Text style={[styles.detail, isEvent ? { color: colors.detailText } : {}]}>
                        {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "No date"}
                        {isEventEnded && <Text style={styles.endedLabel}> Event Ended</Text>}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const anyUnviewed = Object.values(viewedNotifications).some((v) => !v);


    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.headerContainer}>
                    <Feather name="bell" size={24} style={{ ...styles.headerIcon, color: colors.notifText }} />
                    <Text style={[styles.header, { color: colors.text }]}>Notifications</Text>
                </View>

                {loading && (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: colors.text }]}>Fetching your notifications...</Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>
                            <Feather name="alert-triangle" size={18} color="red" /> Error: {error}
                        </Text>
                    </View>
                )}

                {!loading && !error && notifications && notifications.length > 0 && (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item?.notif_id?.toString() || "uniqueId"}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        style={styles.listContainer}
                    />
                )}

                {!loading && !error && (!notifications || notifications.length === 0) && (
                    <View style={styles.emptyContainer}>
                        <Feather name="inbox" size={40} color="#aaa" style={styles.emptyIcon} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>No new notifications.</Text>
                    </View>
                )}

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                            <ScrollView style={styles.modalScrollView}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Details</Text>
                                {selectedNotification && selectedNotification.event_name && (
                                    <>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Event Name: {selectedNotification.event_name}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Description: {selectedNotification.description}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Date: {selectedNotification.event_date}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Time: {selectedNotification.event_time}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Location: {selectedNotification.location}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Details: {selectedNotification.add_details}</Text>
                                        {selectedNotification.file_url && (
                                            <Text style={[styles.modalText, { color: colors.text }]}>File URL: {selectedNotification.file_url}</Text>
                                        )}
                                        <Text style={[styles.modalText, { color: colors.text }]}>Created At: {new Date(selectedNotification.created_at).toLocaleString()}</Text>
                                    </>
                                )}
                                {selectedNotification && !selectedNotification.event_name && (
                                    <>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Message: {selectedNotification.message}</Text>
                                        <Text style={[styles.modalText, { color: colors.text }]}>Created At: {new Date(selectedNotification.created_at).toLocaleString()}</Text>
                                    </>
                                )}
                            </ScrollView>
                            <View style={styles.modalButtons}>
                                {selectedNotification?.event_id && differenceInHours(new Date(), new Date(selectedNotification.created_at)) < EVENT_ENDED_THRESHOLD_HOURS && (
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.joinButton]}
                                        onPress={() => handleJoinEvent(selectedNotification.event_id)}
                                        disabled={isJoining}
                                    >
                                        <Text style={styles.modalButtonText}>{isJoining ? "Joining..." : "Join Event"}</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={closeModal}>
                                    <Text style={styles.modalButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: "transparent",
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        zIndex: 1,
    },
    headerIcon: {
        marginRight: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        zIndex: 1,
    },
    loadingText: {
        fontSize: 16,
        color: "#777",
    },
    errorContainer: {
        padding: 16,
        backgroundColor: "#ffe0e0",
        borderRadius: 8,
        margin: 16,
        zIndex: 1,
    },
    errorText: {
        color: "red",
        fontSize: 16,
    },
    notificationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginHorizontal: 10,
        marginVertical: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    viewedNotification: {
        backgroundColor: '#f8f8f8',
    },
    unviewedNotification: {
        backgroundColor: '#fff',
    },
    invalidItem: {
        backgroundColor: "#fdecea",
    },
    icon: {
        marginRight: 15,
        color: "#777",
    },
    iconContainer: {
        position: 'relative',
        marginRight: 15,
    },
    unreadIndicator: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'green',
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: 18,
        color: "#333",
        marginBottom: 8,
        fontWeight: '500'
    },
    viewedMessage: {
        color: "#777",
        fontWeight: 'normal'
    },
    unviewedMessage: {
        color: "#333",
        fontWeight: '500'
    },
    detail: {
        fontSize: 14,
        color: "#666",
    },
    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginLeft: 0,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 1,
    },
    emptyIcon: {
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: "#aaa",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        width: "80%",
        maxHeight: "90%",
        zIndex: 1001,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    modalButton: {
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
        flex: 1,
        marginHorizontal: 5,
    },
    joinButton: {
        backgroundColor: "green",
    },
    closeButton: {
        backgroundColor: "#007bff",
    },
    modalButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    endedLabel: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 14
    },
    listContainer: {
        flex: 1,
        zIndex: 1,
    },
    modalScrollView: {
        maxHeight: '70%',
        zIndex: 1002,
    }
});

export default NotificationsScreen;