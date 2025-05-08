import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminHome from "../AdminTabs/Admin_home";
import AdminEvents from "../AdminTabs/Admin_events";
import AdminProfile from "../AdminTabs/Admin_profile";
import AdminUsers from "../AdminTabs/Admin_users";
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'; // Import TouchableOpacity
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const Header = ({ title, icon, navigation }) => {
    return (
        <View style={styles.headerContainer}>
            <Ionicons name={icon} size={24} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>{title}</Text>
            {title === 'Home' && (
                <View style={styles.profileAndLabelContainer}>
                    <Text style={styles.adminLabel}>Admin</Text>
                    <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.profileCircle}>
                            <FontAwesome5 name="user-shield" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const AdminTabs = ({ navigation }) => {
    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === "Home") iconName = "home";
                        else if (route.name === "Events") iconName = "calendar";
                        else if (route.name === "Users") iconName = "people";
                        else if (route.name === "Profile") iconName = "person";

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#FFFFFF", // Active tab color
                    tabBarInactiveTintColor: "rgba(255,255,255,0.6)", // Inactive tab color
                    tabBarStyle: {
                        backgroundColor: '#008000', // Green background for the tab bar
                        borderTopColor: 'transparent', // Remove top border
                        height: 60, // Increased height of tab bar
                    },
                    tabBarLabelStyle: {
                        fontSize: 12, // Increased font size of labels
                        marginTop: 5,  // Add space between icon and label
                    },
                    headerShown: false, // Hide the default header
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={AdminHome}
                    options={{
                        header: ({ navigation }) => <Header title="Home" icon="home" navigation={navigation} />,
                        headerShown: true, // Show the custom header for this screen
                        tabBarLabel: 'Home', //Explicitly set tab bar label
                    }}
                />
                <Tab.Screen
                    name="Events"
                    component={AdminEvents}
                    options={{
                        header: ({ navigation }) => <Header title="Events" icon="calendar" navigation={navigation} />,
                        headerShown: true,
                        tabBarLabel: 'Events',
                    }}
                />
                <Tab.Screen
                    name="Users"
                    component={AdminUsers}
                    options={{
                        header: ({ navigation }) => <Header title="Users" icon="people" navigation={navigation} />,
                        headerShown: true,
                        tabBarLabel: 'Users',
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={AdminProfile}
                    options={{
                        header: ({ navigation }) => <Header title="Profile" icon="person" navigation={navigation} />,
                        headerShown: true,
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#008000',
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
        textAlign: 'left',
    },
    headerIcon: {
        marginRight: 8,
        color: 'white',
        size: 24,
    },
    profileIconContainer: {
        padding: 5,
    },
    profileCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'white',
    },
    adminLabel: {
        color: 'white',
        fontSize: 25, // Increased font size
        marginRight: 5, // Changed from marginLeft to marginRight
        fontWeight: 'bold'
    },
    profileAndLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default AdminTabs;
