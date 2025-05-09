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
    Modal,
    Image, // Import Image component
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit'; // Import BarChart
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import moment from 'moment'; // For timestamp formatting
import AdminMapReports from "./AdminMapReports";
import axios from 'axios';
import { PieChart } from 'react-native-chart-kit';






async function fetchAddress(lat, lon) {
    try {
        const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            { headers: { 'User-Agent': 'YourAppName/1.0 (you@domain.com)' } }
        )
        const j = await r.json()
        return j.display_name || 'Address not found'
    } catch {
        return 'Failed to load address'
    }
}

function extractStreetName(address) {
  // Example: 'Burgos St, Brgy. 123, San Juan, Metro Manila, Philippines'
  if (!address) return null;
  const parts = address.split(',');
  return parts[0]?.trim(); // Return only the first part (street)
}




const AdminHome = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalEvents: 0,
        pendingApprovals: 0,
        reports: 0,
    });
    const [locationName, setLocationName] = useState('');
    const [participantsPerEventData, setParticipantsPerEventData] = useState([]); // New state for participants data
    const [reportsData, setReportsData] = useState([]); // State for reports data
    const [recentEventsData, setRecentEventsData] = useState([]); // State for recent events
    const [showReports, setShowReports] = useState(false); // State to control visibility of reports
    const { width } = useWindowDimensions();
    const isWideScreen = width > 768;
    const navigation = useNavigation(); // Initialize navigation
    const [selectedReport, setSelectedReport] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [address, setAddress] = useState('Loading address…');
    const [streetReportCounts, setStreetReportCounts] = useState({});
    const [mostReportedStreet, setMostReportedStreet] = useState(null);
    const [showMapView, setShowMapView] = useState(false);


    useEffect(() => {
        axios
        .get("https://backend-rt98.onrender.com/api/admin/report-details")
        .then((response) => setReportsData(response.data)) // ✅ Fixed the function name
        .catch((error) =>
            console.error("Error fetching reports:", error)
        );
    }, []);
  


    // Define scoreboardColors here
    const scoreboardColors = [
        { primary: '#4c669f', secondary: '#3b5998' },       // Users
        { primary: '#00c6fb', secondary: '#005bea' },       // Events
        { primary: '#6a1b9a', secondary: '#4a148c' },       // Pending Approvals
        { primary: '#ff8e4b', secondary: '#ff6f00' },       // Reports
    ];

    const openModal = async (report) => {
        setSelectedReport(report)
        setModalVisible(true)

        // kick off your reverse-geocoding:
        setAddress('Loading address…')
        const humanAddress = await fetchAddress(report.latitude, report.longitude)
        setAddress(humanAddress)
    }


    const closeModal = () => {
        setSelectedReport(null);
        setModalVisible(false);
        setLocationName(''); // Optional: reset location when modal closes
    };



    useEffect(() => {
        fetchDashboardData();
        fetchParticipantsData(); // Fetch participants data on component mount
        fetchReportsData(); // Fetch reports data on component mount
        fetchRecentEvents(); // Fetch recent events data
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch("https://backend-rt98.onrender.com/api/admin/dashboard");
            const data = await response.json();
            setDashboardData({ ...dashboardData, ...data });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipantsData = async () => {
        try {
            const response = await fetch("https://backend-rt98.onrender.com/api/admin/participants-per-event");
            const data = await response.json();
            console.log("Participants data from backend:", data); // Log the data
            setParticipantsPerEventData(data);
        } catch (error) {
            console.error("Error fetching participants data:", error);
        }
    };

    const fetchReportsData = async () => {
      try {
        const res = await fetch("https://backend-rt98.onrender.com/api/admin/report-details");
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
    
        const streetCounts = {};
        const enrichedReports = [];
    
        for (const report of data) {
          const address = await fetchAddress(report.latitude, report.longitude);
          const street = extractStreetName(address);
    
          if (street) {
            streetCounts[street] = (streetCounts[street] || 0) + 1;
          }
    
          enrichedReports.push({
            ...report,
            street: street || 'Unknown Street',
          });
        }
    
        const sorted = Object.entries(streetCounts).sort((a, b) => b[1] - a[1]);
        const mostReported = sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
    
        setStreetReportCounts(streetCounts);
        setMostReportedStreet(mostReported);
        setReportsData(enrichedReports);
      } catch (e) {
        console.error(e);
      }
    };
    
    
    

    const fetchRecentEvents = async () => {
        try {
            const response = await fetch("https://backend-rt98.onrender.com/api/admin/recent-events");
            const data = await response.json();
            console.log("Recent events data:", data);
            setRecentEventsData(data);
        } catch (error) {
            console.error("Error fetching recent events:", error);
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

    const handleScoreboardClick = (index) => {
        if (index === 0) {
            navigation.navigate('Users');
        } else if (index === 1) {
            navigation.navigate('Events');
        } else if (index === 3) {
            setShowReports(true); // Open the reports list modal
        }
    };


    const handleCloseReports = () => {
        setShowReports(false);
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
            {/* View Reports Map Button - positioned at bottom right */}
            {!showMapView && (
                <View style={styles.floatingButtonContainer}>
                    <TouchableOpacity
                        onPress={() => setShowMapView(true)}
                        style={styles.mapToggleButton}
                    >
                        <Text style={styles.mapToggleButtonText}>View Reports Map</Text>
                    </TouchableOpacity>
                </View>
            )}
    
            {/* Back to Dashboard Button - remains unchanged */}
            {showMapView && (
                <View style={styles.backButtonContainer}>
                    <TouchableOpacity
                        onPress={() => setShowMapView(false)}
                        style={styles.mapToggleButton}
                    >
                        <Text style={styles.mapToggleButtonText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>
            )}
     
      
     {showMapView ? (
            <AdminMapReports reportData={reportsData} />
        ) : (
            <ScrollView contentContainerStyle={styles.container}>
              {/* Header */}
              <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Dashboard</Text>
              </View>
      
              <View style={styles.scoreboardGrid}>
                {Object.keys(dashboardData).slice(0, 4).map((key, index) => (
                  <TouchableOpacity
                    key={`${key}-${index}`} // fixed key
                    style={[
                      styles.scoreboardButton,
                      styles[`scoreboardButton${index + 1}`],
                      hoveredIndex === index && styles.scoreboardButtonHovered,
                    ]}
                    onPressIn={() => setHoveredIndex(index)}
                    onPressOut={() => setHoveredIndex(null)}
                    onPress={() => handleScoreboardClick(index)}
                    disabled={index !== 0 && index !== 1 && index !== 3} // Enable click for Users, Events, and Reports
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
                            index === 0 ? "users" : // Users
                              index === 1 ? "calendar-alt" : // Events
                                index === 2 ? "hourglass-half" : // Pending
                                  "file-alt" // Reports
                          }
                          size={isWideScreen ? 40 : 24}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text style={[styles.scoreboardText, isWideScreen && styles.scoreboardTextWide]}>
                        {key === 'totalEvents' ? 'EVENTS' :
                          key === 'totalUsers' ? 'USERS' :
                            key === 'pendingApprovals' ? 'PENDING' :
                              'REPORTS'}
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
                {/* Recent Events Section */}
                <View style={[styles.chartPlaceholder, isWideScreen && styles.chartPlaceholderWide]}>
                  <View style={styles.chartHeader}>
                    <Text style={[styles.chartHeaderText, isWideScreen && styles.chartHeaderTextWide, { color: '#548C2F' }]}>
                      Recently Created Events
                    </Text>
                    <Text style={[styles.chartHeaderSubText, isWideScreen && styles.chartHeaderSubTextWide, { color: '#7B8788' }]}>
                      Last 5 Events
                    </Text>
                  </View>
                  <View style={styles.subtleLine} />
                  {recentEventsData.length > 0 ? (
                    recentEventsData.map((event, index) => (
                      <View
                        key={event?.event_id ? `event-${event.event_id}` : `event-${index}`}
                        style={styles.recentEventItem}
                      >
                        <Text style={styles.recentEventTitle}>
                          {event?.event_name ?? 'Unnamed Event'}
                        </Text>
                        <Text style={styles.recentEventDate}>
                          Created: {event?.created_at ? moment(event.created_at).format('MMM DD, hh:mm a') : 'Unknown Date'}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.chartOverlayText}>
                      <Text style={{ color: '#A7B1A0', textAlign: 'center', fontSize: isWideScreen ? 16 : 14 }}>
                        No recent events available.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
      
              <View style={styles.participantsContainer}>
                <Text style={[styles.participantsTitle, isWideScreen && styles.participantsTitleWide, { color: '#37474F' }]}>
                  Total Number of Participants per Event
                </Text>
                {/* Chart for participants per event */}
                <View style={[styles.chartPlaceholder, isWideScreen && styles.chartPlaceholderWide, { overflow: 'hidden' }]}>
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {participantsPerEventData.length > 0 ? (
                    <PieChart
                    data={participantsPerEventData
                      .filter(item => item.participant_count > 0) // ✅ Exclude events with 0 or null participants
                      .map((item, index) => ({
                        name: item.event_name,
                        population: item.participant_count,
                        color: `hsl(${(index * 60) % 360}, 70%, 50%)`, // Unique color per slice
                        legendFontColor: '#333',
                        legendFontSize: 12,
                      }))
                    }
                    width={width - 40}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#FFFFFF',
                      backgroundGradientFrom: '#FFFFFF',
                      backgroundGradientTo: '#FFFFFF',
                      color: (opacity = 1) => `rgba(84, 140, 47, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                  />
                  
                    ) : (
                      <View style={styles.chartOverlayText}>
                        <Text style={{ color: '#A7B1A0', textAlign: 'center', fontSize: isWideScreen ? 16 : 14 }}>
                          No participant data available.
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
      
              
      
              {/* Reports Modal */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={showReports}
                onRequestClose={handleCloseReports}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>User Reports</Text>
      
                    <ScrollView style={styles.reportsList}>
                      {reportsData.length > 0 ? (
                        reportsData.map((report, index) => (
                          <TouchableOpacity
                            key={report.report_id || index}
                            style={styles.reportItem}
                            onPress={() => {
                              openModal(report); // Select report
                              handleCloseReports(); // Close the list modal
                            }}
                          >
                            <Text style={styles.modalText}>Reported by: {report.full_name ?? 'Unknown User'}</Text>
                            <Text style={styles.reportDescription}>{report.description}</Text>
                            <Text style={styles.modalText}>Street: {report.street || 'Unknown'}</Text>
                            <Text style={styles.reportTimestamp}>{moment(report.timestamp).format('MMM DD, hh:mm a')}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.noReports}>No reports available.</Text>
                      )}
                    </ScrollView>
      
                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseReports}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    {selectedReport && (
                      <>
                        <Text style={styles.modalTitle}>Report Details</Text>
                        <Text style={styles.modalText}>Reported by: {selectedReport?.full_name || 'Unknown User'}</Text>
                        <Text style={styles.modalText}>Description: {selectedReport?.description || 'No description'}</Text>
                        <Text style={styles.modalText}>Street: {selectedReport?.street || 'Unknown Street'}</Text>
      
                        <Text style={[styles.modalText, { fontStyle: 'italic', marginVertical: 8 }]}>
                          {address}
                        </Text>
                        <Text style={styles.modalText}>Reported at: {selectedReport?.timestamp ? moment(selectedReport.timestamp).format('MMMM DD, hh:mm a') : 'Unknown Date'}</Text>
      
                        {/* Images */}  
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={{ marginTop: 15 }}
                        >
                          {selectedReport.images?.length > 0 ? (
                            selectedReport.images.map((imgFilename, idx) => (
                              <Image
                                key={idx}
                                source={{
                                  uri: `https://backend-rt98.onrender.com/uploads/${imgFilename}`
                                }}
                                style={styles.reportImage}
                                resizeMode="cover"
                              />
                            ))
                          ) : (
                            <Text style={styles.noImageText}>No images uploaded.</Text>
                          )}
                        </ScrollView>
      
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                          <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Modal>
            </ScrollView>
          )}
        </View>
      );

    
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f0f4f0',
        paddingBottom: 80,
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 20, // Add padding at the bottom for scrollable content
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        marginTop: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
    },
    scoreboardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 20,
    },
    scoreboardButton: {
        width: '48%', // Two columns, with spacing
        height: 100,
        borderRadius: 12,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4, // Add shadow
    },
    scoreboardButtonHovered: {
        transform: [{ scale: 1.05 }], // Add a slight scale on hover
        elevation: 6, // Increase shadow on hover
    },
    scoreboardButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Clip the shine effect
        position: 'relative',
    },
    shine: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%', // Make it wider than the button
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.3)', // Semi-transparent white
    },
    scoreboardIconContainer: {
        marginBottom: 8,
    },
    scoreboardText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    scoreboardValue: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    scoreboardTextWide: {
        fontSize: 16,
    },
    scoreboardValueWide: {
        fontSize: 24,
    },
    scoreboardButton1: {
        // No specific style, inherits from scoreboardButton
    },
    scoreboardButton2: {
        // No specific style
    },
    scoreboardButton3: {
        // No specific style
    },
    scoreboardButton4: {
        // No specific style
    },
    overviewContainer: {
        width: '90%',
        marginBottom: 20,
    },
    overviewTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    overviewTitleWide: {
        fontSize: 22,
    },
    chartPlaceholder: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 4,
    },
    chartPlaceholderWide: {
        padding: 20,
    },
    chartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    chartHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    chartHeaderTextWide: {
        fontSize: 20,
    },
    chartHeaderSubText: {
        fontSize: 12,
        color: '#7B8788',
    },
    chartHeaderSubTextWide: {
        fontSize: 14,
    },
    subtleLine: {
        height: 1,
        backgroundColor: '#D1D8CC', // Very light green separator
        marginVertical: 10,
    },
    recentEventItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E6F4EA', // Lighter green border
    },
    recentEventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    recentEventDate: {
        fontSize: 12,
        color: '#7B8788',
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
    participantsContainer: {
        width: '90%',
        marginBottom: 20,
    },
    participantsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    participantsTitleWide: {
        fontSize: 22,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 8,
        position: 'relative'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    modalText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#548C2F',
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16
    },
    reportsList: {
        maxHeight: 200,
        overflowY: 'scroll',
        marginBottom: 10
    },
    reportItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E6F4EA',
        marginBottom: 5
    },
    reportDescription: {
        fontSize: 12,
        color: '#555',
        marginTop: 5,
        marginBottom: 5
    },
    reportTimestamp: {
        fontSize: 10,
        color: '#888',
        fontStyle: 'italic'
    },
    reportImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
        resizeMode: 'cover'
    },
    noImageText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 10
    },
    noReports: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic'
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 20, // Adjust this value to move it up/down (higher number = higher up)
        right: 75,  // Position from right edge
        zIndex: 5,
    },
    mapToggleButton: {
        backgroundColor: "#28a745",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mapToggleButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    backButtonContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 10,
        marginBottom: 10,
    }
});

export default AdminHome;

 