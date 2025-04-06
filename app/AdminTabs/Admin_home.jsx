import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalEvents: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://192.168.1.18:5000/api/admin/dashboard");
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Users</Text>
        <Text style={styles.cardValue}>{dashboardData.totalUsers}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Events</Text>
        <Text style={styles.cardValue}>{dashboardData.totalEvents}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pending Approvals</Text>
        <Text style={styles.cardValue}>{dashboardData.pendingApprovals}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#007bff",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007bff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdminHome;
