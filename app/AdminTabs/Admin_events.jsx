import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Dialog,
  Portal,
  Provider,
} from "react-native-paper";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AdminMapReports from "./AdminMapReports";

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
  const [isFieldFocused, setIsFieldFocused] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [reportData, setReportData] = useState([]);



  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setFiles([...files, result]);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("description", description);
      formData.append("date", date.toISOString().split("T")[0]);
      formData.append("time", time.toTimeString().split(" ")[0]);
      formData.append("location", location);
      formData.append("additionalDetails", additionalDetails);

      if (files.length > 0) {
        formData.append("image", {
          uri: files[0].uri,
          name: files[0].name,
          type: files[0].mimeType || "image/jpeg",
        });
      }

      const response = await axios.post(
        "https://backend-rt98.onrender.com/addEvent",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);
      console.log("Event Created:", response.data);
    } catch (error) {
      if (error.response) {
        alert(`Failed to create event: ${error.response.data.message}`);
      } else {
        console.error("Error creating event:", error);
        alert("Failed to create event.");
      }
    }
  };

  const handleCancel = () => {
    setEventName("");
    setDescription("");
    setDate(new Date());
    setTime(new Date());
    setLocation("");
    setAdditionalDetails("");
    setFiles([]);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsFieldFocused(false);
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Toggle Button */}
   

        {showMapView ? (
          <AdminMapReports reportData={reportData} />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.header}>Create New Event</Text>

                  <TextInput
                    label="Event Name"
                    value={eventName}
                    onChangeText={(text) => {
                      setEventName(text);
                      setIsFieldFocused(true);
                    }}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Enter event name"
                    outlineColor="#4CAF50"
                    selectionColor="#4CAF50"
                    onFocus={() => setIsFieldFocused(true)}
                    onBlur={() => setIsFieldFocused(false)}
                  />

                  <TextInput
                    label="Description"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      setIsFieldFocused(true);
                    }}
                    mode="outlined"
                    multiline
                    style={styles.descriptionInput}
                    placeholder="Provide a brief description of the event"
                    outlineColor="#4CAF50"
                    selectionColor="#4CAF50"
                    onFocus={() => setIsFieldFocused(true)}
                    onBlur={() => setIsFieldFocused(false)}
                  />

                  {/* Date Picker */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(true);
                      setIsFieldFocused(true);
                    }}
                    style={styles.pickerButton}
                  >
                    <MaterialIcons name="event" size={20} color="#007bff" />
                    <Text style={styles.pickerText}>
                      {date.toLocaleDateString()}
                    </Text>
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
                  <TouchableOpacity
                    onPress={() => {
                      setShowTimePicker(true);
                      setIsFieldFocused(true);
                    }}
                    style={styles.pickerButton}
                  >
                    <MaterialIcons name="schedule" size={20} color="#007bff" />
                    <Text style={styles.pickerText}>
                      {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
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
                    onChangeText={(text) => {
                      setLocation(text);
                      setIsFieldFocused(true);
                    }}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Enter event location"
                    outlineColor="#4CAF50"
                    selectionColor="#4CAF50"
                    onFocus={() => setIsFieldFocused(true)}
                    onBlur={() => setIsFieldFocused(false)}
                  />

                  <TextInput
                    label="Additional Details"
                    value={additionalDetails}
                    onChangeText={(text) => {
                      setAdditionalDetails(text);
                      setIsFieldFocused(true);
                    }}
                    mode="outlined"
                    multiline
                    style={styles.descriptionInput}
                    placeholder="Any other important information?"
                    outlineColor="#4CAF50"
                    selectionColor="#4CAF50"
                    onFocus={() => setIsFieldFocused(true)}
                    onBlur={() => setIsFieldFocused(false)}
                  />

                  {/* File Upload */}
                  <TouchableOpacity
                    onPress={() => {
                      pickDocument();
                      setIsFieldFocused(true);
                    }}
                    style={styles.uploadButton}
                  >
                    <FontAwesome name="paperclip" size={20} color="white" />
                    <Text style={styles.uploadText}>Attach Files</Text>
                  </TouchableOpacity>
                  {files.length > 0 && (
                    <View style={styles.filesContainer}>
                      <Text style={styles.filesHeader}>Attachments:</Text>
                      {files.map((file, index) => (
                        <Text key={index} style={styles.fileText}>
                          - {file.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </Card.Content>
              </Card>
            </ScrollView>

            {/* Sticky Footer Buttons */}
            <View style={styles.bottomButtons}>
              {isFieldFocused && (
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
              )}
              <Button
                mode="contained"
                onPress={() => setModalVisible(true)}
                style={styles.createButton}
              >
                Create Event
              </Button>
            </View>

            {/* Confirmation Modal */}
            <Portal>
              <Dialog
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
              >
                <Dialog.Title>Confirm Event Details</Dialog.Title>
                <Dialog.Content>
                  <Text>
                    Are you sure you want to create the event "{eventName}"
                    scheduled for {date.toLocaleDateString()} at{" "}
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    at {location}?
                  </Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setModalVisible(false)}>Edit</Button>
                  <Button
                    onPress={handleCreateEvent}
                    style={styles.confirmButton}
                  >
                    Confirm & Create
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  scrollContainer: { paddingBottom: 120, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 30, color: "#333" },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#4CAF50",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  pickerText: { marginLeft: 12, fontSize: 16, color: "#333" },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadText: { color: "white", marginLeft: 10, fontSize: 16 },
  filesContainer: { marginTop: 15 },
  filesHeader: { fontWeight: "bold", marginBottom: 5, color: "#555" },
  fileText: { fontSize: 14, color: "#777", marginBottom: 3 },
  bottomButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: "#dc3545",
  },
  createButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#28a745",
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
});

export default AdminEvents;
