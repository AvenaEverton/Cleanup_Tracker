// app/EditProfileScreen.js (or app/EditProfileScreen.jsx)
import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

export default function EditProfileScreen() {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const { firstName: initialFirstName, lastName: initialLastName, profilePicture: initialProfilePicture } = useLocalSearchParams();
  // const { updateProfile } = useContext(ProfileContext); // Removed ProfileContext usage

  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const [profilePicture, setProfilePicture] = useState(initialProfilePicture || null);

  useEffect(() => {
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
    setProfilePicture(initialProfilePicture || null);
  }, [initialFirstName, initialLastName, initialProfilePicture]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await AsyncStorage.setItem('firstName', firstName);
      await AsyncStorage.setItem('lastName', lastName);
      if (profilePicture) {
        await AsyncStorage.setItem('profilePicture', profilePicture);
      } else {
        await AsyncStorage.removeItem('profilePicture');
      }
      router.back(); // Go back to the ProfileScreen
    } catch (error) {
      console.error("Error saving profile:", error);
      // Optionally display an error message to the user
    }
  };

  const handleCancel = () => {
    router.back(); // Go back to the ProfileScreen without saving
  };

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.header, darkMode ? styles.darkText : styles.lightText]}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileIconPlaceholder}>
            <Icon name="user-circle" size={100} color={darkMode ? "#ddd" : "#777"} />
          </View>
        )}
        <View style={styles.editIcon}>
          <Icon name="pencil" size={20} color="white" />
        </View>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f4f4f4",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  darkText: {
    color: "#fff",
  },
  lightText: {
    color: "#333",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileIconPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgray",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  darkInput: {
    borderColor: "#555",
    color: "#fff",
    backgroundColor: "#333",
  },
  lightInput: {
    borderColor: "#ccc",
    color: "#333",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});