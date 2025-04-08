import React, { useContext, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Switch,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons

const AdminProfile = () => {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Handle Logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken"); // Remove user session
            router.replace("/LoginScreen"); // Navigate back to login
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navigateToFeature = (feature) => {
        console.log(`Navigating to: ${feature}`);
        // Implement navigation logic for each feature as needed
    };

    const toggleSettings = () => {
        setSettingsVisible(!settingsVisible);
    };

    return (
        <ScrollView style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
            {/* Top Navigation Bar */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={toggleDarkMode} style={styles.topBarItem}>
                    <Ionicons
                        name={darkMode ? "moon" : "sunny"}
                        size={24}
                        color={darkMode ? "#E5E7EB" : "#4A5568"}
                    />
                    <Text style={[styles.topBarText, darkMode ? styles.darkText : styles.lightText]}>
                        {darkMode ? "Dark" : "Light"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleSettings} style={styles.topBarItemRight}>
                    <Ionicons name="settings-outline" size={24} color={darkMode ? "#E5E7EB" : "#4A5568"} />
                    <Text style={[styles.topBarText, darkMode ? styles.darkText : styles.lightText]}>
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => console.log("Edit Profile")} style={styles.profilePlaceholderContainer}>
                    <Ionicons name="person-circle" size={80} color={darkMode ? "#ddd" : "#777"} />
                    <View style={styles.editIcon}>
                        <Ionicons name="pencil" size={16} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={[styles.userName, darkMode ? styles.darkText : styles.lightText]}>Admin User</Text>
            </View>

            {/* Features Grid */}
            <View style={styles.featuresGrid}>
                <TouchableOpacity style={[styles.featureItem, darkMode ? styles.darkFeatureItem : styles.lightFeatureItem]} onPress={() => navigateToFeature("Events")}>
                    <Ionicons name="calendar" size={24} color="#548C2F" />
                    <Text style={[styles.featureText, darkMode ? styles.darkText : styles.lightText]}>Events</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.featureItem, darkMode ? styles.darkFeatureItem : styles.lightFeatureItem]} onPress={() => navigateToFeature("Reports")}>
                    <Ionicons name="document-text" size={24} color="#3B82F6" />
                    <Text style={[styles.featureText, darkMode ? styles.darkText : styles.lightText]}>Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.featureItem, darkMode ? styles.darkFeatureItem : styles.lightFeatureItem]} onPress={() => navigateToFeature("Participants")}>
                    <Ionicons name="people-outline" size={24} color="#6D28D9" />
                    <Text style={[styles.featureText, darkMode ? styles.darkText : styles.lightText]}>Participants</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.featureItem, darkMode ? styles.darkFeatureItem : styles.lightFeatureItem]} onPress={() => navigateToFeature("Saved")}>
                    <Ionicons name="bookmark-outline" size={24} color="#F59E0B" />
                    <Text style={[styles.featureText, darkMode ? styles.darkText : styles.lightText]}>Saved</Text>
                </TouchableOpacity>
            </View>

            {/* Settings Modal (Simple Implementation) */}
            {settingsVisible && (
                <View style={[styles.settingsContainer, darkMode ? styles.darkSettingsContainer : styles.lightSettingsContainer]}>
                    <TouchableOpacity onPress={handleLogout} style={styles.settingsItem}>
                        <Ionicons name="log-out-outline" size={22} color={darkMode ? "#E5E7EB" : "#4A5568"} style={styles.settingsIcon} />
                        <Text style={[styles.settingsText, darkMode ? styles.darkText : styles.lightText]}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleSettings} style={styles.settingsCloseButton}>
                        <Ionicons name="close-outline" size={28} color={darkMode ? "#E5E7EB" : "#4A5568"} />
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15, // Adjusted top padding to accommodate top bar
        backgroundColor: "#F4F6F8",
    },
    darkContainer: {
        backgroundColor: "#1E293B",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        marginBottom: 20,
    },
    topBarItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    topBarItemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    topBarText: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: "500",
        color: "#4A5568",
    },
    header: {
        alignItems: "center",
        paddingBottom: 30,
    },
    profilePlaceholderContainer: {
        position: "relative",
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E0E0E0",
        marginBottom: 15,
    },
    editIcon: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#3B82F6",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    userName: {
        fontSize: 24,
        fontWeight: "600",
        marginTop: 10,
        color: "#374151",
    },
    lightText: {
        color: "#374151",
    },
    darkText: {
        color: "#E5E7EB",
    },
    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    featureItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 20,
        paddingHorizontal: 15,
        width: "48%",
        marginBottom: 15,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    darkFeatureItem: {
        backgroundColor: "#2D3748",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    featureText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        color: "#4A5568",
    },
    switchContainer: {
        // Removed as Dark Mode is now in the top bar
    },
    label: {
        // Removed
    },
    button: {
        // Removed Logout Button from main screen
    },
    darkButton: {
        // Removed
    },
    buttonText: {
        // Removed
    },
    settingsContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 60, // Adjust as needed for status bar
        paddingRight: 20,
    },
    darkSettingsContainer: {
        // Inherits background color
    },
    settingsItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    darkSettingsItem: {
        backgroundColor: '#2D3748',
    },
    settingsIcon: {
        marginRight: 10,
    },
    settingsText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4A5568',
    },
    settingsCloseButton: {
        marginTop: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default AdminProfile;