import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Audio, Video } from 'expo-av';
import React, { useEffect } from "react";
import { Alert } from "react-native";
import io from "socket.io-client";
const { width, height } = Dimensions.get("window");

const isTablet = width > 600;
const socket = io("http://192.168.1.206:5000")

const logo = require("../assets/images/naslively.png");
const videoSource = require("../assets/images/bg_waste_02.mp4"); // Replace with your video file

export default function IndexScreen() {
  const router = useRouter();

  // Function to play the sound effect
  const playSound = async (soundFile) => {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  };

  const App = () => {
    useEffect(() => {
      socket.on("newEvent", (event) => {
        Alert.alert("New Event!", `An event "${event.eventName}" has been created.`);
      });
  
      return () => {
        socket.off("newEvent");
      };
    }, []);
  
    return (
      <View>
        <Text>Listening for new events...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ✅ Background Video */}
      <Video
        source={videoSource}
        style={styles.backgroundVideo}
        resizeMode="cover"
        shouldPlay
        isLooping
        muted
      />

      <View style={styles.welcomeContainer}>
        <Text style={styles.title}>WELCOME TO</Text>
      </View>

      <Image source={logo} style={[styles.logo, isTablet ? { top: '20%' } : { top: '15%' }]} contentFit="contain" />

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
  welcomeContainer: {
    position: "absolute",
    top: "15%",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: isTablet ? 42 : 36,
    fontWeight: "bold",
    color: "#008000",
    textAlign: "center",
    fontFamily: "serif",
    textTransform: "uppercase",
    letterSpacing: 2,
    textShadowColor: '#FFF',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  
  logo: {
    position: "absolute",
    width: 500,
    height: 500,
  },
  buttonContainer: {
    position: "absolute",
    bottom: "10%",
    width: "100%",
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: "#008000",
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
    color: "#FFF",
    textTransform: "uppercase",
  },
  loginButton: {
    borderWidth: 2,
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
  },
});
