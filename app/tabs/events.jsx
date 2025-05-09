import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ThemeContext } from '../../context/ThemeContext'; // Adjust the path if needed
import Tooltip from 'react-native-walkthrough-tooltip';

const App = () => {
    // State variables
    const [location, setLocation] = useState(null);
    const [mapType, setMapType] = useState('standard');
    const [isModalVisible, setModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [tempDescription, setTempDescription] = useState('');
    const [images, setImages] = useState([]); // Store file objects, not just URIs
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImagesToDelete, setSelectedImagesToDelete] = useState([]);
    const [reportTitle, setReportTitle] = useState('Report');
    const [userId, setUserId] = useState("");
    const [reportIcon, setReportIcon] = useState('document-text-outline');
    const { darkMode: isDarkMode } = useContext(ThemeContext);
    const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false); // New state for walkthrough
    const [isNewApprovedUser, setIsNewApprovedUser] = useState(false); // State to track new user status

    // Tooltip states and refs
    const mapRef = useRef(null);
    const [mapTooltipVisible, setMapTooltipVisible] = useState(false);
    const descriptionRef = useRef(null);
    const [descriptionTooltipVisible, setDescriptionTooltipVisible] = useState(false);
    const imageRef = useRef(null);
    const [imageTooltipVisible, setImageTooltipVisible] = useState(false);
    const submitRef = useRef(null);
    const [submitTooltipVisible, setSubmitTooltipVisible] = useState(false);
    const tipIconRef = useRef(null); // Ref for the tip icon
    const [showTipIconTooltip, setShowTipIconTooltip] = useState(false);
    const [address, setAddress] = useState('');




    const fetchAddressFromCoords = async (coords) => {
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}&apiKey=e51fa78ef9e946cda57e3ca54876e825`
            );
            const data = await response.json();
            console.log("📍 Geoapify response:", data); // Debug
    
            if (data && data.features && data.features.length > 0) {
                const props = data.features[0].properties;
    
                const street = props.street; // No fallback
                const barangay = props.suburb || props.quarter || 'Unknown Barangay';
                const city = props.city || props.town || props.village || 'Unknown City';
                const state = props.state || 'Unknown Region';
                const postcode = props.postcode || '0000';
                const country = props.country || 'Unknown Country';
    
                const addressParts = [
                    street,      // Only included if truthy
                    barangay,
                    city,
                    state,
                    postcode,
                    country
                ].filter(Boolean); // Remove empty/undefined
    
                const fullAddress = addressParts.join(', ');
                setAddress(fullAddress);
            } else {
                setAddress("Address not found");
            }
        } catch (error) {
            console.error("Geoapify fetch error:", error);
            setAddress("Failed to fetch address");
        }
    };
    

    

    const colors = isDarkMode
        ? {
            primary: 'blue',
            background: 'rgba(0, 0, 50, 0.8)',
            card: 'rgba(0, 0, 50, 0.9)',
            text: '#f7fafc',
            border: 'rgba(255, 255, 255, 0.2)',
        }
        : {
            primary: 'green',
            background: '#f0f4f0',
            card: 'white',
            text: 'black',
            border: '#ddd',
        };

    // Get current location on mount
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
fetchAddressFromCoords(currentLocation.coords);

        })();
    }, []);

    // Fetch user ID and new user status from storage
    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                const storedNewUserStatus = await AsyncStorage.getItem("isNewApprovedUser");

                if (storedUserId) {
                    setUserId(storedUserId);
                    console.log("User ID from AsyncStorage:", storedUserId);
                } else {
                    console.log("userId not found in AsyncStorage");
                    Alert.alert("Error", "Please log in to submit a report.");
                }

                // Check for new user status
                if (storedNewUserStatus === 'true') {
                    setIsNewApprovedUser(true);
                } else {
                    setIsNewApprovedUser(false);
                }
            } catch (error) {
                console.error("Failed to fetch user data from AsyncStorage", error);
                Alert.alert("Error", "Failed to retrieve user data. Please check your connection.");
            }
        };
        getUserData();
    }, []);

    // Submit report
    const submitReport = async () => {
        if (!userId) {
            Alert.alert("Error", "User ID is missing. Please log in again.");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('title', reportTitle);
            formData.append('description', description);
            formData.append('latitude', location.latitude);
            formData.append('longitude', location.longitude);
            formData.append('address', address);


            // Append each image individually
            images.forEach((image, index) => {
                formData.append(`images`, {
                    uri: image.uri,
                    type: image.type, // Ensure the correct MIME type is used
                    name: image.name || `image_${index}.jpg`, // Provide a filename
                });
            });

            const response = await axios.post('https://backend-rt98.onrender.com/api/reports', formData, {
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

    // Toggle map type
    const toggleMapType = () => {
        setMapType((prevType) => (prevType === 'standard' ? 'satellite' : 'standard'));
    };

    // Open description modal
    const openModal = () => {
        setTempDescription(description);
        setModalVisible(true);
    };

    // Close description modal
    const closeModal = () => {
        setDescription(tempDescription);
        setModalVisible(false);
    };

    // Take picture
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
            // Create a file object with uri, name, and type
            const newImage = {
                uri: result.assets[0].uri,
                name: `image_${Date.now()}.jpg`, // Generate a unique name
                type: 'image/jpeg', // Set the correct MIME type
            };
            setImages((prevImages) => [...prevImages, newImage]);
        }
    };

    // Open image viewer
    const openImageViewer = () => {
        setSelectedImagesToDelete([]);
        setImageViewerVisible(true);
    };

    // Close image viewer
    const closeImageViewer = () => {
        setImageViewerVisible(false);
    };

    // Toggle image selection for deletion
    const toggleImageSelection = useCallback((imageUri) => {
        setSelectedImagesToDelete((prevSelectedImages) => {
            if (prevSelectedImages.includes(imageUri)) {
                return prevSelectedImages.filter((uri) => uri !== imageUri);
            } else {
                return [...prevSelectedImages, imageUri];
            }
        });
    }, []);

    // Delete selected images
    const deleteSelectedImages = () => {
        if (selectedImagesToDelete.length > 0) {
            setImages((prevImages) =>
                prevImages.filter((image) => !selectedImagesToDelete.includes(image.uri))
            );
            setSelectedImagesToDelete([]);
            closeImageViewer();
        } else {
            Alert.alert('No Images Selected', 'Please select images to delete.');
        }
    };

    // Check if image is selected for deletion
    const isImageSelected = (imageUri) => selectedImagesToDelete.includes(imageUri);

    // Define dark mode styles.  These are now within the component,
    // and use the 'dark' value from the theme.
    const allStyles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 0,
        },
        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
            opacity: 0.5,
        },
        blurView: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
            backgroundColor: colors.background === 'rgba(0, 0, 50, 0.8)' ? 'rgba(0, 0, 50, 0.7)' : 'transparent',
        },
        reportHeader: {
            flexDirection: "row",
            alignItems: "center",
            height: 50,
            paddingHorizontal: 20,
            backgroundColor: "transparent",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            position: 'relative', // Added for absolute positioning of tipIcon
        },
        reportHeaderText: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            marginLeft: 8,
        },
        mapContainer: {
            width: '94%',
            height: 300,
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 20,
            position: 'relative',
            marginHorizontal: 10,
            marginTop: 10,
            marginRight: 10,
            backgroundColor: colors.background,
        },
        mapToggleButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 50,
            padding: 10,
        },
        descriptionLabel: {
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 5,
            color: colors.text,
            paddingHorizontal: 20,
        },
        descriptionInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 10,
            backgroundColor: colors.card,
            marginHorizontal: 20,
            color: colors.text, // Added text color for input
        },
        imageContainer: {
            marginTop: 20,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 0,
            padding: 10,
            backgroundColor: colors.card,
            height: 150,
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 20,
        },
        overlayedImage: {
            width: 100,
            height: 100,
            marginRight: 10,
            borderRadius: 5,
            backgroundColor: colors.background,
        },
        plusButton: {
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: '#558b2f',
            borderRadius: 50,
            padding: 10,
        },
        cameraPlaceholder: {
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 10,
        },
        cameraButton: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
        },
        submitButtonContainer: {
            marginTop: 20,
            alignItems: 'center',
        },
        submitButton: {
            backgroundColor: '#2e7d32',
            padding: 15,
            borderRadius: 10,
            width: '80%',
        },
        submitButtonText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            width: '80%',
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 20,
        },
        modalInput: {
            height: 150,
            fontSize: 16,
            padding: 10,
            textAlignVertical: 'top',
            color: colors.text
        },
        imageGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
        },
        gridImageContainer: {
            margin: 10,
        },
        gridImage: {
            width: 100,
            height: 100,
            borderRadius: 10,
        },
        selectedImageContainer: {
            borderWidth: 3,
            borderColor: '#2e7d32',
        },
        selectedIndicator: {
            position: 'absolute',
            top: 5,
            left: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 50,
            padding: 5,
        },
        deleteButton: {
            backgroundColor: '#2e7d32',
            padding: 15,
            borderRadius: 10,
            marginTop: 10,
            alignItems: 'center',
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
            opacity: 0,
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
        tooltipWrapper: {
            zIndex: 1000,
        },
        tooltipContainer: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 10,
            paddingTop: 10,
            paddingBottom: 30, // Increased bottom padding
            paddingLeft: 20,
            paddingRight: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
            maxWidth: '95%',
            minWidth: '80%',
            height: 'auto', // Added height: auto
            minHeight: 100, // Added minHeight
        },
        tooltipContent: {
            alignItems: 'center',
        },
        tooltipTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#000000',
            marginBottom: 12,
            textAlign: 'center'
        },
        tooltipDescription: {
            fontSize: 14,
            color: '#000000',
            textAlign: 'center',
            lineHeight: 20,
        },
        tipIcon: {
            position: 'absolute',
            top: -10, // Adjusted top
            left: 190, // Adjusted left
            zIndex: 1000, // Ensure it's above other elements
            transform: [{ scale: 1.5 }], // Make the icon 1.5 times bigger
        },
    });

    // Check and set walkthrough status
    useEffect(() => {
        const checkWalkthroughStatus = async () => {
            try {
                const hasSeen = await AsyncStorage.getItem('hasSeenReportWalkthrough');

                if (hasSeen === 'true' || !isNewApprovedUser) {
                    setHasSeenWalkthrough(true);
                } else {
                    setShowTipIconTooltip(true); // Show the first tooltip, now the tip icon tooltip
                    await AsyncStorage.setItem('hasSeenReportWalkthrough', 'true'); //set to true after first time
                }
            } catch (error) {
                console.error("Error checking walkthrough status:", error);
                // If there's an error, you might want to show the walkthrough again
                setShowTipIconTooltip(true);
            }
        };
        checkWalkthroughStatus();
    }, [isNewApprovedUser]);

    // Control tooltip visibility
    useEffect(() => {
        if (hasSeenWalkthrough) {
            setMapTooltipVisible(false);
            setDescriptionTooltipVisible(false);
            setImageTooltipVisible(false);
            setSubmitTooltipVisible(false);
            setShowTipIconTooltip(false);
        }
    }, [hasSeenWalkthrough]);

    const closeTooltip = (setter) => {
        setter(false);
        if (setter === setShowTipIconTooltip) { // Corrected condition
            setMapTooltipVisible(true);
        } else if (setter === setMapTooltipVisible) {
            setDescriptionTooltipVisible(true);
        } else if (setter === setDescriptionTooltipVisible) {
            setImageTooltipVisible(true);
        } else if (setter === setImageTooltipVisible) {
            setSubmitTooltipVisible(true);
        }
    };


    return (
        <View style={allStyles.container}>
            {/* Background Image */}
            <Image
                source={require('../../assets/images/reportbg.jpg')}
                style={allStyles.backgroundImage}
            />
            <BlurView style={allStyles.blurView} intensity={50} />

            {/* Report Header */}
            <SafeAreaView style={{ backgroundColor: 'transparent' }}>
                <View style={allStyles.reportHeader}>
                    <Ionicons name={reportIcon} size={24} color={colors.text === '#f7fafc' ? "#a0aec0" : "#2e7d32"} style={{ marginRight: 8 }} />
                    <Text style={allStyles.reportHeaderText}>{reportTitle}</Text>
                    {/* Tip Icon */}
                    <Tooltip
                        isVisible={showTipIconTooltip}
                        content={
                            <View style={allStyles.tooltipContent}>
                                <Text style={allStyles.tooltipTitle}>How to Report</Text>
                                <Text style={allStyles.tooltipDescription}>
                                    Follow these steps to submit a report:
                                    {'\n'}1. Select the location on the map.
                                    {'\n'}2. Add a description of the incident.
                                    {'\n'}3. Upload images (optional).
                                    {'\n'}4. Tap "Submit".
                                </Text>
                            </View>
                        }
                        placement="bottom"
                        onClose={() => closeTooltip(setShowTipIconTooltip)} // Corrected onClose
                        useReactNativeModal={true}
                        childWrapperStyle={allStyles.tooltipWrapper}
                        containerStyle={allStyles.tooltipContainer}
                    >
                        <TouchableOpacity
                            ref={tipIconRef}
                            style={allStyles.tipIcon}
                            onPress={() => setShowTipIconTooltip(true)} // Show tooltip on press
                        >
                            <Ionicons name="information-circle-outline" size={24} color={colors.text === '#f7fafc' ? "#a0aec0" : "#2e7d32"} />
                        </TouchableOpacity>
                    </Tooltip>
                </View>
            </SafeAreaView>

            {/* Map Container */}
            <Tooltip
                isVisible={mapTooltipVisible}
                content={
                    <View style={allStyles.tooltipContent}>
                        <Text style={allStyles.tooltipTitle}>Select Location</Text>
                        <Text style={allStyles.tooltipDescription}>
                            Tap on the map to select the location of the incident.  Your current location is marked.
                        </Text>
                    </View>
                }
                placement="bottom"
                onClose={() => closeTooltip(setMapTooltipVisible)}
                useReactNativeModal={true}
                childWrapperStyle={allStyles.tooltipWrapper}
                containerStyle={allStyles.tooltipContainer}
            >
                <View style={allStyles.mapContainer} ref={mapRef}>
                    {location ? (
                        <>
                            <MapView
                                style={StyleSheet.absoluteFillObject}
                                mapType={mapType}
                                initialRegion={{
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                onPress={(e) => {
                                    const newCoords = e.nativeEvent.coordinate;
                                    setLocation(newCoords);
                                    fetchAddressFromCoords(newCoords);
                                }}
                                 // Allow user to change location
                            >
                                <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="You are here" />
                                {/* Show a marker if the user taps a new location */}
                                {location && location.latitude !== undefined && location.longitude !== undefined && (
                                    <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="Report Location" />
                                )}
                            </MapView>
                            <TouchableOpacity style={allStyles.mapToggleButton} onPress={toggleMapType}>
                                <Ionicons name="layers" size={24} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text>Loading Map...</Text>
                    )}
                </View>
            </Tooltip>

            <Text style={{ marginHorizontal: 20, color: colors.text, fontSize: 14, marginTop: 10 }}>
    📍 Address: {address || 'Tap on the map to get address'}
</Text>


            {/* Description */}
            <Tooltip
                isVisible={descriptionTooltipVisible}
                content={
                    <View style={allStyles.tooltipContent}>
                        <Text style={allStyles.tooltipTitle}>Add Description</Text>
                        <Text style={allStyles.tooltipDescription}>
                            Provide details about the incident.  Be as descriptive as possible.
                        </Text>
                    </View>
                }
                placement="bottom"
                onClose={() => closeTooltip(setDescriptionTooltipVisible)}
                useReactNativeModal={true}
                childWrapperStyle={allStyles.tooltipWrapper}
                containerStyle={allStyles.tooltipContainer}
            >
                <Text style={allStyles.descriptionLabel}>Description</Text>
                <TouchableOpacity onPress={openModal} ref={descriptionRef}>
                    <View style={[allStyles.descriptionInput, { borderRadius: 10 }]}>
                        <Text style={{ color: description ? colors.text : 'gray' }}>{description || 'Enter description...'}</Text>
                    </View>
                </TouchableOpacity>
            </Tooltip>

            {/* Image Container */}
            <Tooltip
                isVisible={imageTooltipVisible}
                content={
                    <View style={allStyles.tooltipContent}>
                        <Text style={allStyles.tooltipTitle}>Add Images</Text>
                        <Text style={allStyles.tooltipDescription}>
                            Add images of the incident. Tap the camera icon to take a photo. Tap the image area to view/delete.
                        </Text>
                    </View>
                }
                placement="bottom"
                onClose={() => closeTooltip(setImageTooltipVisible)}
                useReactNativeModal={true}
                childWrapperStyle={allStyles.tooltipWrapper}
                containerStyle={allStyles.tooltipContainer}
            >
                <TouchableOpacity onPress={openImageViewer} ref={imageRef}>
                    <View style={allStyles.imageContainer}>
                        {images.length > 0 ? (
                            <View style={allStyles.imagePlaceholder}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {images.map((image, index) => (
                                        <Image
                                            key={index}
                                            source={{ uri: image.uri }}
                                            style={allStyles.overlayedImage}
                                        />
                                    ))}
                                </ScrollView>
                                <TouchableOpacity style={allStyles.plusButton} onPress={takePicture}>
                                    <Ionicons name="add" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={allStyles.cameraPlaceholder}>
                                <TouchableOpacity style={[allStyles.cameraButton, { borderRadius: 10 }]} onPress={takePicture}>
                                    <Ionicons name="camera-outline" size={40} color={colors.text === '#f7fafc' ? '#a0aec0' : '#558b2f'} />
                                    <Text style={{ color: colors.text === '#f7fafc' ? '#a0aec0' : '#558b2f' }}>Take Picture</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Tooltip>

            {/* Modal */}
            <Modal transparent animationType="fade" visible={isModalVisible} onRequestClose={closeModal}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={allStyles.modalOverlay}>
                        <View style={allStyles.modalContent}>
                            <TextInput
                                style={allStyles.modalInput}
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
            </Modal>{/* Image Viewer Modal */}
            <Modal visible={imageViewerVisible} transparent={true} animationType="slide">
                <TouchableWithoutFeedback onPress={() => setImageViewerVisible(false)}>
                    <View style={allStyles.modalOverlay}>
                        <ScrollView contentContainerStyle={allStyles.imageGrid}>
                            {images.length > 0 ? (
                                images.map((image, index) => {
                                    const isSelected = isImageSelected(image.uri);
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => toggleImageSelection(image.uri)}
                                            style={[
                                                allStyles.gridImageContainer,
                                                isSelected && allStyles.selectedImageContainer,
                                            ]}
                                        >
                                            <Image
                                                source={{ uri: image.uri }}
                                                style={allStyles.gridImage}
                                                resizeMode="contain"
                                            />
                                            {isSelected && (
                                                <View style={allStyles.selectedIndicator}>
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
                            <TouchableOpacity style={allStyles.deleteButton} onPress={deleteSelectedImages}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Submit Button */}
            <Tooltip
                isVisible={submitTooltipVisible}
                content={
                    <View style={allStyles.tooltipContent}>
                        <Text style={allStyles.tooltipTitle}>Submit Report</Text>
                        <Text style={allStyles.tooltipDescription}>
                            Once you've provided all the details, tap here to submit your report.
                        </Text>
                    </View>
                }
                placement="top"
                onClose={() => closeTooltip(setSubmitTooltipVisible)}
                useReactNativeModal={true}
                childWrapperStyle={allStyles.tooltipWrapper}
                containerStyle={allStyles.tooltipContainer}
            >
                <View style={allStyles.submitButtonContainer} ref={submitRef}>
                    <TouchableOpacity style={allStyles.submitButton} onPress={submitReport}>
                        <Text style={allStyles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </Tooltip>
        </View>
    );
};

export default App;