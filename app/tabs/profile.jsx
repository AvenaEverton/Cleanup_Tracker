import React, { useContext, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TouchableWithoutFeedback,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../../context/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";
// import { ProfileContext } from "../../context/ProfileContext"; // Removed ProfileContext import

const APP_VERSION = "1.0.0";

const ProfileScreen = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  // Removed ProfileContext usage
  const [showSettings, setShowSettings] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [showEditProfile, setShowEditProfile] = useState(false); // Controls edit mode
  const [firstName, setFirstName] = useState("John"); // Initialize with default value
  const [lastName, setLastName] = useState("Doe"); // Initialize with default value
  const [profilePicture, setProfilePicture] = useState(null); // Local state for profile picture
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    Animated.timing(rotationAnim, {
      toValue: isSettingsOpen ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [isSettingsOpen]);

  const animatedStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
    setShowSettings(!showSettings);
  };

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
    // Reset local state when entering edit mode (optional, adjust as needed)
    if (!showEditProfile) {
      // You might want to fetch the current user data here if needed
      setFirstName("John"); // Reset to default or fetched value
      setLastName("Doe"); // Reset to default or fetched value
      setProfilePicture(null); // Reset to default or fetched value
    }
  };

  // Select Image from Gallery (only active in edit mode)
  const handleImageSelect = async () => {
    if (showEditProfile) {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfilePicture(result.assets[0].uri);
      }
    }
  };

  // Save Profile (for local state)
  const handleSaveProfile = () => {
    // Here you would typically send the updated firstName, lastName, and profilePicture
    // to your backend or update local storage. For this example, we're just toggling
    console.log("Saving profile:", firstName, lastName, profilePicture);
    setShowEditProfile(false);
  };

  const screenHeight = Dimensions.get("window").height;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (showSettings) {
          setShowSettings(false);
          setIsSettingsOpen(false);
        }
      }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          darkMode ? styles.darkContainer : styles.lightContainer,
        ]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.headerBar}>
          <View style={styles.darkModeContainer}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>
              Dark Mode
            </Text>
            <Switch value={darkMode} onValueChange={toggleDarkMode} />
          </View>

          <View>
            <TouchableOpacity style={styles.settingsIcon} onPress={toggleSettings}>
              <Animated.View style={animatedStyle}>
                <Icon name="cog" size={28} color={darkMode ? "#ffffff" : "#333"} />
              </Animated.View>
            </TouchableOpacity>

            {showSettings && (
              <View
                style={[
                  styles.settingsOverlay,
                  darkMode ? styles.darkOverlay : styles.lightOverlay,
                ]}
              >
                <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>
                  Settings
                </Text>
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

        {/* Profile Icon/Image */}
        <TouchableOpacity onPress={handleImageSelect} disabled={!showEditProfile}>
          <View style={{ alignItems: "center", marginTop: 80, marginBottom: 15 }}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileIcon} />
            ) : (
              <View style={styles.profileIconPlaceholder}>
                <Icon name="user-circle" size={80} color={darkMode ? "#ddd" : "#777"} />
              </View>
            )}
            {showEditProfile && (
              <View style={styles.editIconContainer}>
                <Icon name="pencil" size={20} color="white" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {showEditProfile ? (
          <View style={{ alignItems: "center" }}>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
            />
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={toggleEditProfile}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>
              {firstName} {lastName}
            </Text>
            <TouchableOpacity style={styles.editProfileButton} onPress={toggleEditProfile}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.reportCount, darkMode ? styles.darkText : styles.lightText]}>
              {reportCount}
            </Text>
            <Text style={[styles.reportLabel, darkMode ? styles.darkText : styles.lightText]}>
              Reports
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={[styles.eventCount, darkMode ? styles.darkText : styles.lightText]}>
              {eventCount}
            </Text>
            <Text style={[styles.eventLabel, darkMode ? styles.darkText : styles.lightText]}>
              Events
            </Text>
          </View>
        </View>

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
  profileIconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgray", // Optional background for visual debugging
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
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
  input: {
    height: 40,
    marginVertical: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "80%",
  },
  darkInput: {
    borderColor: "#555",
    color: "#fff",
    backgroundColor: "#333",
  },
  lightInput: {
    borderColor: "#ccc",
    color: "#333",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 5,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff", // Or any color you prefer
    borderRadius: 10,
    padding: 5,
  },
});

export default ProfileScreen;