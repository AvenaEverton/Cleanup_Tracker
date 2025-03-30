import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { View, StyleSheet, Animated, Easing } from "react-native";

export default function TabsLayout() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: darkMode ? styles.darkTabBar : styles.lightTabBar,
          tabBarActiveTintColor: darkMode ? "#ffffff" : "#000000",
          tabBarInactiveTintColor: darkMode ? "#888888" : "#777777",
        }}
      >
        {/* Home Tab */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color, size }) => (
              <ShiningIcon name="home" focused={focused} size={size} color={color} />
            ),
          }}
        />

       {/* Reports Tab */}
        <Tabs.Screen
          name="report"
          options={{
            title: "Reports",
            tabBarIcon: ({ focused, color, size }) => (
              <ShiningIcon name="document-text" focused={focused} size={size} color={color} />
            ),
          }}
        />


        {/* Notifications Tab */}
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ focused, color, size }) => (
              <ShiningIcon name="notifications" focused={focused} size={size} color={color} />
            ),
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused, color, size }) => (
              <ShiningIcon name="person" focused={focused} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const ShiningIcon = ({ name, focused, size, color }) => {
  const shineAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (focused) {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1.3, // Slightly scale up
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 1, // Back to normal size
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      shineAnim.setValue(1);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: shineAnim }],
        opacity: focused ? 1 : 0.7, // Slight opacity difference
      }}
    >
      <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />
    </Animated.View>
  );
};

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
