import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import * as ImagePicker from 'expo-image-picker';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("Local User");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [idPhoto, setIdPhoto] = useState(null);

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
      const response = await fetch("http://192.168.1.22:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          username: userName,   // Make sure it matches the backend field
          email,
          password,
          userType,
          idImagePath: idPhoto, // Store the ID image path in the database
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert("Success", data.message);
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

  const handleCheckbox = () => {
    if (!isAuthorized) {
      Alert.alert(
        "Confirmation",
        "Are you sure you want to become Authorized Personnel?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsAuthorized(false)
          },
          {
            text: "Yes",
            onPress: () => {
              setIsAuthorized(true);
              setUserType("Authorized Personnel");
            }
          }
        ]
      );
    } else {
      setIsAuthorized(false);
      setUserType("Local User");
      setIdPhoto(null);
    }
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
    <View style={styles.container}>
      <Text style={styles.title}>Register Here</Text>
     
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

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={handleCheckbox}>
          <Text style={styles.checkboxText}>
            {isAuthorized ? "✅ Authorized Personnel" : "⬜ Authorized Personnel"}
          </Text>
        </TouchableOpacity>
      </View>

      {isAuthorized && (
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <Text style={styles.photoButtonText}>Take ID Photo</Text>
        </TouchableOpacity>
      )}

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    marginBottom: 15,
  },
  checkboxText: {
    fontSize: 16,
    color: "#555",
  },
  button: {
    backgroundColor: "#008000",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  backButton: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#008000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  backButtonText: {
    color: "#008000",
    fontWeight: "bold",
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: "#FFA500",
    width: "100%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  }
});

export default RegisterScreen;