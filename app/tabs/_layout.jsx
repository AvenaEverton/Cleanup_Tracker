import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import {
  KeyboardAvoidingView,
  Platform,
  View,
  StyleSheet
} from "react-native";

export default function TabsLayout() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          darkMode ? styles.darkBackground : styles.lightBackground
        ]}
      >
        {/* Fixed Bottom Tabs */}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: [
              styles.fixedTabBar,
              darkMode ? styles.darkTabBar : styles.lightTabBar
            ],
            tabBarActiveTintColor: darkMode ? "#ffffff" : "#000000"
          }}
        >
          {/* Home Tab */}
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              )
            }}
          />

          {/* Events Tab */}
          <Tabs.Screen
            name="events"
            options={{
              title: "Report",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text-outline" size={size} color={color} />
              )
            }}
          />

          {/* Notifications Tab */}
          <Tabs.Screen
            name="notifications"
            options={{
              title: "Notifications",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="notifications-outline" size={size} color={color} />
              )
            }}
          />

          {/* Profile Tab */}
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              )
            }}
          />
        </Tabs>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  },
  lightBackground: {
    backgroundColor: "#ffffff"
  },
  darkBackground: {
    backgroundColor: "#121212"
  },
  fixedTabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  },
  lightTabBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#cccccc"
  },
  darkTabBar: {
    backgroundColor: "#000000",
    borderTopColor: "#444444"
  }
});
