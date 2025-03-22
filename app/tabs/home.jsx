import React, { useContext, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing  } from 'react-native';

export default function HomeScreen() {
  const { darkMode } = useContext(ThemeContext);
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const rotate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'] // ✅ Natural human wave na super soft
  });
  
  return (
    <View style={[styles.container, darkMode ? styles.darkBackground : styles.lightBackground]}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#999"
        />
        <Ionicons name="search" size={20} color="#666" />
      </View>

{/* Header Background */}
<View style={styles.headerBackground}>
  <View style={styles.overlayContent}>
    <View style={styles.greetingContainer}>
    <Text 
  style={[
    styles.greetingText, 
    darkMode ? styles.darkText : styles.lightText, 
    { transform: [{ translateY: 30 }] } // ✅ Shifted down by 10 pixels
  ]}
>
  Hello!
</Text>

<Animated.Text
  style={{
    fontSize: 32,
    marginLeft: 50, // ✅ Still nasa kanan
    marginTop: -15, // ✅ Slightly tinaas ng onti lang
    transform: [
      { rotate: waveAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-30deg', '30deg']
        })
      }
    ]
  }}
>
  👋
</Animated.Text>


      <Text style={[styles.usernameText, darkMode ? styles.darkText : styles.lightText]}>
        "Username"
      </Text>
    </View>
    <TouchableOpacity style={styles.profileIcon}>
      <Ionicons name="person-circle" size={70} color="#F7F7F7" />
    </TouchableOpacity>
  </View>
</View>



      {/* Menu Section */}
      <View style={styles.menuWrapper}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="map" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="book" size={30} color="#A0C878" />
            </View>
            <Text style={styles.menuText}>Learn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Event */}
      <View style={styles.recentEvent}>
        <Text style={styles.recentEventText}>Recent Event</Text>
      </View>

      {/* Clean-Up Section */}
      <View style={styles.cleanUpContainer}>
        <Image 
          source={require('../../assets/images/waste_nobg.png')}
          style={styles.cleanUpBackgroundImage}
        />
        <Ionicons name="warning" size={40} color="#FFA500" />
        <View>
          <Text style={styles.cleanUpText}>Reach up to 500</Text>
          <Text style={styles.cleanUpCount}>100/500</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Clean-Up</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  lightBackground: {
    backgroundColor: "#f4f4f4",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  headerBackground: {
    height: 200,
    backgroundColor: '#3559E0',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  overlayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  greetingContainer: {
    flexDirection: 'column',
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 5, // ✅ Slightly pushes everything downward
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginRight: 80, // ✅ Shifted slightly to the left
    marginTop: -10,    // ✅ Slightly lowered the "Hello!" text
  },
  
  usernameText: {
    fontSize: 36,
    color: "#FBFBFB",
    fontWeight: "bold",
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#008000",
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    marginTop: 10,
    elevation: 5,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  menuWrapper: {
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#3559E0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuText: {
    fontSize: 14,
  },
  recentEvent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginTop: 20, // ✅ Reduced the margin to slightly move it up
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#008000",
    height: 180,
    justifyContent: "flex-start",
  },
  recentEventText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  
  cleanUpContainer: {
    backgroundColor: "#3559E0",
    borderRadius: 10,
    padding: 20,
    height: 200,
    justifyContent: "space-between",
    marginTop: -20, // ✅ This will slightly move it to the top
  },
  cleanUpText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F7F7F7",
    textAlign: "left",
    textShadowColor: "rgba(0, 0, 0, 0.8)", // ✅ Heavy shadow effect
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    elevation: 5, // ✅ Adds an elevation effect
    zIndex: 999, // ✅ Force it to stay on top
  },
  
  cleanUpCount: {
    fontSize: 24, // ✅ Slightly increased size
    fontWeight: "bold",
    color: "#FBFBFB",
    textShadowColor: "rgba(0, 0, 0, 0.5)", // ✅ Adds shadow for pop effect
    textShadowOffset: { width: 1, height: 1 }, // ✅ Slight offset for depth
    textShadowRadius: 5, // ✅ Smooth blur effect
  },
  
  joinButton: {
    backgroundColor: "#008000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cleanUpBackgroundImage: {
    position: "absolute",
    width: "110%",
    height: "120%",
    resizeMode: "cover",
    right: 3, // ✅ Shifted slightly to the right
    blurRadius: 10, // ✅ Real blur effect now working
    opacity: 0.5, // Slight opacity for a more subtle effect
  },
  
  
});
