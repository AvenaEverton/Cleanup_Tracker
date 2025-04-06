//npm install @expo/vector-icons react-native-maps expo-location expo-image-picker @react-native-async-storage/async-storage axios

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, TouchableWithoutFeedback, Keyboard, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const App = () => {
  // State variables for managing location, map type, modal visibility, description, images, etc.
  const [location, setLocation] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [isModalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImagesToDelete, setSelectedImagesToDelete] = useState([]);
  const [reportTitle, setReportTitle] = useState('Report'); // State for the report title
  const [userId, setUserId] = useState("");

  // useEffect hook to request location permissions and get the current location on component mount.
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  // useEffect hook to fetch the user ID from AsyncStorage on component mount.
  useEffect(() => {
    const getUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log("Fetched User ID:", parsedData.id); // Log the user ID
          setUserId(parsedData.id); // Assuming user ID is stored as "id"
        } else {
          console.log("No user data found in AsyncStorage.");
          // Handle the case where there's no user data.  Perhaps set userId to a default, or show an error.
          // setUserId("default_user_id"); // Example default
          //Or show an error to the user.
          //Alert.alert("Error", "Please log in to submit a report.");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        Alert.alert("Error", "Failed to retrieve user data. Please check your connection."); // Inform user
      }
    };

    getUserId();
  }, []);

  // Function to submit the report to the server.
  const submitReport = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('title', reportTitle);
      formData.append('description', description);
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);

      images.forEach((imageUri, index) => {
        formData.append('images', {
          uri: imageUri,
          name: `image_${index}.jpg`,
          type: 'image/jpeg',
        });
      });

      const response = await axios.post('http://192.168.1.17:5000/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Report submitted successfully');
        setDescription('');
        setImages([]);
      } else {
        Alert.alert('Error', 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Something went wrong while submitting the report');
    }
  };

  // Function to toggle the map type between standard and satellite.
  const toggleMapType = () => {
    setMapType((prevType) => (prevType === 'standard' ? 'satellite' : 'standard'));
  };

  // Function to open the description modal.
  const openModal = () => {
    setTempDescription(description);
    setModalVisible(true);
  };

  // Function to close the description modal.
  const closeModal = () => {
    setDescription(tempDescription);
    setModalVisible(false);
  };

  // Function to take a picture using the device's camera.
  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to use this feature.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  // Function to open the image viewer modal.
  const openImageViewer = () => {
    setSelectedImagesToDelete([]); // Reset selection when opening viewer
    setImageViewerVisible(true);
  };

  // Function to close the image viewer modal.
  const closeImageViewer = () => {
    setImageViewerVisible(false);
  };

  // Function to toggle the selection of an image for deletion.
  const toggleImageSelection = useCallback((imageUri) => {
    setSelectedImagesToDelete((prevSelectedImages) => {
      if (prevSelectedImages.includes(imageUri)) {
        return prevSelectedImages.filter((uri) => uri !== imageUri);
      } else {
        return [...prevSelectedImages, imageUri];
      }
    });
  }, []);

  // Function to delete the selected images.
  const deleteSelectedImages = () => {
    if (selectedImagesToDelete.length > 0) {
      setImages((prevImages) => prevImages.filter((uri) => !selectedImagesToDelete.includes(uri)));
      setSelectedImagesToDelete([]); // Clear selection after deletion
      closeImageViewer();
    } else {
      Alert.alert('No Images Selected', 'Please select images to delete.');
    }
  };

  // Function to check if an image is selected for deletion.
  const isImageSelected = (imageUri) => selectedImagesToDelete.includes(imageUri);

  // Render the UI.
  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Search..." />
        <TouchableOpacity style={styles.searchIcon}>
          <Ionicons name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Report Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{reportTitle}</Text>
        <TextInput
          style={[styles.invisibleInput, !userId && styles.errorInput]}
          value={userId}
          editable={false} // Make it non-editable
        />
        {!userId && <Text style={styles.errorText}>User ID not loaded</Text>}
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {location ? (
          <>
            <MapView
              style={StyleSheet.absoluteFillObject}
              mapType={mapType}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You are here" />
            </MapView>
            <TouchableOpacity style={styles.mapToggleButton} onPress={toggleMapType}>
              <Ionicons name="layers" size={24} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <Text>Loading Map...</Text>
        )}
      </View>

      {/* Description */}
      <Text style={styles.descriptionLabel}>Description</Text>
      <TouchableOpacity onPress={openModal}>
        <View style={styles.descriptionInput}>
          <Text style={{ color: description ? 'black' : 'gray' }}>{description || 'Enter description...'}</Text>
        </View>
      </TouchableOpacity>

      {/* Image Container */}
      <TouchableOpacity onPress={openImageViewer}>
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <View style={styles.imagePlaceholder}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.overlayedImage}
                  />
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.plusButton} onPress={takePicture}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePlaceholder} onPress={takePicture}>
              <Ionicons name="camera" size={40} color="gray" />
              <Text>Take Picture</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent animationType="fade" visible={isModalVisible} onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter description..."
                multiline
                autoFocus
                value={tempDescription}
                onChangeText={setTempDescription}
                onBlur={closeModal}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal visible={imageViewerVisible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setImageViewerVisible(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.imageGrid}>
              {images.length > 0 ? (
                images.map((img, index) => {
                  const isSelected = isImageSelected(img);
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => toggleImageSelection(img)}
                      style={[
                        styles.gridImageContainer,
                        isSelected && styles.selectedImageContainer,
                      ]}
                    >
                      <Image
                        source={{ uri: img }}
                        style={styles.gridImage}
                        resizeMode="contain"
                      />
                      {isSelected && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: 'white' }}>No images to show</Text>
              )}
            </ScrollView>
            {selectedImagesToDelete.length > 0 && (
              <TouchableOpacity style={styles.deleteButton} onPress={deleteSelectedImages}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row', // Use flexbox to align items horizontally
    alignItems: 'center', // Vertically center items
  },
  mapContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    overflow: 'hidden',
  },
  mapToggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    minHeight: 100,
    justifyContent: 'start',
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  imagePlaceholder: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 130,
  },
  plusButton: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  gridImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalInput: {
    height: 150,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  gridImageContainer: {
    width: '45%',
    height: 200,
    margin: '1.66%',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedImageContainer: {
    borderColor: 'blue',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 3,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  submitButton: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
    width: '80%',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  invisibleInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  errorInput: {
    borderColor: 'red',
    borderWidth: 1,
    opacity: 1, // Make it visible when there's an error
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    marginLeft: 10,
    marginTop: 5,
    fontSize: 14,
  },
});

export default App;