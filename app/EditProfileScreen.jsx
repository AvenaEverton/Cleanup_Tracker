// app/EditProfileScreen.js (or app/EditProfileScreen.jsx)
import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// Import your local images
import icon7 from '../assets/images/dog.png';
import icon8 from '../assets/images/cat.png';
import icon9 from '../assets/images/koala.png';
import icon10 from '../assets/images/gorilla.png';
import icon11 from '../assets/images/meerkat.png';
import icon12 from '../assets/images/lion.png';

// Import your avatar border images
import borderDefault from '../assets/images/border_default.png';
import borderFire from '../assets/images/border_fire.png';
import borderCool from '../assets/images/border_cool.png';
import borderInsane from '../assets/images/border_insane.png';
import borderCloud from '../assets/images/border_cloud.png';
import borderHappy from '../assets/images/border_happy.png';

const profileIcons = [
    { name: 'user-circle', source: null },   // Default user circle
    { name: 'user', source: null },         // Simple user icon
    { name: 'user-o', source: null },       // Outlined user icon
    { name: 'male', source: null },         // Male icon
    { name: 'female', source: null },       // Female icon
    { name: 'child', source: null },        // Child icon
    { name: null, source: icon7 },
    { name: null, source: icon8 },
    { name: null, source: icon9 },
    { name: null, source: icon10 },
    { name: null, source: icon11 },
    { name: null, source: icon12 },
];

const avatarBorderOptions = [
    { name: 'Default', source: borderDefault },
    { name: 'Hot', source: borderFire },
    { name: 'Cool', source: borderCool },
    { name: 'Leaf', source: borderInsane },
    { name: 'Cloud', source: borderCloud },
    { name: 'Happy', source: borderHappy },
];

export default function EditProfileScreen() {
    const router = useRouter();
    const { darkMode } = useContext(ThemeContext);
    const { firstName: initialFirstName, lastName: initialLastName, profilePicture: initialProfilePicture } = useLocalSearchParams();

    const [profilePicture, setProfilePicture] = useState(initialProfilePicture || null);
    const [selectedIconIndex, setSelectedIconIndex] = useState(0);
    const [selectedBorderIndex, setSelectedBorderIndex] = useState(0);

    useEffect(() => {
        const loadSavedProfileSettings = async () => {
            try {
                const savedIconIndex = await AsyncStorage.getItem('selectedIconIndex');
                const savedBorderIndex = await AsyncStorage.getItem('selectedBorderIndex');
                const savedProfilePicture = await AsyncStorage.getItem('profilePicture');
                if (savedIconIndex !== null) {
                    setSelectedIconIndex(parseInt(savedIconIndex, 10));
                }
                if (savedBorderIndex !== null) {
                    setSelectedBorderIndex(parseInt(savedBorderIndex, 10));
                }
                if (savedProfilePicture !== null) {
                    setProfilePicture(savedProfilePicture);
                }
            } catch (error) {
                console.error("Error loading saved profile settings:", error);
            }
        };
        loadSavedProfileSettings();
    }, []);

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
            await AsyncStorage.setItem('selectedIconIndex', selectedIconIndex.toString());
            await AsyncStorage.setItem('selectedBorderIndex', selectedBorderIndex.toString());
            if (profilePicture) {
                await AsyncStorage.setItem('profilePicture', profilePicture);
            } else {
                await AsyncStorage.removeItem('profilePicture');
            }
            router.back();
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const getAvatarBorderStyle = () => {
        const baseStyle = {
            ...StyleSheet.absoluteFillObject,
            borderRadius: 50,
        };

        const isCloudOrHappy = (avatarBorderOptions[selectedBorderIndex]?.source === borderCloud ||
                                avatarBorderOptions[selectedBorderIndex]?.source === borderHappy);

        if (isCloudOrHappy) {
            return {
                ...baseStyle,
                width: 200, // Significantly increased width
                height: 200, // Significantly increased height
                left: -50,   // Adjust to center the bigger border
                top: -50,    // Adjust to center the bigger border
            };
        } else {
            return {
                ...baseStyle,
                width: 100,
                height: 100,
            };
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileImageContainer}>
                <View style={styles.mainProfileIcon}>
                    {profilePicture ? (
                        <Image source={{ uri: profilePicture }} style={styles.mainProfileImage} />
                    ) : (
                        <Icon name={profileIcons[selectedIconIndex].name} size={80} color="#333" />
                    )}
                    {avatarBorderOptions[selectedBorderIndex]?.source && (
                        <Image
                            source={avatarBorderOptions[selectedBorderIndex].source}
                            style={[styles.avatarBorderImage, getAvatarBorderStyle()]}
                            resizeMode="contain" // Or 'cover'
                        />
                    )}
                </View>
                <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
                    <Icon name="pencil" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.selectProfileSection}>
                <Text style={styles.selectProfileText}>SELECT PROFILE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
                    {profileIcons.map((icon, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.iconOption,
                                selectedIconIndex === index && styles.selectedIconOption,
                            ]}
                            onPress={() => {
                                setSelectedIconIndex(index);
                                setProfilePicture(null); // Reset profile picture when an icon is selected
                            }}
                        >
                            {icon.source ? (
                                <Image source={icon.source} style={styles.iconImage} resizeMode="contain" />
                            ) : (
                                <Icon name={icon.name} size={30} color="#333" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.avatarBorderStyleSection}>
                <Text style={styles.avatarBorderStyleText}>Avatar Border Style</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.borderScrollView}>
                    <View style={styles.borderOptionRow}>
                        {avatarBorderOptions.map((border, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.borderOption,
                                    selectedBorderIndex === index && styles.selectedBorderOption,
                                ]}
                                onPress={() => setSelectedBorderIndex(index)}
                            >
                                <View style={styles.borderPreview}>
                                    <Image
                                        source={border.source}
                                        style={styles.borderPreviewImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.borderName}>{border.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 30,
    },
    profileImageContainer: {
        marginBottom: 30,
        alignItems: 'center',
        position: 'relative', // To position the edit icon
    },
    mainProfileIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainProfileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarBorderImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 50,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        backgroundColor: '#007bff',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectProfileSection: {
        alignItems: 'center',
        marginBottom: 30,
        width: '90%',
    },
    selectProfileText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    iconScrollView: {
        flexDirection: 'row',
    },
    iconRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    iconOption: {
        width: 60,
        height: 60,
        borderRadius: 45,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedIconOption: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    avatarBorderStyleSection: {
        alignItems: 'center',
        marginBottom: 40,
        width: '90%', // Added width for the scroll view container
    },
    avatarBorderStyleText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    borderScrollView: {
        flexDirection: 'row',
    },
    borderOptionRow: {
        flexDirection: 'row',
    },
    borderOption: {
        width: 70,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    selectedBorderOption: {
        // Style for the selected border option (you can add visual feedback)
    },
    borderPreview: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
        overflow: 'hidden', // To contain the image within the circle
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderPreviewImage: {
        width: 40,
        height: 40,
    },
    buttonContainer: {
        width: '80%',
    },
    saveButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    cancelButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    iconImage: {
        width: 45,
        height: 45,
    },
    borderName: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
    },
});