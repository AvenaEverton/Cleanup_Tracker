import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const scoreboardColors = [
  { primary: '#81D4FA', secondary: '#B3E5FC' }, // Light Blue
  { primary: '#AED581', secondary: '#C5E1A5' }, // Light Green
  { primary: '#FFB74D', secondary: '#FFD54F' }, // Light Orange
  { primary: '#F06292', secondary: '#F48FB1' }, // Light Pink
];

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingApprovals: 0,
    reports: 0,
  });
  const { width } = useWindowDimensions();
  const isWideScreen = width > 768;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://192.168.1.19:5000/api/admin/dashboard");
      const data = await response.json();
      setDashboardData({ ...dashboardData, ...data });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const shineAnim = useState(new Animated.Value(0))[0];

  const startShineAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    if (hoveredIndex !== null) {
      startShineAnimation();
    } else {
      shineAnim.stopAnimation();
      shineAnim.setValue(0);
    }
  }, [hoveredIndex]);

  const getShineTransform = () => {
    const translateX = shineAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-50, 150, width + 50], // Adjust range for shine effect
    });
    return { transform: [{ translateX }] };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#548C2F" />
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.profile}>
            <View style={styles.avatarPlaceholder}>
              <View style={styles.iconFrame}>
                <FontAwesome5
                  name="user-shield"
                  size={isWideScreen ? 28 : 18}
                  color="#548C2F"
                />
              </View>
            </View>
            <View>
              <Text style={styles.username}>ADMIN</Text>
              <Text style={styles.fullname}>Name</Text>
              <TouchableOpacity>
                <Text style={styles.viewProfile}>View Profile {'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.options}>
            <FontAwesome5 name="ellipsis-v" size={isWideScreen ? 30 : 20} color="#7B8788" />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreboardGrid}>
          {Object.keys(dashboardData).slice(0, 4).map((key, index) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.scoreboardButton,
                styles[`scoreboardButton${index + 1}`],
                hoveredIndex === index && styles.scoreboardButtonHovered,
              ]}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <LinearGradient
                colors={[scoreboardColors[index].primary, scoreboardColors[index].secondary]}
                style={styles.scoreboardButtonGradient}
              >
                {hoveredIndex === index && (
                  <Animated.View style={[styles.shine, getShineTransform()]} />
                )}
                <View style={styles.scoreboardIconContainer}>
                  <FontAwesome5
                    name={
                      index === 0 ? "calendar-alt" :
                      index === 1 ? "users" :
                      index === 2 ? "hourglass-half" : // Swapped with reports
                      "file-alt" // Swapped with pending
                    }
                    size={isWideScreen ? 40 : 24}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={[styles.scoreboardText, isWideScreen && styles.scoreboardTextWide]}>
                  {key === 'totalEvents' ? 'EVENTS' :
                   key === 'totalUsers' ? 'USERS' :
                   key === 'pendingApprovals' ? 'PENDING' : // Label remains the same
                   'REPORTS'} {/* Label remains the same */}
                </Text>
                <Text style={[styles.scoreboardValue, isWideScreen && styles.scoreboardValueWide]}>
                  {dashboardData[key]}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.overviewContainer}>
          <Text style={[styles.overviewTitle, isWideScreen && styles.overviewTitleWide, { color: '#37474F' }]}>Overview :</Text>
          {/* Placeholder for the chart */}
          <View style={[styles.chartPlaceholder, isWideScreen && styles.chartPlaceholderWide]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartHeaderText, isWideScreen && styles.chartHeaderTextWide, { color: '#548C2F' }]}>
                Recently created events
              </Text>
              <Text style={[styles.chartHeaderSubText, isWideScreen && styles.chartHeaderSubTextWide, { color: '#7B8788' }]}>
                time/dd/mm/yr
              </Text>
            </View>
            <View style={styles.subtleLine} />
            <View style={styles.chartArea} />
            <View style={styles.chartOverlayText}>
              <Text style={{ color: '#A7B1A0', textAlign: 'center', fontSize: isWideScreen ? 16 : 14 }}>
                Placeholder for Recently Created Events Chart
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.participantsContainer}>
          <Text style={[styles.participantsTitle, isWideScreen && styles.participantsTitleWide, { color: '#37474F' }]}>
            Total Number of Participants per Event
          </Text>
          {/* Placeholder for the second chart */}
          <View style={[styles.chartPlaceholder, isWideScreen && styles.chartPlaceholderWide]}>
            {/* You would likely render your chart component here */}
            <View style={styles.sampleChart}></View>
            <View style={styles.chartOverlayText}>
              <Text style={{ color: '#A7B1A0', textAlign: 'center', fontSize: isWideScreen ? 16 : 14 }}>
                Placeholder for Participants per Event Chart
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Navigation Removed */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 20,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D3D3D3',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconFrame: {
    borderWidth: 2,
    borderColor: "#548C2F",
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#37474F",
  },
  fullname: {
    fontSize: 14,
    color: "#7B8788",
  },
  viewProfile: {
    fontSize: 12,
    color: "#548C2F",
  },
  options: {
    padding: 10,
  },
  scoreboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scoreboardButton: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden', // Clip the gradient and shine effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreboardButtonHovered: {
    elevation: 5,
    shadowOpacity: 0.2,
  },
  scoreboardButtonGradient: {
    padding: 15,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 100, // Ensure enough space for content
  },
  scoreboardIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Darken slightly for contrast
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  scoreboardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'left',
  },
  scoreboardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'right',
    position: 'absolute',
    top: '50%',
    right: 15,
    transform: [{ translateY: -10 }],
  },
  overviewContainer: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chartPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
    borderColor: '#D3D3D3',
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  chartHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  chartHeaderSubText: {
    fontSize: 12,
  },
  subtleLine: {
    height: 2,
    backgroundColor: '#D3D3D3',
    marginBottom: 10,
    borderRadius: 1,
  },
  chartArea: {
    height: 100,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  participantsContainer: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sampleChart: {
    height: 180,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F5F5F5',
  },
  chartOverlayText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    opacity: 0.8,
    borderRadius: 8,
  },
  // Styles for wider screens
  headerContainerWide: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  scoreboardGridWide: {
    maxWidth: 800,
    marginHorizontal: 'auto',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scoreboardButtonWide: {
    padding: 20,
  },
  scoreboardTextWide: {
    fontSize: 18,
  },
  scoreboardValueWide: {
    fontSize: 24,
  },
  overviewContainerWide: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  overviewTitleWide: {
    fontSize: 24,
  },
  chartPlaceholderWide: {
    padding: 20,
  },
  chartHeaderTextWide: {
    fontSize: 18,
  },
  chartHeaderSubTextWide: {
    fontSize: 14,
  },
  participantsContainerWide: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  participantsTitleWide: {
    fontSize: 24,
  },
});

export default AdminHome;