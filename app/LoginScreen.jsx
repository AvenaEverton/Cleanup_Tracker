// LoginScreen.jsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";

const LoginScreen = () => {
  const router = useRouter();
  const scaleValue = new Animated.Value(1);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!emailOrUsername) {
      Alert.alert("Error", "Please enter email or username");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      const response = await axios.post("http://192.168.1.19:5000/api/login", {
        emailOrUsername,
        password,
      });

      if (response.data.success) {
        const user = response.data.user;

        if (user.status === "pending") {
          Alert.alert("Account Pending", "Your account is still under review by the administrator. Please wait for approval.");
          return;
        }

        const userId = String(user.user_id);
        await AsyncStorage.setItem("userId", userId);
        console.log("Login successful, userId saved:", userId);

        if (user.role === "admin") {
          router.replace("/AdminTabs/Admin_home");
        } else {
          router.replace({
            pathname: "/tabs/home",
            params: { username: user.username }, // Pass the username as a parameter
          });
        }
      } else {
        Alert.alert("Login Failed", response.data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const handleBack = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Username"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/register")}>
        <Text style={styles.registerButtonText}>Create an Account</Text>
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#008000" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    backgroundColor: "#008000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    width: "100%",
    marginTop: 15,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#008000",
  },
  registerButtonText: {
    color: "#008000",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    justifyContent: "center",
  },
  backButtonText: {
    color: "#008000",
    fontSize: 16,
    marginLeft: 5,
  },
});

export default LoginScreen;