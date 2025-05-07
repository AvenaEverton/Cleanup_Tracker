import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const AdminMapReports = ({ reportData = [] }) => {
  const [mapType, setMapType] = useState("standard");
  const mapRef = useRef(null); // 🔹 Reference to the MapView

  const toggleMapType = () => {
    const newMapType = mapType === "standard" ? "satellite" : "standard";
    setMapType(newMapType);

    // 🔹 Auto-fit pins only when switching to satellite
    if (newMapType === "satellite" && reportData.length > 0 && mapRef.current) {
      const coordinates = reportData.map((r) => ({
        latitude: parseFloat(r.latitude),
        longitude: parseFloat(r.longitude),
      }));

      // Fit map to coordinates with padding
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        initialRegion={{
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {reportData.map((report) => (
          <Marker
            key={report.report_id}
            coordinate={{
              latitude: parseFloat(report.latitude),
              longitude: parseFloat(report.longitude),
            }}
            title={report.full_name || "Unknown"}
            description={report.description}
          />
        ))}
      </MapView>

      {/* Toggle Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleMapType}>
        <Text style={styles.toggleButtonText}>
          {mapType === "standard" ? "Satellite View" : "Standard View"}
        </Text>
      </TouchableOpacity>

      {/* Empty Overlay */}
      {reportData.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyText}>No reports available.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  emptyOverlay: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 8,
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
  },
  toggleButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 5,
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default AdminMapReports;
