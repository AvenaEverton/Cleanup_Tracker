import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { TextInput, Button, Card, Dialog, Portal, Provider } from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons"; 
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";

const AdminEvents = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [files, setFiles] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setFiles([...files, result]);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const response = await axios.post("http://192.168.1.22:5000/addEvent", {
        eventName,
        description,
        date: date.toISOString().split("T")[0], // YYYY-MM-DD
        time: time.toTimeString().split(" ")[0], // HH:MM:SS
        location,
        additionalDetails,
      });
  
      alert(response.data.message);
      console.log("Event Created:", response.data);
    } catch (error) {
      if (error.response) {
       // console.error("Error creating event:", error.response.data);
        alert(`Failed to create event: ${error.response.data.message}`);
      } else {
        console.error("Error creating event:", error);
        alert("Failed to create event.");
      }
    }
  };
  

  return (
    <Provider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>Create Event</Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput 
                label="Event Name" 
                value={eventName} 
                onChangeText={setEventName} 
                mode="outlined" 
                style={styles.input}
              />

              <TextInput 
                label="Description" 
                value={description} 
                onChangeText={setDescription} 
                mode="outlined" 
                multiline
                style={styles.descriptionInput}
              />

              {/* Date Picker */}
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerContainer}>
                <MaterialIcons name="date-range" size={24} color="black" />
                <Text style={styles.pickerText}>{date.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker 
                  value={date} 
                  mode="date" 
                  display="default" 
                  onChange={(event, selectedDate) => { 
                    setShowDatePicker(false); 
                    if (selectedDate) setDate(selectedDate);
                  }} 
                />
              )}

              {/* Time Picker */}
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.pickerContainer}>
                <MaterialIcons name="access-time" size={24} color="black" />
                <Text style={styles.pickerText}>{time.toLocaleTimeString()}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker 
                  value={time} 
                  mode="time" 
                  display="default" 
                  onChange={(event, selectedTime) => { 
                    setShowTimePicker(false); 
                    if (selectedTime) setTime(selectedTime);
                  }} 
                />
              )}

              <TextInput 
                label="Location" 
                value={location} 
                onChangeText={setLocation} 
                mode="outlined" 
                style={styles.input}
              />

              <TextInput 
                label="Additional Details" 
                value={additionalDetails} 
                onChangeText={setAdditionalDetails} 
                mode="outlined" 
                multiline
                style={styles.descriptionInput}
              />

              {/* File Upload */}
              <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
                <FontAwesome name="upload" size={20} color="white" />
                <Text style={styles.uploadText}>Upload Attachments</Text>
              </TouchableOpacity>
              {files.map((file, index) => (
                <Text key={index} style={styles.fileText}>{file.name}</Text>
              ))}
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Sticky Footer Buttons */}
        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => console.log("Cancel Pressed")} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.createButton}>
            Create
          </Button>
        </View>

        {/* Confirmation Modal */}
        <Portal>
          <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
            <Dialog.Title>Confirm Event Creation</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to create this event?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setModalVisible(false)}>Cancel</Button>
              <Button onPress={handleCreateEvent}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { paddingBottom: 100 }, // Extra space to prevent overlap
  header: { fontSize: 26, fontWeight: "bold", margin: 20, color: "black" },
  card: { padding: 15, borderRadius: 10, backgroundColor: "#fff", elevation: 5, marginHorizontal: 20 },
  input: { marginBottom: 15, backgroundColor: "#fff", color: "black" },
  descriptionInput: { height: 80, marginBottom: 15, backgroundColor: "#fff", color: "black" },
  pickerContainer: {
    flexDirection: "row", alignItems: "center", padding: 10, borderWidth: 1, borderRadius: 5, 
    marginBottom: 15, borderColor: "#ccc", backgroundColor: "#fff"
  },
  pickerText: { marginLeft: 10, fontSize: 16, color: "black" },
  uploadButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#007bff", padding: 12, borderRadius: 5, marginTop: 10
  },
  uploadText: { color: "white", marginLeft: 10 },
  fileText: { marginTop: 5, fontSize: 14, color: "black" },

  /* Sticky Footer */
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  cancelButton: { flex: 1, marginRight: 10, borderColor: "#ff4d4d" },
  createButton: { flex: 1, marginLeft: 10, backgroundColor: "#28a745" }
});

export default AdminEvents;
