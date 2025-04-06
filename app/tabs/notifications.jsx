import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
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

  const bellAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserIdAndNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          console.log("Retrieved userId:", storedUserId);
          setUserId(storedUserId);

          console.log("API Query userId:", storedUserId);
          const response = await fetch(
            `http://192.168.1.19:5000/getNotifications?userId=${storedUserId}`
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
          if (storedViewedNotifications) {
            setViewedNotifications(JSON.parse(storedViewedNotifications));
          } else {
            // Initialize viewed notifications if not found in AsyncStorage
            const initialViewed = {};
            data.notifications.forEach((notif) => {
              initialViewed[notif.notif_id] = false;
            });
            setViewedNotifications(initialViewed);
          }
        } else {
          setError("userId not found in AsyncStorage");
          console.error("userId not found in AsyncStorage");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch notifications");
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserIdAndNotifications();
  }, []);

  const handleNotificationPress = async (notif_id) => {
    const updatedViewed = {
      ...viewedNotifications,
      [notif_id]: true,
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
        onPress={() => handleNotificationPress(item.notif_id)}
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
});

export default NotificationsScreen;