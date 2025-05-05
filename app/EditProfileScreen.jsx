// app/EditProfileScreen.js (or app/EditProfileScreen.jsx)
import React, { useState, useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { ThemeContext } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    { name: 'child', source: null },         // Child icon
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
    const [previewIconIndex, setPreviewIconIndex] = useState(null);

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
            setPreviewIconIndex(null);
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
                width: 200,
                height: 200,
                left: -50,
                top: -50,
            };
        } else {
            return {
                ...baseStyle,
                width: 100,
                height: 100,
            };
        }
    };

    const handleIconPress = (index) => {
        setPreviewIconIndex(index);
    };

    const handleIconSelect = (index) => {
        setSelectedIconIndex(index);
        setProfilePicture(null);
        setPreviewIconIndex(null);
    };

    const displayedProfileSource = previewIconIndex !== null
        ? profileIcons[previewIconIndex].source
        : (profilePicture ? { uri: profilePicture } : null);

    const displayedProfileIconName = previewIconIndex !== null
        ? profileIcons[previewIconIndex].name
        : null;

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/profilebg.webp')}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            <View style={styles.contentContainer}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity style={styles.mainProfileIcon} onPress={() => setPreviewIconIndex(null)}>
                        {displayedProfileSource ? (
                            <Image source={displayedProfileSource} style={styles.mainProfileImage} />
                        ) : (
                            <Icon name={displayedProfileIconName || profileIcons[selectedIconIndex].name} size={80} color="#333" />
                        )}
                        {avatarBorderOptions[selectedBorderIndex]?.source && (
                            <Image
                                source={avatarBorderOptions[selectedBorderIndex].source}
                                style={[styles.avatarBorderImage, getAvatarBorderStyle()]}
                                resizeMode="contain"
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
                        <Icon name="pencil" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.selectProfileSection}>
                    <Text style={styles.selectProfileText}>SELECT PROFILE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
                        <View style={styles.iconRow}>
                            {profileIcons.map((icon, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.iconOption,
                                        selectedIconIndex === index && styles.selectedIconOption,
                                    ]}
                                    onPress={() => handleIconSelect(index)}
                                >
                                    {icon.source ? (
                                        <Image source={icon.source} style={styles.iconImage} resizeMode="contain" />
                                    ) : (
                                        <Icon name={icon.name} size={30} color="#333" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
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
                    <View style={[styles.cancelButtonContainer, { backgroundColor: '#fff' }]}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 30,
        width: '100%',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    profileImageContainer: {
        marginBottom: 30,
        alignItems: 'center',
        position: 'relative',
    },
    mainProfileIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
        backgroundColor: '#4CAF50',
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    iconScrollView: {
        flexDirection: 'row',
        paddingBottom: 10,
    },
    iconRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    iconOption: {
        width: 70,
        height: 70,
        borderRadius: 50,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedIconOption: {
        borderColor: '#4CAF50',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    avatarBorderStyleSection: {
        alignItems: 'center',
        marginBottom: 40,
        width: '90%',
    },
    avatarBorderStyleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    borderScrollView: {
        flexDirection: 'row',
        paddingBottom: 10,
    },
    borderOptionRow: {
        flexDirection: 'row',
    },
    borderOption: {
        width: 80,
        alignItems: 'center',
        marginHorizontal: 15,
    },
    selectedBorderOption: {
    },
    borderPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    borderPreviewImage: {
        width: 50,
        height: 50,
    },
    buttonContainer: {
        width: '80%',
        marginBottom: 20,
        flexDirection: 'column', // Stack buttons vertically
        alignItems: 'stretch', // Make buttons stretch to container width
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    cancelButtonContainer: {
        alignItems: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    iconImage: {
        width: 50,
        height: 50,
    },
    borderName: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginTop: 5,
        fontWeight: 'bold', // Make the text bold
        textShadowColor: 'rgba(255, 255, 255, 0.8)', // White outline
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 3,
    },
});

