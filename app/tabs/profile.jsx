import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../../context/ThemeContext";
import { formatDistanceToNow } from "date-fns"; // For time formatting
import * as FileSystem from "expo-file-system"; // For file path resolution

const ReportsHistoryScreen = () => {
  const router = useRouter();
  const { darkMode } = useContext(ThemeContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for your image server - replace with your actual image base URL
  const IMAGE_BASE_URL = "http://192.168.1.23:5000/uploads/";
  
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("http://192.168.1.23:5000/api/reports");
      const data = await response.json();
      
      // For each report, fetch its associated images
      const reportsWithImages = await Promise.all(
        data.map(async (report) => {
          const images = await fetchReportImages(report.report_id);
          return { ...report, images };
        })
      );
      
      setReports(reportsWithImages);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportImages = async (reportId) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`http://192.168.1.23:5000/api/reports/${reportId}/images`);
      const images = await response.json();
      return images;
    } catch (error) {
      console.error(`Failed to fetch images for report ${reportId}:`, error);
      return [];
    }
  };

  const handleReportPress = (report) => {
    // Navigate to report details screen with the selected report
    router.push({
      pathname: "/ReportDetailScreen",
      params: { reportId: report.report_id }
    });
  };

  const renderReportItem = ({ item }) => {
    const reportTime = new Date(item.timestamp);
    const timeAgo = formatDistanceToNow(reportTime, { addSuffix: true });
    
    return (
      <TouchableOpacity
        style={[
          styles.reportCard,
          darkMode ? styles.darkReportCard : styles.lightReportCard
        ]}
        onPress={() => handleReportPress(item)}
      >
        <View style={styles.reportHeader}>
          <Text style={[styles.reportTitle, darkMode ? styles.darkText : styles.lightText]}>
            Report #{item.report_id}
          </Text>
          <Text style={[styles.timestamp, darkMode ? styles.darkSubText : styles.lightSubText]}>
            {timeAgo}
          </Text>
        </View>
        
        <Text style={[styles.description, darkMode ? styles.darkText : styles.lightText]}>
          {item.description.length > 100 
            ? `${item.description.substring(0, 100)}...` 
            : item.description}
        </Text>
        
        <Text style={[styles.locationText, darkMode ? styles.darkSubText : styles.lightSubText]}>
          Location: {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </Text>
        
        {/* Images gallery */}
        {item.images && item.images.length > 0 && (
          <FlatList
            data={item.images}
            keyExtractor={(image) => image.image_id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}
            renderItem={({ item: image }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: `${IMAGE_BASE_URL}${image.image_path}` }}
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              </View>
            )}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
        <ActivityIndicator size="large" color={darkMode ? "#ffffff" : "#000000"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      <Text style={[styles.title, darkMode ? styles.darkText : styles.lightText]}>
        Reports History
      </Text>
      
      {reports.length === 0 ? (
        <Text style={[styles.emptyText, darkMode ? styles.darkText : styles.lightText]}>
          No reports found
        </Text>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.report_id.toString()}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  lightContainer: {
    backgroundColor: "#f4f4f4",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  lightText: {
    color: "#333",
  },
  darkText: {
    color: "#ffffff",
  },
  lightSubText: {
    color: "#666",
  },
  darkSubText: {
    color: "#aaaaaa",
  },
  listContainer: {
    paddingBottom: 20,
  },
  reportCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lightReportCard: {
    backgroundColor: "#ffffff",
  },
  darkReportCard: {
    backgroundColor: "#1e1e1e",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 10,
  },
  imageGallery: {
    marginTop: 10,
  },
  imageContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  reportImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});

export default ReportsHistoryScreen;