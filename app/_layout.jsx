import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext"; // Ensure correct path

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="register" />
        <Stack.Screen name="intro" />
        <Stack.Screen name="(tabs)" /> {/* This loads the /app/tabs/_layout.jsx */}
      </Stack>
    </ThemeProvider>
  );
}
