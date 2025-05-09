import React, { useContext, useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    Dimensions,
    Animated,
    Easing,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ThemeContext } from "../../context/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from 'react-native-safe-area-context';
const axios = require('axios');

// Import your avatar border images
import borderDefault from '../../assets/images/border_default.png';
import borderFire from '../../assets/images/border_fire.png';
import borderCool from '../../assets/images/border_cool.png';
import borderInsane from '../../assets/images/border_insane.png';
import borderCloud from '../../assets/images/border_cloud.png';
import borderHappy from '../../assets/images/border_happy.png';

const APP_VERSION = "1.0.0";
const { width, height } = Dimensions.get("window");

const avatarBorderOptions = [
    { name: 'Default', source: borderDefault },
    { name: 'Hot', source: borderFire },
    { name: 'Cool', source: borderCool },
    { name: 'Leaf', source: borderInsane },
    { name: 'Cloud', source: borderCloud },
    { name: 'Happy', source: borderHappy },
];

const ProfileScreen = () => {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [showSettings, setShowSettings] = useState(false);
    const [reportCount, setReportCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [selectedBorderIndex, setSelectedBorderIndex] = useState(0);
    const rotationAnim = useRef(new Animated.Value(0)).current;
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [iconRotation, setIconRotation] = useState(0);
    const switchRotationAnim = useRef(new Animated.Value(0)).current;
    const [reportImages, setReportImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    // In ProfileScreen.js
const [profileSettings, setProfileSettings] = useState({
    profilePicture: null,
    selectedBorderIndex: 0,
    iconName: 'user-circle',
    iconSource: null
});

    useEffect(() => {
        Animated.timing(rotationAnim, {
            toValue: isSettingsOpen ? 1 : 0,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();

        fetchUserData();
        loadProfileSettings();
    }, [isSettingsOpen]);

    const loadProfileSettings = async () => {
        try {
            const savedBorderIndex = await AsyncStorage.getItem('selectedBorderIndex');
            const savedProfilePicture = await AsyncStorage.getItem('profilePicture');
            
            if (savedBorderIndex !== null) {
                setSelectedBorderIndex(parseInt(savedBorderIndex, 10));
            }
            if (savedProfilePicture !== null) {
                setProfilePicture(savedProfilePicture);
            }
        } catch (error) {
            console.error("Error loading profile settings:", error);
        }
    };

    const fetchUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem("userData");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                const fullName = userData.fullName || "User";
                const nameParts = fullName.split(" ");
                setFirstName(nameParts[0]);
                setLastName(nameParts.slice(1).join(" ") || "");
                if (userData.profilePicture) {
                    setProfilePicture(userData.profilePicture);
                }

                fetchUserStats(userData.userId);
            } else {
                console.log("No user data found in AsyncStorage");
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        }
    };

    const fetchUserStats = async (userId) => {
        try {
          const response = await fetch(`https://backend-rt98.onrender.com/api/user/stats/${userId}`);
          if (!response.ok) {
            console.log("Failed with status:", response.status);
            throw new Error('Failed to fetch user stats');
          }
      
          const data = await response.json();
          console.log("Fetched stats:", data);
          setReportCount(data.reportCount);
          setEventCount(data.eventCount);
        } catch (error) {
          console.error("Failed to fetch user stats", error);
        }
    };    

    const animatedStyle = {
        transform: [
            {
                rotate: rotationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                }),
            },
        ],
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
        setShowSettings(!showSettings);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            router.replace("/LoginScreen");
        } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "Logout failed. Please try again.");
        }
    };

    const handleEditProfile = () => {
        router.push({
            pathname: "/EditProfileScreen",
            params: {
                firstName,
                lastName,
                profilePicture
            }
        });
    };

    const handleImageSelect = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
            try {
                const userDataString = await AsyncStorage.getItem("userData");
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    userData.profilePicture = result.assets[0].uri;
                    await AsyncStorage.setItem("userData", JSON.stringify(userData));
                }
            } catch (error) {
                console.error("Failed to update user data:", error);
                Alert.alert("Error", "Failed to update profile picture.");
            }
        }
    };

    const handleToggleDarkMode = () => {
        setIconRotation(prevRotation => prevRotation + 1);
        toggleDarkMode();

        Animated.timing(switchRotationAnim, {
            toValue: iconRotation + 1,
            duration: 500,
            easing: Easing.easeInOut,
            useNativeDriver: true,
        }).start();
    };

    const switchIconAnimatedStyle = {
        transform: [
            {
                rotate: switchRotationAnim.interpolate({
                    inputRange: [iconRotation, iconRotation + 1],
                    outputRange: ['0deg', '360deg'],
                }),
            },
        ],
    };

    const getAvatarBorderStyle = () => {
        const baseStyle = {
            ...StyleSheet.absoluteFillObject,
            borderRadius: 60,
        };

        const selectedBorder = avatarBorderOptions[selectedBorderIndex]?.source;
        const isCloudOrHappy = (selectedBorder === borderCloud || selectedBorder === borderHappy);

        if (isCloudOrHappy) {
            return {
                ...baseStyle,
                width: 140,
                height: 140,
                left: -10,
                top: -10,
            };
        } else {
            return {
                ...baseStyle,
                width: 120,
                height: 120,
            };
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={require("../../assets/images/profilebg.webp")}
                style={styles.backgroundImage}
                resizeMode="cover"
                zIndex={-100}
            />
            <TouchableWithoutFeedback
                onPress={() => {
                    if (showSettings) {
                        setShowSettings(false);
                        setIsSettingsOpen(false);
                    }
                }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        darkMode ? styles.darkContainer : styles.lightContainer,
                    ]}
                    style={{ flex: 1 }}
                >
                    <SafeAreaView style={{ width: '100%' }}>
                        {/* Header */}
                        <View style={styles.headerBar}>
                            <View style={styles.headerLeftContainer}>
                                <TouchableOpacity 
                                    style={styles.darkModeToggle}
                                    onPress={handleToggleDarkMode}
                                >
                                    <Animated.View style={switchIconAnimatedStyle}>
                                        {darkMode ? (
                                            <Icon name="moon-o" size={24} color="#fff" />
                                        ) : (
                                            <Icon name="sun-o" size={24} color="#333" />
                                        )}
                                    </Animated.View>
                                    <Text style={[styles.modeLabel, darkMode ? styles.darkText : styles.lightText]}>
                                        {darkMode ? "Night Mode" : "Light Mode"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.headerRightContainer}>
                                <TouchableOpacity style={styles.settingsIcon} onPress={toggleSettings}>
                                    <Animated.View style={animatedStyle}>
                                        <Icon name="cog" size={28} color={darkMode ? "#ffffff" : "#333"} />
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>

                    {/* Profile Icon/Image */}
                    <View style={styles.profileContainer}>
                        <TouchableOpacity onPress={handleImageSelect}>
                            <View style={styles.profileIconWrapper}>
                                {profilePicture ? (
                                    <>
                                        <Image source={{ uri: profilePicture }} style={styles.profileIcon} />
                                        {avatarBorderOptions[selectedBorderIndex]?.source && (
                                            <Image
                                                source={avatarBorderOptions[selectedBorderIndex].source}
                                                style={[styles.avatarBorderImage, getAvatarBorderStyle()]}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <View style={styles.profileIconPlaceholder}>
                                        <Icon name="user-circle" size={80} color={darkMode ? "#ddd" : "#777"} />
                                        {avatarBorderOptions[selectedBorderIndex]?.source && (
                                            <Image
                                                source={avatarBorderOptions[selectedBorderIndex].source}
                                                style={[styles.avatarBorderImage, getAvatarBorderStyle()]}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </View>
                                )}
                                <View style={styles.editIconContainer}>
                                    <Icon name="pencil" size={16} color="#fff" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>
                            {firstName} {lastName}
                        </Text>
                        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={[styles.statBox, { borderRightWidth: 1, borderRightColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : '#ddd' }]}>
                            <View style={[styles.statCountContainer, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : { backgroundColor: '#fff' }]}>
                                <Text style={[styles.reportCount, darkMode ? styles.darkText : styles.lightText]}>
                                    {reportCount}
                                </Text>
                            </View>
                            <View style={[styles.statLabelContainer, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : { backgroundColor: '#fff' }]}>
                                <Text style={[styles.reportLabel, darkMode ? styles.darkText : styles.lightText, { fontSize: 20 }]}>
                                    Reports
                                </Text>
                            </View>
                        </View>

                        <View style={styles.statBox}>
                            <View style={[styles.statCountContainer, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : { backgroundColor: '#fff' }]}>
                                <Text style={[styles.eventCount, darkMode ? styles.darkText : styles.lightText]}>
                                    {eventCount}
                                </Text>
                            </View>
                            <View style={[styles.statLabelContainer, darkMode ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : { backgroundColor: '#fff' }]}>
                                <Text style={[styles.eventLabel, darkMode ? styles.darkText : styles.lightText, { fontSize: 20 }]}>
                                    Events
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Reports History */}
                    <View style={[styles.reportsHistoryContainer, { marginTop: height * 0.02, marginBottom: height * 0.05, backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }]}>
                        <Text style={[styles.reportsHistoryTitle, darkMode ? styles.darkText : styles.lightText]}>
                            Reports History
                        </Text>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
            {/* Settings Overlay */}
            {isSettingsOpen && (
                <View
                    style={[
                        styles.settingsOverlay,
                        darkMode ? styles.darkOverlay : styles.lightOverlay,
                    ]}
                >
                    <Text style={[styles.settingsTitle, darkMode ? styles.darkText : styles.lightText]}>
                        Settings
                    </Text>
                    <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="sign-out" size={20} color="red" style={{ marginRight: 5 }} />
                            <Text style={styles.optionText}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.versionTextSettings}>App Version: {APP_VERSION}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingBottom: 80,
    },
    lightContainer: { backgroundColor: "transparent" },
    darkContainer: { backgroundColor: 'rgba(0, 0, 50, 0.8)' },
    headerBar: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerLeftContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    darkModeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    modeLabel: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    settingsIcon: { 
        padding: 5, 
        zIndex: 1000 
    },
    profileContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 15,
        zIndex: 1,
    },
    profileIconWrapper: {
        position: "relative",
        width: 120,
        height: 120,
    },
    profileIconPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightgray",
    },
    profileIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 15,
    },
    avatarBorderImage: {
        position: 'absolute',
        zIndex: -1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        color: "#333",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginVertical: 20,
    },
    statBox: {
        alignItems: "center",
        flex: 1,
    },
    reportCount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    reportLabel: {
        fontSize: 18,
        color: "#555",
    },
    eventCount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    eventLabel: {
        fontSize: 18,
        color: "#555",
    },
    darkText: { color: "#ffffff" },
    lightText: { color: "#333" },
    label: { fontSize: 18, marginRight: 10 },
    settingsOverlay: {
        position: "absolute",
        top: 50,
        right: 0,
        width: 180,
        backgroundColor: "white",
        padding: 10,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10000,
        zIndex: 10000,
    },
    darkOverlay: { backgroundColor: 'rgba(0, 0, 50, 0.9)' },
    lightOverlay: { backgroundColor: "#fff" },
    settingsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    optionButton: {
        paddingVertical: 10,
    },
    optionText: {
        fontSize: 14,
        color: "red",
    },
    versionText: {
        position: "absolute",
        bottom: 20,
        fontSize: 14,
        color: "#777",
        textAlign: 'center'
    },
    editProfileButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        marginTop: 15,
    },
    editProfileText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    reportsHistoryContainer: {
        width: "95%",
        alignItems: "flex-start",
        paddingVertical: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 15,
        marginTop: height * 0.02,
        marginBottom: height * 0.05
    },
    reportsHistoryTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        marginLeft: 20,
        color: "#333",
    },
    placeholdersContainer: {
        flexDirection: "row",
        gap: 15,
        paddingHorizontal: 20,
    },
    placeholderBox: {
        width: 250,
        height: 150,
        backgroundColor: "#ddd",
        borderRadius: 12,
    },
    editIconContainer: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#4CAF50",
        borderRadius: 15,
        padding: 5,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -100,
    },
    statCountContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    statLabelContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    versionTextSettings: {
        fontSize: 14,
        color: "#777",
        marginTop: 10,
        textAlign: 'center'
    },
    imageBox: {
        width: 250,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
    },
    reportImage: {
        width: '100%',
        height: '100%',
    },
});

export default ProfileScreen;