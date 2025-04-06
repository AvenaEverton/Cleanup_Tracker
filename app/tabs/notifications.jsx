import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

const NOTIFICATIONS_VIEWED_KEY = "notificationsViewed"; // Key for AsyncStorage

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewedNotifications, setViewedNotifications] = useState({});
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isJoining, setIsJoining] = useState(false); // State to track joining process

  const bellAnimation = useRef(new Animated.Value(0)).current;

  const fetchNotifications = async (currentUserId) => {
    console.log("API Query userId:", currentUserId);
    try {
      const response = await fetch(
        `http://192.168.1.17:5000/getNotifications?userId=${currentUserId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("API Response Data:", data);
      setNotifications(data.notifications);

      // Load viewed notifications from AsyncStorage
      const storedViewedNotifications = await AsyncStorage.getItem(
        NOTIFICATIONS_VIEWED_KEY
      );
      let initialViewed = {};
      if (storedViewedNotifications) {
        initialViewed = JSON.parse(storedViewedNotifications);
      }
      // Ensure all fetched notifications have a corresponding viewed state
      const updatedViewed = { ...initialViewed };
      data.notifications.forEach((notif) => {
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
  };

  useEffect(() => {
    const fetchUserIdAndInitialNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          console.log("Retrieved userId:", storedUserId);
          setUserId(storedUserId);
          fetchNotifications(storedUserId);
        } else {
          setError("userId not found in AsyncStorage");
          console.error("userId not found in AsyncStorage");
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch userId");
        console.error("AsyncStorage error:", err);
        setLoading(false);
      }
    };

    fetchUserIdAndInitialNotifications();
  }, []);

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`http://192.168.1.17:5000/events/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const eventData = await response.json();
      return eventData;
    } catch (error) {
      console.error("Error fetching event details:", error);
      Alert.alert("Error", "Failed to load event details.");
      return null;
    }
  };

  const handleNotificationPress = async (notification) => {
    const updatedViewed = {
      ...viewedNotifications,
      [notification.notif_id]: true,
    };
    setViewedNotifications(updatedViewed);

    // Save updated viewed notifications to AsyncStorage
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_VIEWED_KEY,
        JSON.stringify(updatedViewed)
      );
    } catch (error) {
      console.error("Error saving viewed notifications:", error);
    }

    if (notification.event_id) {
      const eventDetails = await fetchEventDetails(notification.event_id);
      if (eventDetails) {
        setSelectedNotification({ ...eventDetails, notif_id: notification.notif_id });
        setIsModalVisible(true);
      }
    } else {
      setSelectedNotification({ message: notification.message, created_at: notification.created_at, notif_id: notification.notif_id });
      setIsModalVisible(true);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedNotification(null);
  };

  const startBellAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnimation, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: -1,
          duration: 300,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnimation, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleJoinEvent = async (eventId) => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please try again.");
      return;
    }
    setIsJoining(true);
    try {
      const response = await fetch(`http://192.168.1.17:5000/joinEvent`, {
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
      closeModal(); // Close the modal after successful join
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
    const bellColor = isViewed ? "#555" : "green";

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => handleNotificationPress(item)}
      >
        <Feather name="bell" size={24} color={bellColor} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.message}>{item.message || "No message"}</Text>
          <Text style={styles.detail}>
            {item.created_at
              ? new Date(item.created_at).toLocaleString()
              : "No date"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const anyUnviewed = Object.values(viewedNotifications).some((v) => !v);

  useEffect(() => {
    if (anyUnviewed) {
      startBellAnimation();
    } else {
      bellAnimation.stopAnimation();
    }
  }, [anyUnviewed]);

  const animatedStyle = {
    transform: [
      {
        rotate: bellAnimation.interpolate({
          inputRange: [-1, 1],
          outputRange: ["-10deg", "10deg"],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Animated.View style={anyUnviewed ? animatedStyle : null}>
          <Feather
            name="bell"
            size={24}
            color="#333"
            style={styles.headerIcon}
          />
        </Animated.View>
        <Text style={styles.header}>Notifications</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Fetching your notifications...</Text>
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
        />
      )}

      {!loading && !error && (!notifications || notifications.length === 0) && (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={40} color="#aaa" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>No new notifications.</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Notification Details</Text>
              {selectedNotification && selectedNotification.event_name && (
                <>
                  <Text style={styles.modalText}>Event Name: {selectedNotification.event_name}</Text>
                  <Text style={styles.modalText}>Description: {selectedNotification.description}</Text>
                  <Text style={styles.modalText}>Date: {selectedNotification.event_date}</Text>
                  <Text style={styles.modalText}>Time: {selectedNotification.event_time}</Text>
                  <Text style={styles.modalText}>Location: {selectedNotification.location}</Text>
                  <Text style={styles.modalText}>Details: {selectedNotification.add_details}</Text>
                  {selectedNotification.file_url && (
                    <Text style={styles.modalText}>File URL: {selectedNotification.file_url}</Text>
                  )}
                  <Text style={styles.modalText}>Created At: {new Date(selectedNotification.created_at).toLocaleString()}</Text>
                  <Text style={styles.modalText}>Created By: {selectedNotification.created_by}</Text>
                </>
              )}
              {selectedNotification && !selectedNotification.event_name && (
                <>
                  <Text style={styles.modalText}>Message: {selectedNotification.message}</Text>
                  <Text style={styles.modalText}>Created At: {new Date(selectedNotification.created_at).toLocaleString()}</Text>
                </>
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              {selectedNotification?.event_id && (
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  headerIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
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
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  invalidItem: {
    backgroundColor: "#fdecea",
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  detail: {
    fontSize: 12,
    color: "#777",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginLeft: 55,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "90%",
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
});

export default NotificationsScreen;