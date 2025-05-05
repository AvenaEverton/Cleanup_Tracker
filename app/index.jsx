import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Video } from 'expo-av';
import React, { useEffect } from "react";
import io from "socket.io-client";
import { Audio } from 'expo-av'; // Import the Audio module

const { width, height } = Dimensions.get("window");
const isTablet = width > 600;
const socket = io("https://backend-rt98.onrender.com")


export default function IndexScreen() {
    const router = useRouter();

    // Function to play the sound effect
    const playSound = async (soundFile) => {
        try {
            const { sound } = await Audio.Sound.createAsync(soundFile);
            await sound.playAsync();
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    };

    useEffect(() => {
        socket.on("newEvent", (event) => {
            Alert.alert("New Event!", `An event "${event.eventName}" has been created.`);
        });

        return () => {
            socket.off("newEvent");
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* ✅ Background Video */}
            <Video
                source={require("../assets/images/NASLIVELY.mp4")} // Replace with your video file
                style={styles.backgroundVideo}
                resizeMode="cover"
                shouldPlay
                isLooping
                muted
                onError={(error) => console.error("Video error:", error)}
                onLoad={() => console.log("Video loaded")}
            />

            <View style={styles.buttonContainer}>
                {/* ✅ Get Started Button with Sound */}
                <TouchableOpacity
                    style={styles.getStartedButton}
                    onPress={async () => {
                        await playSound(require('../assets/sound/submit.mp3')); // Your click sound
                        router.replace('/intro');
                    }}
                >
                    <Text style={styles.getStartedText}>GET STARTED</Text>
                </TouchableOpacity>

                {/* ✅ Login Button with Sound */}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={async () => {
                        await playSound(require('../assets/sound/submit.mp3')); // Another click sound
                        router.replace("/LoginScreen");
                    }}
                >
                    <Text style={styles.loginText}>I ALREADY HAVE AN ACCOUNT</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#f4f4f4",
    },
    backgroundVideo: {
        position: "absolute",
        width: width,
        height: height,
        top: 0,
        left: 0,
    },
    buttonContainer: {
        position: "absolute",
        bottom: "10%",
        width: "100%",
        paddingHorizontal: 20,
    },
    getStartedButton: {
        backgroundColor: "#90EE90", // Light green
        paddingVertical: isTablet ? 20 : 16,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        width: "100%",
    },
    getStartedText: {
        fontSize: isTablet ? 20 : 18,
        fontWeight: "bold",
        color: "#000", // Black
        textTransform: "uppercase",
    },
    loginButton: {
        borderWidth: 3, // Increased border width
        borderColor: "#FFF",
        paddingVertical: isTablet ? 18 : 14,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    loginText: {
        fontSize: isTablet ? 18 : 16,
        color: "#FFF",
        textTransform: "uppercase",
        fontWeight: "bold", // Made the text thicker
    },
});