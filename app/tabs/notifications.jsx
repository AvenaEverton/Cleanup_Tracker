// Notifications.jsx (React Native)
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            `http://192.168.1.17:5000/getNotifications?userId=${storedUserId}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("API Response Data:", data);
          setNotifications(data);
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

  const renderItem = ({ item }) => {
    console.log("Rendering item:", item);
    if (!item || typeof item !== "object") {
      return (
        <View style={styles.notificationItem}>
          <Text style={styles.message}>Invalid Item: {JSON.stringify(item)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.notificationItem}>
        <Text style={styles.message}>{item.message || "No message"}</Text>
        <Text style={styles.date}>
          {item.created_at ? new Date(item.created_at).toLocaleString() : "No date"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      {loading && <Text>Loading notifications...</Text>}
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}

      {!loading && !error && notifications && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item?.notif_id?.toString() || "uniqueId"}
          renderItem={renderItem}
        />
      )}
      {!loading && !error && (!notifications || notifications.length === 0) && (
        <Text>No notifications to display.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  message: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
});

export default NotificationsScreen;