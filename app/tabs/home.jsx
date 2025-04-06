import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image, Animated,
  Easing, StyleSheet
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
// import { ProfileContext } from "../../context/ProfileContext"; // Removed ProfileContext import

export default function HomeScreen() {
  const { darkMode } = useContext(ThemeContext);
  // const { profilePicture } = useContext(ProfileContext); // Removed profilePicture context
  const waveAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { username: routeUsername } = useLocalSearchParams();
  const [username, setUsername] = useState(routeUsername || "Guest"); // Initialize with routeUsername or Guest
  const [localProfilePicture, setLocalProfilePicture] = useState(null); // Local state for profile picture

  useEffect(() => {
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
  }, [waveAnim]); // Removed dependencies related to firstName and username

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search..." placeholderTextColor="#999" />
        <Ionicons name="search" size={20} color="#666" />
      </View>

      {/* Header Background */}
      <View style={styles.headerBackground}>
        <View style={styles.overlayContent}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText]}>
              Hello!
            </Text>
            <Animated.Text style={{ fontSize: 32, marginLeft: 50, marginTop: -40 }}>
              <Text>👋</Text>
            </Animated.Text>
            <Text style={[styles.usernameText]}>
              {username}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/tabs/profile")}
            style={{ marginTop: -30 }}
          >
            {localProfilePicture ? (
              <Image source={{ uri: localProfilePicture }} style={styles.profileIcon} />
            ) : (
              <Ionicons name="person-circle" size={70} color="#F7F7F7" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.menuWrapper}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="map" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/learn")}>
            <View style={styles.iconContainer}>
              <Ionicons name="book" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Learn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Event */}
      <View style={styles.recentEvent}>
        <Text style={styles.recentEventText}>Recent Event</Text>
      </View>

      {/* Clean-Up Section */}
      <View style={styles.cleanUpContainer}>
        <Image source={require("../../assets/images/waste_nobg.png")} style={styles.cleanUpBackgroundImage} />
        <Ionicons name="warning" size={40} color="#FFA500" />
        <View>
          <Text style={styles.cleanUpText}>Reach up to 500</Text>
          <Text style={styles.cleanUpCount}>100/500</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Clean-Up</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
// ... (rest of your styles - no changes needed here)
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
    backgroundColor: '#3559E0',
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
    paddingTop: 5, // ✅ Slightly pushes everything downward
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF", // ✅ Changed color to white
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginRight: 80, // ✅ Shifted slightly to the left
    marginTop: -10,     // ✅ Slightly lowered the "Hello!" text
  },

  usernameText: {
    fontSize: 36,
    color: "#FFFFFF", // ✅ Changed color to white
    fontWeight: "bold",
  },
  profileIcon: {
    width: 70, // Match the Ionicons size
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
    left: 20,
    right: 20,
    marginTop: 10,
    elevation: 5,
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
    backgroundColor: "#3559E0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuText: {
    fontSize: 14,
  },
  recentEvent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginTop: 20, // ✅ Reduced the margin to slightly move it up
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#008000",
    height: 180,
    justifyContent: "flex-start",
  },
  recentEventText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  cleanUpContainer: {
    backgroundColor: "#3559E0",
    borderRadius: 10,
    padding: 20,
    height: 200,
    justifyContent: "space-between",
    marginTop: -20, // ✅ This will slightly move it to the top
  },
  cleanUpText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F7F7F7",
    textAlign: "left",
    textShadowColor: "rgba(0, 0, 0, 0.8)", // ✅ Heavy shadow effect
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    elevation: 5, // ✅ Adds an elevation effect
    zIndex: 999, // ✅ Force it to stay on top
  },

  cleanUpCount: {
    fontSize: 24, // ✅ Slightly increased size
    fontWeight: "bold",
    color: "#FBFBFB",
    textShadowColor: "rgba(0, 0, 0, 0.5)", // ✅ Adds shadow for pop effect
    textShadowOffset: { width: 1, height: 1 }, // ✅ Slight offset for depth
    textShadowRadius: 5, // ✅ Smooth blur effect
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
    right: 3, // ✅ Shifted slightly to the right
    blurRadius: 10, // ✅ Real blur effect now working
    opacity: 0.5, // Slight opacity for a more subtle
  },
});