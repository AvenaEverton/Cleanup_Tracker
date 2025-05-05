import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext"; // Ensure correct path
import { View, StyleSheet } from "react-native";

export default function TabsLayout() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: darkMode ? styles.darkTabBar : styles.lightTabBar,
          tabBarActiveTintColor: darkMode ? "#ffffff" : "#000000",
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? "home" : "home-outline"; // Use filled icon if focused
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          }}
        />

        {/* Events Tab */}
        <Tabs.Screen
          name="events"
          options={{
            title: "Report",
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? "document-text" : "document-text-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            }
          }}
        />

        {/* Notifications Tab */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? "notifications" : "notifications-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused, color, size }) => {
              const iconName = focused ? "person" : "person-outline";
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightBackground: {
    backgroundColor: "#ffffff",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightTabBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#cccccc",
  },
  darkTabBar: {
    backgroundColor: "#000000",
    borderTopColor: "#444444",
  },
});
