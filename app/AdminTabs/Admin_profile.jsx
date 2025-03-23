import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../context/ThemeContext"; // Ensure correct path

const AdminProfile = () => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken"); // Remove user session
      router.replace("/LoginScreen"); // Navigate back to login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>Profile</Text>

      {/* Dark Mode Switch */}
      <View style={styles.switchContainer}>
        <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <TouchableOpacity 
        style={[styles.button, darkMode ? styles.darkButton : styles.lightButton]} 
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  lightContainer: {
    backgroundColor: "#f4f4f4", // Light mode background
  },
  darkContainer: {
    backgroundColor: "#121212", // Dark mode background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  lightText: {
    color: "#333", // Text color for light mode
  },
  darkText: {
    color: "#ffffff", // Text color for dark mode
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    width: "80%",
  },
  lightButton: {
    backgroundColor: "#ff4444", // Red logout button for light mode
  },
  darkButton: {
    backgroundColor: "#bb0000", // Darker red for dark mode
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AdminProfile;
