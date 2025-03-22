import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeContext } from "../../context/ThemeContext"; // ✅ Ensure correct path

export default function NotificationsScreen() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkText]}>Notifications Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#121212", // Dark mode background
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  darkText: {
    color: "#ffffff", // White text for dark mode
  },
});
