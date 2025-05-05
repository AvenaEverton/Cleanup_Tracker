import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";

// Ensure the path to your image is correct
import appLogo from '../assets/images/NasLogo.png';

const LoginScreen = () => {
    const router = useRouter();
    const scaleValue = new Animated.Value(1);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter email or username");
            return;
        }
        if (!password) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        try {
            const response = await axios.post("https://backend-rt98.onrender.com/api/login", {
                emailOrUsername: email,
                password,
            });

            console.log("Login Response Data:", response.data);

            if (response.data.success) {
                const user = response.data.user;
                const token = response.data.token;
                const usernameToSave = email.trim();

                if (token) {
                    await AsyncStorage.setItem("userToken", token);
                    console.log("Login successful, token saved:", token);
                } else {
                    console.warn("Warning: Token is undefined in the login response.");
                }

                if (user.status === "pending") {
                    Alert.alert("Account Pending", "Your account is still under review by the administrator. Please wait for approval.");
                    return;
                }

                const userId = String(user.user_id);
                const userData = {
                    userId: userId,
                    role: user.role,
                    status: user.status,
                    fullName: usernameToSave,
                };

                try {
                    await AsyncStorage.setItem("userData", JSON.stringify(userData));
                    console.log("Login successful, userData saved:", userData);
                    await AsyncStorage.setItem("username", usernameToSave);
                    console.log("Login successful, username saved:", usernameToSave);
                    await AsyncStorage.setItem("userId", userId);
                    console.log("Login successful, userId saved:", userId);
                } catch (e) {
                    console.error("AsyncStorage Error", e);
                    Alert.alert("Error", "There was an error saving your data. Please try again.");
                    return;
                }

                if (user.role === "admin") {
                    router.replace("/AdminTabs/Admin_home");
                } else {
                    router.replace("/tabs/home");
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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    {/* Replace Ionicons with your Image component */}
                    <Image source={appLogo} style={styles.logoImage} resizeMode="contain" />
                    <Text style={styles.logoText}>Login</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email or Username"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/register")}>
                        <Text style={styles.registerButtonText}>Create an Account</Text>
                    </TouchableOpacity>
                </View>

                <Animated.View style={{ transform: [{ scale: scaleValue }], marginTop: 30 }}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="#008000" />
                        <Text style={styles.backButtonText}>Back to Home</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    logoImage: {
        width: 80, // Adjust size as needed
        height: 80, // Adjust size as needed
        marginBottom: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#008000",
        marginTop: 0, // Adjust as needed
    },
    inputContainer: {
        width: "100%",
        maxWidth: 350,
    },
    input: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        fontSize: 16,
        color: "#333",
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 15,
    },
    button: {
        backgroundColor: "#008000",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        elevation: 3,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    registerButton: {
        backgroundColor: "transparent",
        padding: 15,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#008000",
        marginTop: 15,
    },
    registerButtonText: {
        color: "#008000",
        fontSize: 16,
        fontWeight: "bold",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    backButtonText: {
        color: "#008000",
        fontSize: 16,
        marginLeft: 5,
    },
});

export default LoginScreen;