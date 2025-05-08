import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminHome from "../AdminTabs/Admin_home";
import AdminEvents from "../AdminTabs/Admin_events";
import AdminProfile from "../AdminTabs/Admin_profile";
import AdminUsers from "../AdminTabs/Admin_users";
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

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
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarStyle: {
          backgroundColor: '#008000',
          borderTopColor: 'transparent',
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={AdminHome} />
      <Tab.Screen name="Events" component={AdminEvents} />
      <Tab.Screen name="Users" component={AdminUsers} />
      <Tab.Screen name="Profile" component={AdminProfile} />
    </Tab.Navigator>
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
    fontSize: 25,
    marginRight: 5,
    fontWeight: 'bold'
  },
  profileAndLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AdminTabs;   