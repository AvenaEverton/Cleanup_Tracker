import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, TouchableWithoutFeedback, TextInput, Image, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../../context/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";

const APP_VERSION = "1.0.0";

const ProfileScreen = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [showSettings, setShowSettings] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [firstName, setFirstName] = useState("Firstname");
  const [lastName, setLastName] = useState("Lastname");
  const [profilePicture, setProfilePicture] = useState("https://via.placeholder.com/100");

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/LoginScreen");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Toggle Edit Profile Mode
  const toggleEditProfile = () => {
    setShowEditProfile(!showEditProfile);
  };

  // Select Image from Gallery
  const handleImageSelect = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const screenHeight = Dimensions.get("window").height;

  return (
    <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
      <ScrollView 
        contentContainerStyle={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.headerBar}>
          <View style={styles.darkModeContainer}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>

          <View>
            <TouchableOpacity style={styles.settingsIcon} onPress={() => setShowSettings(!showSettings)}>
              <Icon name="cog" size={28} color={darkMode ? "#ffffff" : "#333"} />
            </TouchableOpacity>

            {showSettings && (
              <View style={[styles.settingsOverlay, darkMode ? styles.darkOverlay : styles.lightOverlay]}>
                <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>Settings</Text>
                <TouchableOpacity style={styles.optionButton}>
                  <Text style={styles.optionText}>Delete Your Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
                  <Text style={styles.optionText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Profile Picture */}
        <TouchableOpacity onPress={handleImageSelect}>
          <Image source={{ uri: profilePicture || "https://via.placeholder.com/100" }} style={styles.profileIcon} />
        </TouchableOpacity>

        <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>
          {firstName} {lastName}
        </Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.reportCount, darkMode ? styles.darkText : styles.lightText]}>{reportCount}</Text>
            <Text style={[styles.reportLabel, darkMode ? styles.darkText : styles.lightText]}>Reports</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.eventCount, darkMode ? styles.darkText : styles.lightText]}>{eventCount}</Text>
            <Text style={[styles.eventLabel, darkMode ? styles.darkText : styles.lightText]}>Events</Text>
          </View>
        </View>

        // Update Edit Profile Button to Navigate
          <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("/EditProfileScreen")}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>

        {/* Reports History */}
        <View style={[styles.reportsHistoryContainer, { marginTop: screenHeight * 0.05 }]}>
          <Text style={[styles.reportsHistoryTitle, darkMode ? styles.darkText : styles.lightText]}>
            Reports History
          </Text>
          <View style={styles.placeholdersContainer}>
            <View style={styles.placeholderBox} />
            <View style={styles.placeholderBox} />
          </View>
        </View>

        <Text style={styles.versionText}>App Version: {APP_VERSION}</Text>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  lightContainer: { backgroundColor: "#f4f4f4" },
  darkContainer: { backgroundColor: "#121212" },
  headerBar: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  darkModeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsIcon: { padding: 5 },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    marginTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginVertical: 20,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  reportCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  reportLabel: {
    fontSize: 16,
  },
  eventCount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  eventLabel: {
    fontSize: 16,
  },
  darkText: { color: "#ffffff" },
  lightText: { color: "#333" },
  label: { fontSize: 18, marginRight: 10 },
  settingsOverlay: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 180,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 999,
  },
  darkOverlay: { backgroundColor: "#333" },
  lightOverlay: { backgroundColor: "#fff" },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: "red",
  },
  versionText: {
    position: "absolute",
    bottom: 20,
    fontSize: 14,
    color: "#777",
  },
  editProfileButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
  },
  editProfileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  reportsHistoryContainer: {
    width: "90%",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
  },
  reportsHistoryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  placeholdersContainer: {
    flexDirection: "row",
    gap: 15,
  },
  placeholderBox: {
    width: 280,
    height: 150,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
});

export default ProfileScreen;