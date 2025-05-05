import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, KeyboardAvoidingView, Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

// Ensure the path to your image is correct
import appLogo from '../assets/images/NasLogo.png';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [idPhoto, setIdPhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const playSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require("../assets/sound/click.mp3")
        );
        await sound.playAsync();
    };

    const handleRegister = async () => {
        if (!fullName || !userName || !email || !password || !confirmPassword) {
            Alert.alert("Error", "All fields are required!");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match!");
            return;
        }

        await playSound();

        try {
            const API_BASE_URL = "https://backend-rt98.onrender.com";
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName,
                    username: userName,
                    email,
                    password,
                    idImagePath: idPhoto,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", data.message);
                await AsyncStorage.setItem('hasRegistered', 'true');
                navigation.navigate("LoginScreen");
            } else {
                Alert.alert("Registration Failed", data.message);
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Try again.");
        }
    };

    const handleBack = async () => {
        await playSound();
        navigation.navigate('intro', { slideIndex: 3 });
    };

    const handleTakePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setIdPhoto(result.assets[0].uri);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingContainer}
        >
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={appLogo} style={styles.logoImage} resizeMode="contain" />
                    <Text style={styles.logoText}>Register</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={(text) => setFullName(text)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={userName}
                        onChangeText={(text) => setUserName(text)}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => setPassword(text)}
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

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Confirm Password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => setConfirmPassword(text)}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="gray"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
                        <Text style={styles.buttonText}>Take ID Photo</Text>
                    </TouchableOpacity>


                    {idPhoto && (
                        <Image source={{ uri: idPhoto }} style={styles.image} />
                    )}

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                </View>
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
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    logoText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#008000",
        marginTop: 0,
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
        marginBottom: 15,
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
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    backButton: {
        backgroundColor: "transparent",
        padding: 15,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#008000",
        marginTop: 15,
    },
    backButtonText: {
        color: "#008000",
        fontWeight: "bold",
        fontSize: 16,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 20,
    },
});

export default RegisterScreen;
