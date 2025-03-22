import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext"; // Ensure the correct path

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="LoginScreen" />
        <Stack.Screen name="register" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="intro" /> 
      </Stack>
    </ThemeProvider>
  );
}
