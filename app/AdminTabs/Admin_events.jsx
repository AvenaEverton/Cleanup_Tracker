import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Platform, // Import Platform
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
import { Video } from 'expo-av';
import * as Location from 'expo-location';

// Conditionally import MapView and Marker for mobile
let MapView;
let Marker;
if (Platform.OS !== 'web') {
    try {
        ({ default: MapView, Marker } = require('react-native-maps'));
    } catch (error) {
        console.error("Error loading react-native-maps:", error);
        MapView = null;
        Marker = null;
    }
}

const AdminEvents = () => {
    const [eventName, setEventName] = useState("");
    const [description, setDescription] = useState(false);
    const [showDescriptionInput, setShowDescriptionInput] = useState(false);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [location, setLocation] = useState("");
    const [additionalDetails, setAdditionalDetails] = useState("");
    const [files, setFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: 14.5500, // Default Manila latitude
        longitude: 121.0200, // Default Manila longitude
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [eventCreated, setEventCreated] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isMapAvailable, setIsMapAvailable] = useState(true);
    const webMapRef = useRef(null); // Ref for the canvas element
    const [mapInitialized, setMapInitialized] = useState(false); // Track map initialization
    const [mapZoom, setMapZoom] = useState(15);  // Initial zoom level
    const [mapCenter, setMapCenter] = useState({ latitude: 14.5500, longitude: 121.0200 }); // Manila
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [viewPort, setViewPort] = useState({x: 0, y: 0, width: 0, height: 0});

    useEffect(() => {
        if (Platform.OS !== 'web' && !MapView) {
            setIsMapAvailable(false);
        }
    }, []);

    useEffect(() => {
        const generatePreviews = async () => {
            console.log("generatePreviews called");
            const previews = [];
            for (const file of files) {
                console.log("Processing file:", file);
                const fileName = file.name;
                const fileExtension = fileName.split(".").pop().toLowerCase();
                let fileType = "unsupported";

                if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                    fileType = "image";
                } else if (["mp4", "mov", "avi"].includes(fileExtension)) {
                    fileType = "video";
                }

                console.log("File type:", fileType);
                previews.push({ uri: file.uri, type: fileType, name: fileName });
            }
            console.log("Generated previews:", previews);
            setFilePreviews(previews);
        };

        if (files.length > 0) {
            generatePreviews();
        } else {
            setFilePreviews([]);
        }
    }, [files]);

    useEffect(() => {
        const getLocationAsync = async () => {
            if (Platform.OS !== 'web') {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    return;
                }

                let currentLocation = await Location.getCurrentPositionAsync({});
                setInitialRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                setMapRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                setMapCenter({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });
            }
        };

        if (Platform.OS !== 'web') { // Only get location on mobile
            getLocationAsync();
        }
    }, []);

    useEffect(() => {
        if (Platform.OS === 'web' && webMapRef.current && !mapInitialized) {
            const canvas = webMapRef.current;
            const ctx = canvas.getContext('2d');
            setViewPort({x: 0, y: 0, width: canvas.width, height: canvas.height});

            const drawMap = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const zoom = mapZoom;
                const center = mapCenter;
                const canvasSize = { width: canvas.width, height: canvas.height };

                const { tileX, tileY } = latLonToTile(center.latitude, center.longitude, zoom);
                const halfTilesX = canvasSize.width / 2 / TILE_SIZE;
                const halfTilesY = canvasSize.height / 2 / TILE_SIZE;

                const minTileX = Math.floor(tileX - halfTilesX);
                const maxTileX = Math.ceil(tileX + halfTilesX);
                const minTileY = Math.floor(tileY - halfTilesY);
                const maxTileY = Math.ceil(tileY + halfTilesY);

                const tileUrls = [];
                for (let x = minTileX; x <= maxTileX; x++) {
                    for (let y = minTileY; y <= maxTileY; y++) {
                        tileUrls.push({
                            url: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
                            x: (x - minTileX) * TILE_SIZE - (tileX - minTileX - halfTilesX) * TILE_SIZE,
                            y: (y - minTileY) * TILE_SIZE - (tileY - minTileY - halfTilesY) * TILE_SIZE,
                        });
                    }
                }

                let loadedTiles = 0;
                tileUrls.forEach(tileData => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, tileData.x, tileData.y, TILE_SIZE, TILE_SIZE);
                        loadedTiles++;
                        if (loadedTiles === tileUrls.length) {
                            // Draw the marker after all tiles are loaded.
                            if (selectedCoordinates) {
                                const markerPixel = latLonToPixel(selectedCoordinates.latitude, selectedCoordinates.longitude, zoom, canvasSize, center);
                                drawMarker(ctx, markerPixel.x, markerPixel.y);
                            }
                        }
                    };
                    img.onerror = () => {
                        console.error("Failed to load tile:", tileData.url);
                        loadedTiles++; // Ensure loading completes even on error
                        if (loadedTiles === tileUrls.length) {
                             if (selectedCoordinates) {
                                const markerPixel = latLonToPixel(selectedCoordinates.latitude, selectedCoordinates.longitude, zoom, canvasSize, center);
                                drawMarker(ctx, markerPixel.x, markerPixel.y);
                            }
                        }
                    };
                    img.src = tileData.url;
                });
            }
            drawMap();
            setMapInitialized(true);
        }
    }, [Platform.OS, webMapRef, mapInitialized, mapZoom, mapCenter, selectedCoordinates]);

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({});
        if (!result.canceled) {
            console.log("pickDocument result:", result);

            let pickedFile = {
                uri: result.assets[0].uri,
                name: result.assets[0].name,
                mimeType: result.assets[0].mimeType,
                size: result.assets[0].size,
            };

            setFiles([...files, pickedFile]);
        }
    };

    const handleCreateEvent = async () => {
        try {
            setErrorMessage(''); // Clear previous errors
            const formData = new FormData();
            formData.append('eventName', eventName);
            formData.append('description', description);
            formData.append('date', date.toISOString().split("T")[0]);
            formData.append('time', time.toTimeString().split(" ")[0]);
            formData.append('location', location);
            formData.append('additionalDetails', additionalDetails);

            files.forEach((file) => {
                formData.append('attachments', {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType,
                    size: file.size,
                });
            });

            const response = await axios.post("http://192.168.1.12:5000/addEvent", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setEventCreated(true); // Set success state
                alert(response.data.message);
                console.log("Event Created:", response.data);
                setModalVisible(false);
                setEventName("");
                setDescription("");
                setShowDescriptionInput(false);
                setDate(new Date());
                setTime(new Date());
                setLocation("");
                setAdditionalDetails("");
                setFiles([]);
                setFilePreviews([]);
            } else {
                setErrorMessage(response.data.message || 'Failed to add event');
                alert(response.data.message || 'Failed to add event');
                console.error("Error creating event:", response.data);
            }

        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message || 'Failed to create event');
                alert(`Failed to create event: ${error.response.data.message}`);
                console.error("Error creating event:", error.response.data);
            } else {
                setErrorMessage('Failed to create event. Please check your network connection.');
                alert("Failed to create event. Please check your network connection.");
                console.error("Error creating event:", error);
            }
        }
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    const formatTime = (time) => {
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        return time.toLocaleTimeString(undefined, options);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);

        const newPreviews = [...filePreviews];
        newPreviews.splice(index, 1);
        setFilePreviews(newPreviews);
    };

    const toggleDescriptionInput = () => {
        setShowDescriptionInput(!showDescriptionInput);
        if (showDescriptionInput) {
            setDescription("");
        }
    };

    const renderPreview = (preview, index) => {
        console.log(`Rendering preview ${index} with data:`, preview);
        if (preview.type === 'image') {
            return (
                <Image
                    key={index}
                    source={{ uri: preview.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                />
            );
        } else if (preview.type === 'video') {
            return (
                <Video
                    key={index}
                    source={{ uri: preview.uri }}
                    style={styles.previewVideo}
                    useNativeControls
                    resizeMode="contain"
                />
            );
        } else {
            return (
                <View key={index} style={styles.unsupportedPreview}>
                    <Text style={styles.previewText}>
                        Preview not available for {preview.name}
                    </Text>
                </View>
            );
        }
    };

    const TILE_SIZE = 256;
    const latLonToTile = (lat, lon, zoom) => {
        const x = Math.floor((lon + 180.0) / 360.0 * Math.pow(2.0, zoom));
        const y = Math.floor(
            (1.0 -
                Math.log(Math.tan((lat * Math.PI) / 180.0) + 1.0 / Math.cos((lat * Math.PI) / 180.0)) /
                    Math.PI) /
            2.0 *
            Math.pow(2.0, zoom)
        );
        return { tileX: x, tileY: y };
    };

    const latLonToPixel = (latitude, longitude, zoom, canvasSize, center) => {
        const centerTile = latLonToTile(center.latitude, center.longitude, zoom);
        const targetTile = latLonToTile(latitude, longitude, zoom);

        const centerPixelX = (canvasSize.width / 2);
        const centerPixelY = (canvasSize.height / 2);

        const x = centerPixelX + (targetTile.tileX - centerTile.tileX) * TILE_SIZE;
        const y = centerPixelY + (targetTile.tileY - centerTile.tileY) * TILE_SIZE;

        return { x, y };
    };

    const drawMarker = (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    };

    const handleMapPress = (e) => {
        if (Platform.OS !== 'web') {
            if (isMapAvailable && MapView) {
                setSelectedCoordinates(e.nativeEvent.coordinate);
                Location.reverseGeocodeAsync(e.nativeEvent.coordinate)
                    .then(result => {
                        if (result && result.length > 0) {
                            const locationData = result[0];
                            let address = "";
                            if (locationData.street) {
                                address += locationData.street + ", ";
                            }
                            if (locationData.city) {
                                address += locationData.city + ", ";
                            }
                            if (locationData.region) {
                                address += locationData.region + ", ";
                            }
                            if (locationData.country) {
                                address += locationData.country;
                            }
                            setLocation(address);
                        }
                    })
                    .catch(error => {
                        console.error("Reverse geocoding error:", error);
                        alert("Failed to retrieve address. Please select a more accurate location.");
                    });
            }
        } else if (Platform.OS === 'web' && webMapRef.current) {
            const canvas = webMapRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const canvasSize = {width: canvas.width, height: canvas.height};
            const clickedLatLon = pixelToLatLon(x, y, mapZoom, canvasSize, mapCenter);

            setSelectedCoordinates(clickedLatLon);
            setLocation(`Web Canvas: Lat: ${clickedLatLon.latitude.toFixed(4)}, Lon: ${clickedLatLon.longitude.toFixed(4)}`);
            setMapCenter(clickedLatLon); //center map on click
        }
    };

    const pixelToLatLon = (x, y, zoom, canvasSize, center) => {
        const centerTile = latLonToTile(center.latitude, center.longitude, zoom);
        const halfWidth = canvasSize.width / 2;
        const halfHeight = canvasSize.height / 2;

        const tileX = centerTile.tileX + (x - halfWidth) / TILE_SIZE;
        const tileY = centerTile.tileY + (y - halfHeight) / TILE_SIZE;

        const longitude = (tileX / Math.pow(2, zoom)) * 360 - 180;
        const latitude = tileToLatitude(tileY, zoom);
        return { latitude, longitude };
    };

    function tileToLatitude(y, zoom) {
        const n = Math.PI - 2 * Math.PI * y / Math.pow(2, zoom);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    const confirmLocation = () => {
        setMapModalVisible(false);
    };

    const openMap = async () => {
        if (Platform.OS !== 'web') {
            if (isMapAvailable && MapView) {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    alert('Permission to access location was denied');
                    return;
                }

                let currentLocation = await Location.getCurrentPositionAsync({});
                setMapRegion({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
                setMapCenter({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });
                setMapModalVisible(true);
            } else {
                alert("Map functionality is not available.");
            }
        } else if (Platform.OS === 'web') {
            setMapModalVisible(true);
        }
    };

    const handleZoom = (zoomChange) => {
        setMapZoom(prevZoom => {
            const newZoom = prevZoom + zoomChange;
            if (newZoom >= 1 && newZoom <= 19) { // Limit zoom levels
                return newZoom;
            }
            return prevZoom;
        });
    };

    const handleMapDragStart = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMapDrag = (e) => {
        if (isDragging) {
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;

            const canvas = webMapRef.current;
            const canvasSize = {width: canvas.width, height: canvas.height};

            const newCenter = pixelOffsetToLatLon(deltaX, deltaY, mapZoom, canvasSize, mapCenter);

            setMapCenter(newCenter);
            setDragStart({ x: e.clientX, y: e.clientY }); // Update start for continuous dragging
        }
    };

    const handleMapDragEnd = () => {
        setIsDragging(false);
    };

    const pixelOffsetToLatLon = (offsetX, offsetY, zoom, canvasSize, center) => {
        const centerTile = latLonToTile(center.latitude, center.longitude, zoom);

        const tileOffsetX = offsetX / TILE_SIZE;
        const tileOffsetY = offsetY / TILE_SIZE;

        const newTileX = centerTile.tileX - tileOffsetX;
        const newTileY = centerTile.tileY - tileOffsetY;

        const newLongitude = (newTileX / Math.pow(2, zoom)) * 360 - 180;
        const newLatitude = tileToLatitude(newTileY, zoom);

        return { latitude: newLatitude, longitude: newLongitude };
    };

    return (
        <Provider>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.profileIcon}>
                        <FontAwesome name="user-circle" size={30} color="#34C759" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hello Admin! "Username"</Text>
                </View>

                <ScrollView style={styles.content}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>Create Event</Text>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    label="Event Name"
                                    value={eventName}
                                    onChangeText={setEventName}
                                    mode="outlined"
                                    style={styles.input}
                                />
                                {!showDescriptionInput && (
                                    <TouchableOpacity onPress={toggleDescriptionInput} style={styles.addDescriptionButton}>
                                        <Text style={styles.addDescriptionText}>Add description</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {showDescriptionInput && (
                                <View style={styles.descriptionInputContainer}>
                                    <TextInput
                                        label="Description"
                                        value={description}
                                        onChangeText={setDescription}
                                        mode="outlined"
                                        multiline
                                        style={styles.descriptionInput}
                                    />
                                    <TouchableOpacity onPress={toggleDescriptionInput} style={styles.cancelDescriptionButton}>
                                        <MaterialIcons name="close" size={20} color="#388E3C" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <Text style={styles.label}>Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                <MaterialIcons name="calendar-today" size={20} color="#333" />
                                <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
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

                            <Text style={styles.label}>Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
                                <MaterialIcons name="access-time" size={20} color="#333" />
                                <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
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

                            <Text style={styles.dateTimeSummary}>
                                {formatDate(date)} at {formatTime(time)}
                            </Text>

                            <View style={styles.locationContainer}>
                                <TextInput
                                    label="Location"
                                    value={location}
                                    onChangeText={setLocation}
                                    mode="outlined"
                                    style={styles.input}
                                />
                                <TouchableOpacity onPress={openMap} style={styles.setMeetingRoomButton}>
                                    <Text style={styles.setMeetingRoomText}>Set on Map</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.uploadContainer}>
                                <Text style={styles.uploadLabel}>Upload attachments</Text>
                                <TouchableOpacity onPress={pickDocument} style={styles.selectFilesButton}>
                                    <MaterialIcons name="attach-file" size={20} color="white" />
                                    <Text style={styles.selectFilesText}>Select Files</Text>
                                </TouchableOpacity>
                                {files.length > 0 && (
                                    <View style={styles.fileList}>
                                        {files.map((file, index) => (
                                            <View key={index} style={styles.fileItem}>
                                                <Text style={styles.fileName}>{file.name}</Text>
                                                <TouchableOpacity onPress={() => removeFile(index)}>
                                                    <MaterialIcons name="close" size={16} color="#388E3C" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.previewContainer}>
                                <Text style={styles.previewLabel}>Preview</Text>
                                <ScrollView horizontal>
                                    {filePreviews.length > 0 ? (
                                        filePreviews.map((preview, index) => (
                                            <View key={index} style={styles.singlePreview}>
                                                {renderPreview(preview, index)}
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.previewPlaceholder}>No preview available</Text>
                                    )}
                                </ScrollView>
                            </View>
                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}
                        </Card.Content>
                    </Card>
                </ScrollView>

                <View style={styles.bottomButtons}>
                    <Button mode="contained" onPress={() => setModalVisible(true)} style={styles.createButton}>
                        Create
                    </Button>
                </View>

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
                    <Dialog visible={mapModalVisible} onDismiss={() => setMapModalVisible(false)}>
                        <Dialog.Title>Select Location</Dialog.Title>
                        <Dialog.Content>
                            <View style={{ width: 320, height: 300 }}>
                                {Platform.OS !== 'web' && isMapAvailable && MapView ? (
                                    <MapView
                                        style={{ flex: 1 }}
                                        region={mapRegion}
                                        onPress={handleMapPress}
                                    >
                                        {selectedCoordinates && Marker && (
                                            <Marker
                                                coordinate={selectedCoordinates}
                                                title="Event Location"
                                            />
                                        )}
                                    </MapView>
                                ) : (
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text>Map functionality is not available on this platform.</Text>
                                    </View>
                                )}
                            </View>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setMapModalVisible(false)}>Cancel</Button>
                            <Button onPress={confirmLocation}>Confirm</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: "#E8F5E9",
        borderBottomWidth: 1,
        borderColor: "#81C784",
    },
    profileIcon: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1B5E20",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        borderRadius: 8,
        elevation: 3,
        backgroundColor: "#F1F7ED",
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#1B5E20",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    input: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    addDescriptionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#E0F2E9",
        borderRadius: 5,
        marginLeft: 10,
    },
    addDescriptionText: {
        color: "#388E3C",
        fontSize: 12,
    },
    descriptionInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    descriptionInput: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        marginRight: 10,
    },
    cancelDescriptionButton: {
        padding: 8,
    },
    label: {
        fontSize: 16,
        color: "#1B5E20",
        marginBottom: 5,
        marginTop: 15,
    },
    dateTimeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#81C784",
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        flex: 1,
        marginRight: 5,
    },
    timePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#81C784",
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        flex: 1,
        marginLeft: 5,
    },
    dateTimeText: {
        marginLeft: 10,
        fontSize: 16,
        color: "#2E7D32",
    },
    dateTimeSummary: {
        fontSize: 14,
        color: "#2E7D32",
        marginBottom: 15,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    setMeetingRoomButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#E0F2E9",
        borderRadius: 5,
        marginLeft: 10,
    },
    setMeetingRoomText: {
        color: "#388E3C",
        fontSize: 12,
    },
    uploadContainer: {
        marginBottom: 20,
    },
    uploadLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1B5E20",
    },
    selectFilesButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007bff",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginBottom: 10,
        width: "50%",
        justifyContent: "center",
    },
    selectFilesText: {
        color: "white",
        marginLeft: 10,
    },
    fileList: {
        marginTop: 10,
    },
    fileItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: "#E0F2E9",
        borderRadius: 5,
        marginBottom: 5,
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        color: "#2E7D32",
        marginRight: 10,
    }, previewContainer: {
        marginBottom: 20,
    },
    previewLabel: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#1B5E20",
    },
    previewArea: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#81C784",
        borderRadius: 5,
        padding: 15,
        minHeight: 80,
    },
    previewPlaceholder: {
        color: "#757575",
        fontSize: 14,
        textAlign: 'center',
    },
    singlePreview: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#81C784',
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        width: 200,
        height: 200,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewVideo: {
        width: '100%',
        height: '100%',
    },
    previewText: {
        fontSize: 14,
        color: '#2E7D32',
        textAlign: 'center'
    },
    unsupportedPreview: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0F2E9',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#81C784'
    },
    documentPreview: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    unknownPreview: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    createButton: { // added createButton style
        backgroundColor: '#008000'
    }
});

export default AdminEvents;
