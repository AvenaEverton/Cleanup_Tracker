import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LearnScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learn About Trash</Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.title}>Why Waste Management Matters?</Text>
          <Text style={styles.text}>
            Improper waste disposal harms the environment. Recycling and proper waste segregation help
            reduce pollution and conserve resources.
          </Text>
        </View>

        {/* Types of Waste */}
        <View style={styles.section}>
          <Text style={styles.title}>Types of Waste</Text>
          
          <View style={styles.card}>
            <Ionicons name="leaf" size={30} color="#4CAF50" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Biodegradable</Text>
              <Text style={styles.cardText}>Includes food scraps, paper, and garden waste. These decompose naturally.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Ionicons name="trash" size={30} color="#F44336" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Non-Biodegradable</Text>
              <Text style={styles.cardText}>Includes plastics, glass, and metals that do not decompose easily.</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Ionicons name="flask" size={30} color="#FF9800" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Hazardous Waste</Text>
              <Text style={styles.cardText}>Includes batteries, chemicals, and medical waste that are harmful.</Text>
            </View>
          </View>
        </View>

        {/* Recycling Tips */}
        <View style={styles.section}>
          <Text style={styles.title}>Recycling Tips</Text>
          <Text style={styles.text}>✅ Separate plastics, paper, and metals for recycling.</Text>
          <Text style={styles.text}>✅ Reduce single-use plastics by using reusable containers.</Text>
          <Text style={styles.text}>✅ Dispose of hazardous waste properly at designated centers.</Text>
        </View>

      </ScrollView>

      {/* Back to Home */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/tabs/home")}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 80, // Extra padding to ensure Back to Home button is not hidden
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#388E3C",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#444",
    marginBottom: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  cardContent: {
    marginLeft: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    backgroundColor: "#388E3C",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
