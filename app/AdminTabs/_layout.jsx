import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminHome from "../AdminTabs/Admin_home";
import AdminEvents from "../AdminTabs/Admin_events";
import AdminProfile from "../AdminTabs/Admin_profile";
import AdminUsers from "../AdminTabs/Admin_users";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Events") iconName = "calendar";
          else if (route.name === "Users") iconName = "people";
          else if (route.name === "Menu") iconName = "menu";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={AdminHome} />
      <Tab.Screen name="Events" component={AdminEvents} />
      <Tab.Screen name="Users" component={AdminUsers} />
      <Tab.Screen name="Menu" component={AdminProfile} />
    </Tab.Navigator>
  );
}
