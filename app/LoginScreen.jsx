import { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated 
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const router = useRouter();
  const scaleValue = new Animated.Value(1);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter email or username");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
  
    try {
      const response = await fetch("http://192.168.1.206:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrUsername: email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        router.replace("/tabs/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    }
  };
  
  

  const handleBack = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push("/register")}> 
        <Text style={styles.registerButtonText}>Create an Account</Text>
      </TouchableOpacity>
      
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#008000" />
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    width: "100%",
    backgroundColor: "#008000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerButton: {
    width: "100%",
    marginTop: 15,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#008000",
  },
  registerButtonText: {
    color: "#008000",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 10,
    justifyContent: "center",
  },
  backButtonText: {
    color: "#008000",
    fontSize: 16,
    marginLeft: 5,
  },
});

export default LoginScreen;
