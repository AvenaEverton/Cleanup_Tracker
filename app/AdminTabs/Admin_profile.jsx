import React, { useContext, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const AdminProfile = () => {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [settingsVisible, setSettingsVisible] = useState(false);

    // Handle Logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            router.replace("/LoginScreen");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const navigateToFeature = (feature) => {
        console.log(`Navigating to: ${feature}`);
    };

    const toggleSettings = () => {
        setSettingsVisible(!settingsVisible);
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={[
                    styles.container,
                    darkMode ? styles.darkContainer : styles.lightContainer,
                ]}
            >
                {/* Top Navigation Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={toggleDarkMode} style={styles.topBarItem}>
                        <Ionicons
                            name={darkMode ? "moon" : "sunny"}
                            size={24}
                            color={darkMode ? "#E5E7EB" : "#4A5568"}
                        />
                        <Text style={styles.topBarText}>
                            {darkMode ? "Dark Mode" : "Light Mode"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleSettings} style={styles.topBarItemRight}>
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color={darkMode ? "#E5E7EB" : "#A0AEC0"}
                        />
                        <Text style={styles.topBarText}>
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => console.log("Edit Profile")}
                        style={styles.profilePlaceholderContainer}
                    >
                        <Ionicons
                            name="person-circle"
                            size={80}
                            color={darkMode ? "#D1D5DB" : "#9CA3AF"}
                        />
                        <View style={styles.editIcon}>
                            <Ionicons name="pencil" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>
                        Admin User
                    </Text>
                    <Text style={styles.userRole}>
                        Administrator
                    </Text>
                </View>

                {/* Features Grid */}
                <View style={styles.featuresGrid}>
                    <TouchableOpacity
                        style={[
                            styles.featureItem,
                            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
                        ]}
                        onPress={() => navigateToFeature("Events")}
                    >
                        <View style={styles.featureIconContainer}>
                            <Ionicons name="calendar" size={28} color="#68D391" />
                        </View>
                        <Text style={styles.featureText}>
                            Events
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.featureItem,
                            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
                        ]}
                        onPress={() => navigateToFeature("Reports")}
                    >
                        <View style={styles.featureIconContainer}>
                            <Ionicons name="document-text" size={28} color="#4299E1" />
                        </View>
                        <Text style={styles.featureText}>
                            Reports
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.featureItem,
                            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
                        ]}
                        onPress={() => navigateToFeature("Participants")}
                    >
                        <View style={styles.featureIconContainer}>
                            <Ionicons name="people-outline" size={28} color="#805AD5" />
                        </View>
                        <Text style={styles.featureText}>
                            Participants
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.featureItem,
                            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
                        ]}
                        onPress={() => navigateToFeature("Saved")}
                    >
                        <View style={styles.featureIconContainer}>
                            <Ionicons name="bookmark-outline" size={28} color="#ED8936" />
                        </View>
                        <Text style={styles.featureText}>
                            Saved
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            {/* Settings Modal (Improved) */}
            {settingsVisible && (
                <View style={styles.settingsOverlay}>
                    <View
                        style={[
                            styles.settingsContainer,
                            darkMode
                                ? styles.darkSettingsContainer
                                : styles.lightSettingsContainer,
                        ]}
                    >
                        <TouchableOpacity onPress={toggleSettings} style={styles.settingsCloseButton}>
                            <Ionicons
                                name="close-outline"
                                size={32}
                                color={darkMode ? "#F7FAFC" : "#1A202C"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.settingsItem}>
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color={darkMode ? "#E5E7EB" : "#4A5568"}
                                style={styles.settingsIcon}
                            />
                            <Text style={styles.settingsText}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 0,
        paddingTop: 0,
        backgroundColor: "#F4F6F8",
    },
    darkContainer: {
        backgroundColor: "#1A202C",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 15,
        marginBottom: 0,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
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
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "600",
        color: "#4A5568",
    },
    header: {
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
    },
    profilePlaceholderContainer: {
        position: "relative",
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E0E0E0",
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    editIcon: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "#3B82F6",
        borderRadius: 14,
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    userName: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 15,
        color: "#2D3748",
    },
    userRole: {
        fontSize: 18,
        fontWeight: "500",
        color: "#718096",
        marginTop: 5,
    },
    lightText: {
        color: "#2D3748",
    },
    darkText: {
        color: "#F7FAFC",
    },
    featuresGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 30,
        marginTop: 10,
    },
    featureItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 25,
        paddingHorizontal: 20,
        width: "48%",
        marginBottom: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        transition: "transform 0.2s ease-in-out, shadow-opacity 0.2s ease-in-out",
    },
    featureItemHovered: {
        transform: "scale(1.04)",
        shadowOpacity: 0.3,
    },
    darkFeatureItem: {
        backgroundColor: "#2D3748",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        transition: "transform 0.2s ease-in-out, shadow-opacity 0.2s ease-in-out",
    },
    featureText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        color: "#4A5568",
    },
    featureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#E2E8F0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 5,
    },
    darkFeatureIconContainer: {
        backgroundColor: "#4A5568",
    },
    switchContainer: {
        // Removed
    },
    label: {
        // Removed
    },
    button: {
        // Removed
    },
    darkButton: {
        // Removed
    },
    buttonText: {
        // Removed
    },
    settingsOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 10,
        justifyContent: "flex-start",
    },
    settingsContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 25,
        paddingHorizontal: 25,
        marginTop: 70,
        marginRight: 0,
        width: "auto",
        alignSelf: "flex-end",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 5,
    },
    darkSettingsContainer: {
        backgroundColor: "#2D3748",
    },
    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#EDF2F7",
        marginBottom: 0,
    },
    settingsItemLast: {
        borderBottomWidth: 0,
    },
    settingsIcon: {
        marginRight: 12,
        color: "#A0AEC0",
    },
    settingsText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2D3748",
    },
    settingsCloseButton: {
        position: "absolute",
        top: 5,
        left: 10,
        backgroundColor: "transparent",
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default AdminProfile;

