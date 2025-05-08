import React, { useState } from "react"; // Import useState for animation
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking, // Import Linking for opening URLs
  Animated, // Import Animated for animation
  Alert, // Import Alert
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Sample data for different waste types (can be moved to a separate file)
const wasteData = [
  {
    id: "biodegradable",
    title: "Biodegradable Waste",
    icon: "leaf", // Ionicons
    iconPack: "Ionicons",
    color: "#4CAF50",
    description:
      "Includes organic materials like food scraps, paper (non-glossy), and garden waste. These decompose naturally through the action of microorganisms. Composting is a great way to manage biodegradable waste.",
    examples: ["Fruit and vegetable peels", "Coffee grounds", "Dried leaves", "Cardboard (uncoated)"],
    impact: "Reduces landfill volume and can be turned into nutrient-rich compost.",
  },
  {
    id: "non-biodegradable",
    title: "Non-Biodegradable Waste",
    icon: "cancel", // MaterialCommunityIcons
    iconPack: "MaterialCommunityIcons",
    color: "#F44336",
    description:
      "Materials that cannot be broken down by natural processes within a reasonable timeframe. Proper recycling and reduction are crucial for managing this type of waste.",
    examples: ["Plastics (bottles, bags, packaging)", "Glass", "Metals (cans, aluminum foil)", "Synthetic fabrics"],
    impact: "Contributes to landfill accumulation and can persist in the environment for hundreds of years, causing pollution.",
  },
  {
    id: "hazardous",
    title: "Hazardous Waste",
    icon: "biohazard", // MaterialCommunityIcons
    iconPack: "MaterialCommunityIcons",
    color: "#FF9800",
    description:
      "Waste that poses a threat to public health or the environment due to its toxic, corrosive, flammable, or reactive properties. Requires special handling and disposal methods.",
    examples: ["Batteries", "Chemicals (cleaning products, pesticides)", "Electronic waste (e-waste)", "Medical waste", "Paint"],
    impact: "Can contaminate soil and water, posing serious health risks. Improper disposal can lead to environmental damage.",
  },
  {
    id: "recyclable",
    title: "Recyclable Materials",
    icon: "recycle", // MaterialCommunityIcons - This is the standard RRR icon
    iconPack: "MaterialCommunityIcons",
    color: "#2196F3",
    description:
      "Materials that can be processed and reused to create new products, conserving natural resources and reducing energy consumption.",
    examples: ["Certain types of plastics (PET, HDPE)", "Paper and cardboard", "Aluminum and steel cans", "Glass bottles and jars"],
    impact: "Reduces the need for virgin materials, saves energy, and lowers greenhouse gas emissions.",
  },
];

// Sample data for recycling tips (can be moved to a separate file)
const recyclingTipsData = [
  "Rinse and clean recyclable containers before placing them in the recycling bin.",
  "Separate different types of recyclables (paper, plastic, glass, metal) according to your local guidelines.",
  "Reduce your consumption of single-use plastics by opting for reusable alternatives.",
  "Learn about your local recycling program and what materials are accepted.",
  "Compost your food scraps and yard waste to reduce biodegradable waste.",
  "Properly dispose of hazardous waste at designated collection centers.",
  "Donate or repurpose items instead of throwing them away whenever possible.",
];

const studyLinks = [
    {
      title: "DENR - Solid Waste Management",
      url: "https://emb.gov.ph/solid-waste-management/",
      description: "Official page of the Philippine Department of Environment and Natural Resources (DENR) on Solid Waste Management. While the main text might be in English, it outlines the Philippine policies and programs, which is crucial context. You might find downloadable materials or links to further resources here.",
      filipino_content: "Focuses on the Philippine context and regulations.",
    },
    {
      title: "Goodreads - Books on Waste Management",
      url: "https://www.goodreads.com/shelf/show/waste-management",
      description: "A Goodreads shelf featuring a variety of books related to waste management.",
      filipino_content: "Primarily English language books.",
    },
    {
      title: "Philippine Information Agency (PIA) Archives - Waste Management",
      url: "https://pia.gov.ph/?s=waste+management",
      description: "The Philippine Information Agency often publishes news articles and features about government programs and initiatives. Searching their archives for 'waste management' might yield articles in English or Filipino about local efforts and regulations.",
      filipino_content: "Potential for articles in both English and Filipino.",
    },
    // Additional non-Filipino but reputable options:
    {
      title: "United Nations Environment Programme (UNEP) - Waste and Circular Economy",
      url: "https://www.unep.org/explore-topics/waste-and-circular-economy",
      description: "A global perspective from the UN on waste management. While not specific to the Philippines, it provides valuable information on best practices and global trends that can be relevant.",
      filipino_content: "General information, not specific to the Philippines.",
    },
    {
      title: "World Bank - Solid Waste Management",
      url: "https://www.worldbank.org/en/topic/urbandevelopment/brief/solid-waste-management",
      description: "The World Bank offers resources and reports on solid waste management globally, which can include data and case studies relevant to developing countries like the Philippines.",
      filipino_content: "General information, may contain data related to the Philippines in reports.",
    },
  ];

export default function LearnScreen() {
  const router = useRouter();
  const [animation] = useState(new Animated.Value(1)); // Initialize animation value

  const handleStudyClick = () => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (studyLinks.length > 0) {
        const linksToShow = studyLinks.slice(0, 3); // Take the first 3 links

        if (linksToShow.length > 0) {
          Alert.alert(
            "Choose a Resource",
            "Tap a button to learn more:",
            linksToShow.map((link) => ({
              text: link.title,
              onPress: () => Linking.openURL(link.url).catch((err) => console.error("An error occurred: ", err)),
            })),
            { cancelable: true } // Allows dismissing the alert
          );
        } else {
          Alert.alert("No Resources", "Sorry, no study resources are available at the moment.");
        }
      } else {
        console.warn("No study links available.");
      }
    });
  };

  const animatedStyle = {
    transform: [{ scale: animation }],
  };

  const renderIcon = (iconName, iconPack, color) => {
    switch (iconPack) {
      case "Ionicons":
        return <Ionicons name={iconName} size={30} color={color} />;
      case "FontAwesome5":
        return <FontAwesome5 name={iconName} size={28} color={color} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={iconName} size={30} color={color} />;
      case "Image":
        return <Image source={iconName} style={[styles.cardIcon, { tintColor: color }]} resizeMode="contain" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Understanding Our Waste</Text>
        </View>

        {/* Introduction Section with Image */}
        <View style={styles.section}>
          <Text style={styles.title}>The Importance of Responsible Waste Management</Text>
          <Image
            source={require("../assets/images/nabubulok.jpg")} // Keep the image path here
            style={styles.introImage}
            resizeMode="cover"
          />
          <Text style={styles.text}>
            Our planet faces significant environmental challenges due to improper waste disposal. Landfills are filling up, ecosystems are being polluted, and valuable resources are being wasted. By understanding the different types of waste and adopting responsible waste management practices, we can collectively make a positive impact.
          </Text>
          <Text style={styles.text}>
            This includes reducing the amount of waste we generate, reusing items whenever possible, recycling materials effectively, and properly disposing of waste that cannot be reused or recycled. Every small action contributes to a healthier and more sustainable future.
          </Text>
        </View>

        {/* Types of Waste Section with Detailed Cards */}
        <View style={styles.section}>
          <Text style={styles.title}>Exploring Different Categories of Waste</Text>
          {wasteData.map((wasteType) => (
            <View key={wasteType.id} style={[styles.detailedCard, { borderColor: wasteType.color }]}>
              <View style={styles.detailedCardHeader}>
                {renderIcon(wasteType.icon, wasteType.iconPack, wasteType.color)}
                <Text style={[styles.detailedCardTitle, { color: wasteType.color }]}>{wasteType.title}</Text>
              </View>
              <Text style={styles.detailedCardDescription}>{wasteType.description}</Text>
              {wasteType.examples && wasteType.examples.length > 0 && (
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Examples:</Text>
                  {wasteType.examples.map((example, index) => (
                    <Text key={index} style={styles.exampleItem}>
                      • {example}
                    </Text>
                  ))}
                </View>
              )}
              <Text style={styles.detailedCardImpact}>Impact: {wasteType.impact}</Text>
            </View>
          ))}
        </View>

        {/* Recycling Tips Section with Bullet Points */}
        <View style={styles.section}>
          <Text style={styles.title}>Practical Tips for Effective Recycling</Text>
          {recyclingTipsData.map((tip, index) => (
            <Text key={index} style={styles.listItem}>
              <Ionicons name="checkmark-outline" size={20} color="#2E7D32" style={{ marginRight: 8 }} />
              {tip}
            </Text>
          ))}
        </View>

        {/* Further Studies Section */}
        <View style={styles.section}>
          <Text style={styles.title}>Explore Further Studies</Text>
          <TouchableOpacity style={styles.studyButton} onPress={handleStudyClick}>
            <Animated.View style={animatedStyle}>
              <FontAwesome5 name="book" size={40} color="#3F51B5" />
            </Animated.View>
            <Text style={styles.studyButtonText}>Discover More Resources</Text>
          </TouchableOpacity>
          <Text style={styles.text}>
            Tap the book icon to choose from a few resources about waste management.
          </Text>
        </View>
      </ScrollView>

      {/* Back to Home Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/tabs/home")}>
        <Text style={styles.backButtonText}>Return to Homepage</Text>
      </TouchableOpacity>
    </View>
  );
}

// Enhanced Styles (cardIcon might need adjustment for images)
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8", // Lighter background
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20, // Increased padding
    paddingBottom: 90, // Adjust for the back button
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#43A047", // Brighter green
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center', // Centers the title
  },
  headerTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    marginLeft: 0, // Removed marginLeft
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // More pronounced shadow
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
    lineHeight: 24,
    textAlign: 'justify', // This will justify the general text
   },
  introImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailedCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#F9F9F9",
  },
  detailedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  detailedCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  detailedCardDescription: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 10,
  },
  examplesContainer: {
    marginBottom: 8,
  },
  examplesTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  exampleItem: {
    fontSize: 15,
    color: "#777",
    marginLeft: 8,
  },
  detailedCardImpact: {
    fontSize: 16,
    color: "#388E3C",
    fontWeight: "bold",
    marginTop: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: "#43A047",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EAF6",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
  },
  studyButtonText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "bold",
    color: "#3F51B5",
  },
});
