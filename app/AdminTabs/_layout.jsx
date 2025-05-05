import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminHome from "../AdminTabs/Admin_home";
import AdminEvents from "../AdminTabs/Admin_events";
import AdminProfile from "../AdminTabs/Admin_profile";
import AdminUsers from "../AdminTabs/Admin_users";
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'; // Import TouchableOpacity
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5


const Tab = createBottomTabNavigator();

const Header = ({ title, icon, navigation }) => {
    return (
        <View style={styles.headerContainer}>
            <Ionicons name={icon} size={24} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>{title}</Text>
            {title === 'Home' && (
                <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate('Profile')}>
                    <View style={styles.profileCircle}>
                        <FontAwesome5 name="user-shield" size={30} color="white" />
                    </View>
                </TouchableOpacity>
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
                    tabBarActiveTintColor: "#007bff",
                    tabBarInactiveTintColor: "gray",
                    headerShown: false, // Hide the default header
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={AdminHome}
                    options={{
                        header: ({ navigation }) => <Header title="Home" icon="home" navigation={navigation} />,
                        headerShown: true, // Show the custom header for this screen
                    }}
                />
                <Tab.Screen
                    name="Events"
                    component={AdminEvents}
                    options={{
                        header: ({ navigation }) => <Header title="Events" icon="calendar" navigation={navigation} />,
                        headerShown: true,
                    }}
                />
                <Tab.Screen
                    name="Users"
                    component={AdminUsers}
                    options={{
                        header: ({ navigation }) => <Header title="Users" icon="people" navigation={navigation} />,
                        headerShown: true,
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={AdminProfile}
                    options={{
                        header: ({ navigation }) => <Header title="Profile" icon="person" navigation={navigation} />,
                        headerShown: true,
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#008000',
        paddingVertical: 20,
        paddingHorizontal: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        flex: 1,
    },
    headerIcon: {
        marginRight: 5,
        color: 'white',
        size: 28,
    },
    profileIconContainer: {
        padding: 5,
    },
    profileCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 2,  // Added border
        borderColor: 'white', // Added border color
    },
});

export default AdminTabs;
