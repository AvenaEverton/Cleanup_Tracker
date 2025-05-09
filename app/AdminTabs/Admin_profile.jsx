import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import axios from 'axios';
import { format, isToday } from 'date-fns';
import { Picker } from '@react-native-picker/picker';

const AdminProfile = () => {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [showEvents, setShowEvents] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalEvents, setTotalEvents] = useState(0);
    const [eventFilter, setEventFilter] = useState('All');
    const [showReports, setShowReports] = useState(false);
    const [reports, setReports] = useState([]);
    const [totalReports, setTotalReports] = useState(0);
    const [savedItems, setSavedItems] = useState([]);
    const [showSaved, setShowSaved] = useState(false);
    const [totalSavedItems, setTotalSavedItems] = useState(0);
    const [selectedSavedSection, setSelectedSavedSection] = useState('events');

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("userToken");
            router.replace("/LoginScreen");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleSettings = () => {
        setSettingsVisible(!settingsVisible);
    };

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = "https://backend-rt98.onrender.com/events";
            if (eventFilter === 'Created Now') {
                const today = new Date();
                const todayFormatted = format(today, 'yyyy-MM-dd');
                const response = await axios.get(url);
                if (response.data) {
                    const todayEvents = response.data.filter(event => {
                        const eventDate = event.event_date ? new Date(event.event_date) : null;
                        return eventDate && isToday(eventDate);
                    });
                    
                    const savedEvents = await AsyncStorage.getItem('savedEvents');
                    const savedEventIds = savedEvents ? JSON.parse(savedEvents).map(e => e.event_id) : [];
                    
                    const eventsWithSavedStatus = todayEvents.map(event => ({
                        ...event,
                        isSaved: savedEventIds.includes(event.event_id)
                    }));
                    
                    setEvents(eventsWithSavedStatus);
                    setTotalEvents(eventsWithSavedStatus.length);
                }
            } else if (eventFilter !== 'All') {
                Alert.alert("Filter Not Supported", "Filtering by event status is not supported by the current backend. Showing all events.");
                const response = await axios.get(url);
                if (response.data) {
                    const savedEvents = await AsyncStorage.getItem('savedEvents');
                    const savedEventIds = savedEvents ? JSON.parse(savedEvents).map(e => e.event_id) : [];
                    
                    const eventsWithSavedStatus = response.data.map(event => ({
                        ...event,
                        isSaved: savedEventIds.includes(event.event_id)
                    }));
                    
                    setEvents(eventsWithSavedStatus);
                    setTotalEvents(eventsWithSavedStatus.length);
                }
            } else {
                const response = await axios.get(url);
                if (response.data) {
                    const savedEvents = await AsyncStorage.getItem('savedEvents');
                    const savedEventIds = savedEvents ? JSON.parse(savedEvents).map(e => e.event_id) : [];
                    
                    const eventsWithSavedStatus = response.data.map(event => ({
                        ...event,
                        isSaved: savedEventIds.includes(event.event_id)
                    }));
                    
                    setEvents(eventsWithSavedStatus);
                    setTotalEvents(eventsWithSavedStatus.length);
                } else {
                    setError('Failed to fetch events data');
                }
            }
        } catch (err) {
            console.error('Error fetching events:', err.response);
            setError('Failed to fetch events data');
            Alert.alert('Error', 'Failed to fetch events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showEvents) {
            fetchEvents();
        }
    }, [showEvents, eventFilter]);

    const deleteEvent = async (eventId, eventTitle) => {
        try {
            await axios.delete(`https://backend-rt98.onrender.com/events/${eventId}`);
            await fetchEvents();
            const savedEvents = await AsyncStorage.getItem('savedEvents');
            if (savedEvents) {
                const updatedSavedEvents = JSON.parse(savedEvents).filter(e => e.event_id !== eventId);
                await AsyncStorage.setItem('savedEvents', JSON.stringify(updatedSavedEvents));
            }
            Alert.alert('Success', `Event "${eventTitle}" deleted successfully.`);
        } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'Failed to delete event. Please try again.');
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("https://backend-rt98.onrender.com/api/admin/report-details");
            if (response.data) {
                const savedReports = await AsyncStorage.getItem('savedReports');
                const savedReportIds = savedReports ? JSON.parse(savedReports).map(r => r.report_id) : [];
                
                const reportsWithSavedStatus = response.data.map(report => ({
                    ...report,
                    isSaved: savedReportIds.includes(report.report_id),
                    isLiked: report.likedBy && report.likedBy.includes('admin-id-here') // Replace with actual admin ID
                }));
                
                setReports(reportsWithSavedStatus);
                setTotalReports(reportsWithSavedStatus.length);
            } else {
                setError("Failed to fetch reports.");
            }
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("Failed to fetch reports.");
            Alert.alert('Error', 'Failed to fetch reports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showReports) {
            fetchReports();
        }
    }, [showReports]);

    const handleLikeReport = async (reportId, reporterId) => {  // Add reporterId as parameter
    try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (!userDataString) {
            Alert.alert("Error", "Please login to like reports");
            return;
        }

        const userData = JSON.parse(userDataString);
        
        const response = await axios.post(
            `https://backend-rt98.onrender.com/api/reports/${reportId}/like`,
            {
                reporterId: reporterId,  // Use the passed reporterId
                adminId: userData.userId   // ID of user liking the report
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}` // If using auth
                }
            }
        );

        if (response.data.success) {
            // Update UI
            setReports(prev => prev.map(r => 
                r._id === reportId 
                    ? { 
                        ...r, 
                        likes: response.data.likes, 
                        likedBy: [...(r.likedBy || []), userData.userId],
                        isLiked: true
                    }
                    : r
            ));
        }
    } catch (error) {
        console.error("Like error:", error.response?.data || error.message);
        
        if (error.response?.data?.error === 'You already liked this report') {
            Alert.alert("Info", "You've already liked this report");
        } else {
            Alert.alert("Error", error.response?.data?.error || "Failed to like report");
        }
    }
};

    const deleteReport = async (reportId) => {
        try {
            await axios.delete(`https://backend-rt98.onrender.com/api/reports/${reportId}`);
            await fetchReports();
            const savedReports = await AsyncStorage.getItem('savedReports');
            if (savedReports) {
                const updatedSavedReports = JSON.parse(savedReports).filter(r => r.report_id !== reportId);
                await AsyncStorage.setItem('savedReports', JSON.stringify(updatedSavedReports));
            }
            Alert.alert('Success', `Report deleted successfully.`);
        } catch (error) {
            console.error('Error deleting report:', error);
            Alert.alert('Error', 'Failed to delete report. Please try again.');
        }
    };

    const fetchSavedItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const [savedEvents, savedReports] = await Promise.all([
                AsyncStorage.getItem('savedEvents'),
                AsyncStorage.getItem('savedReports')
            ]);
            
            const events = savedEvents ? JSON.parse(savedEvents).map(e => ({ ...e, type: 'event' })) : [];
            const reports = savedReports ? JSON.parse(savedReports).map(r => ({ ...r, type: 'report' })) : [];
            
            setSavedItems([...events, ...reports]);
            setTotalSavedItems(events.length + reports.length);
        } catch (err) {
            console.error("Error fetching saved items:", err);
            setError("Failed to fetch saved items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showSaved) {
            fetchSavedItems();
        }
    }, [showSaved]);

    const deleteSavedItem = async (item) => {
        try {
            if (item.type === 'event') {
                const savedEvents = await AsyncStorage.getItem('savedEvents');
                if (savedEvents) {
                    const updatedEvents = JSON.parse(savedEvents).filter(e => e.event_id !== item.event_id);
                    await AsyncStorage.setItem('savedEvents', JSON.stringify(updatedEvents));
                }
            } else if (item.type === 'report') {
                const savedReports = await AsyncStorage.getItem('savedReports');
                if (savedReports) {
                    const updatedReports = JSON.parse(savedReports).filter(r => r.report_id !== item.report_id);
                    await AsyncStorage.setItem('savedReports', JSON.stringify(updatedReports));
                }
            }
            
            await fetchSavedItems();
            
            if (showEvents) fetchEvents();
            if (showReports) fetchReports();
            
            Alert.alert('Success', 'Item removed from saved');
        } catch (error) {
            console.error('Error deleting saved item:', error);
            Alert.alert('Error', 'Failed to remove saved item');
        }
    };

    const saveEvent = async (event) => {
        try {
            const isSaved = !event.isSaved;
            const updatedEvents = events.map(e => 
                e.event_id === event.event_id ? { ...e, isSaved } : e
            );
            setEvents(updatedEvents);
            
            const savedEvents = await AsyncStorage.getItem('savedEvents');
            let eventsArray = savedEvents ? JSON.parse(savedEvents) : [];
            
            if (isSaved) {
                eventsArray.push({
                    event_id: event.event_id,
                    event_name: event.event_name,
                    event_date: event.event_date,
                    location: event.location,
                    event_time: event.event_time
                });
            } else {
                eventsArray = eventsArray.filter(e => e.event_id !== event.event_id);
            }
            
            await AsyncStorage.setItem('savedEvents', JSON.stringify(eventsArray));
            
            if (showSaved) fetchSavedItems();
        } catch (error) {
            console.error('Error saving event:', error);
            Alert.alert('Error', 'Failed to save event');
        }
    };

    const saveReport = async (report) => {
        try {
            const isSaved = !report.isSaved;
            const updatedReports = reports.map(r => 
                r.report_id === report.report_id ? { ...r, isSaved } : r
            );
            setReports(updatedReports);
            
            const savedReports = await AsyncStorage.getItem('savedReports');
            let reportsArray = savedReports ? JSON.parse(savedReports) : [];
            
            if (isSaved) {
                reportsArray.push({
                    report_id: report.report_id,
                    full_name: report.full_name,
                    description: report.description,
                    timestamp: report.timestamp,
                    latitude: report.latitude,
                    longitude: report.longitude
                });
            } else {
                reportsArray = reportsArray.filter(r => r.report_id !== report.report_id);
            }
            
            await AsyncStorage.setItem('savedReports', JSON.stringify(reportsArray));
            
            if (showSaved) fetchSavedItems();
        } catch (error) {
            console.error('Error saving report:', error);
            Alert.alert('Error', 'Failed to save report');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={[
                    styles.container,
                    darkMode ? styles.darkContainer : styles.lightContainer,
                ]}
            >
                {/* Top Navigation Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={toggleDarkMode} style={styles.topBarItem}>
                        <Ionicons
                            name={darkMode ? "moon" : "sunny"}
                            size={24}
                            color={darkMode ? "#E5E7EB" : "#4A5568"}
                        />
                        <Text style={styles.topBarText}>
                            {darkMode ? "Dark Mode" : "Light Mode"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleSettings} style={styles.topBarItemRight}>
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color={darkMode ? "#E5E7EB" : "#A0AEC0"}
                        />
                        <Text style={styles.topBarText}>
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => console.log("Edit Profile")}
                        style={styles.profilePlaceholderContainer}
                    >
                        <Ionicons
                            name="person-circle"
                            size={80}
                            color={darkMode ? "#D1D5DB" : "#9CA3AF"}
                        />
                       
                    </TouchableOpacity>
                    <Text style={styles.userName}>
                        Admin User
                    </Text>
                    <Text style={styles.userRole}>
                        Administrator
                    </Text>
                </View>

                {/* Features Grid */}
               {/* Features Grid */}
<View style={styles.featuresGrid}>
    <TouchableOpacity
        style={[
            styles.featureItem,
            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
        ]}
        onPress={() => setShowEvents(!showEvents)}
    >
        <View style={styles.featureIconContainer}>
            <Ionicons name="calendar" size={28} color="#68D391" />
        </View>
        <Text style={styles.featureText}>
            Events
        </Text>
    </TouchableOpacity>

    <TouchableOpacity
        style={[
            styles.featureItem,
            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
        ]}
        onPress={() => setShowReports(!showReports)}
    >
        <View style={styles.featureIconContainer}>
            <Ionicons name="document-text" size={28} color="#4299E1" />
        </View>
        <Text style={styles.featureText}>
            Reports
        </Text>
    </TouchableOpacity>

    <TouchableOpacity
        style={[
            styles.featureItem,
            darkMode ? styles.darkFeatureItem : styles.lightFeatureItem,
        ]}
        onPress={() => setShowSaved(!showSaved)}
    >
        <View style={styles.featureIconContainer}>
            <Ionicons name="albums-outline" size={28} color="#ED8936" />
        </View>
        <Text style={styles.featureText}>
            Saved
        </Text>
    </TouchableOpacity>
</View>
            </ScrollView>

            {/* Events List */}
            {showEvents && (
                <View style={styles.eventsContainer}>
                    <View style={styles.eventsHeader}>
                        <Text style={styles.eventsTitle}>Events</Text>
                        <TouchableOpacity onPress={() => setShowEvents(false)} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#555" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text>Loading events...</Text>
                    ) : error ? (
                        <Text>Error: {error}</Text>
                    ) : (
                        <>
                            <View style={styles.summaryCards}>
                                <View style={[styles.summaryCard, styles.totalCard]}>
                                    <Text style={styles.summaryCount}>{totalEvents}</Text>
                                    <Text style={styles.summaryLabel}>Total Events</Text>
                                </View>
                            </View>

                            <View style={styles.filterAndSort}>
                                <View style={styles.filterContainer}>
                                    <Text style={styles.filterLabel}>Filter:</Text>
                                    <View style={styles.filterDisplay}>
                                        <Text style={styles.filterValue}>{eventFilter}</Text>
                                    </View>
                                    <Picker
                                        selectedValue={eventFilter}
                                        style={styles.filterPicker}
                                        onValueChange={(itemValue) => setEventFilter(itemValue)}
                                    >
                                        <Picker.Item label="All" value="All" />
                                        <Picker.Item label="Created Now" value="Created Now" />
                                    </Picker>
                                </View>
                            </View>

                            <ScrollView style={styles.eventsList}>
                                {events.map((event) => (
                                    <View key={event.event_id} style={styles.eventListItem}>
                                        <View style={styles.eventIcon}>
                                            <Ionicons name="calendar-outline" size={20} color="#fff" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.eventTitle}>{event.event_name}</Text>
                                            <Text style={styles.eventDate}>
                                                {event.event_date ? format(new Date(event.event_date), 'PPP') : 'N/A'}
                                                {event.event_time ? ` - ${event.event_time}` : ''}
                                            </Text>
                                            <Text style={styles.eventLocation}>{event.location}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => saveEvent(event)}>
                                            {event.isSaved ? (
                                                <View style={{ alignItems: 'center' }}>
                                                    <Ionicons name="checkmark-circle" size={24} color="#ED8936" />
                                                    <Text style={{ fontSize: 10, color: '#ED8936' }}>Saved</Text>
                                                </View>
                                            ) : (
                                                <Ionicons name="checkmark-circle-outline" size={24} color="#ED8936" />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Delete Event',
                                                    `Are you sure you want to delete the event "${event.event_name}"?`,
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Delete',
                                                            onPress: () => {
                                                                deleteEvent(event.event_id, event.event_name);
                                                            },
                                                            style: 'destructive',
                                                        },
                                                    ],
                                                    { cancelable: false }
                                                );
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}
                </View>
            )}

            {/* Reports List */}
            {showReports && (
                <View style={styles.eventsContainer}>
                    <View style={styles.eventsHeader}>
                        <Text style={styles.eventsTitle}>Reports</Text>
                        <TouchableOpacity onPress={() => setShowReports(false)} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#555" />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <Text>Loading reports...</Text>
                    ) : error ? (
                        <Text>Error: {error}</Text>
                    ) : (
                        <>
                            <View style={styles.summaryCards}>
                                <View style={[styles.summaryCard, styles.totalCard]}>
                                    <Text style={styles.summaryCount}>{totalReports}</Text>
                                    <Text style={styles.summaryLabel}>Total Reports</Text>
                                </View>
                            </View>
                            <ScrollView style={styles.eventsList}>
                                {reports.map((report) => (
                                    <View key={report.report_id} style={styles.eventListItem}>
                                        <View style={styles.eventIcon}>
                                            <Ionicons name="document-text" size={20} color="#fff" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.eventTitle}>Report ID: {report.report_id}</Text>
                                            <Text style={styles.eventDate}>User: {report.full_name || 'Unknown User'}</Text>
                                            <Text style={styles.eventLocation}>Location: {report.latitude}, {report.longitude}</Text>
                                            <Text style={styles.eventLocation}>Description: {report.description}</Text>
                                            <Text style={styles.eventDate}>
                                                Timestamp: {report.timestamp ? format(new Date(report.timestamp), 'PPPpp') : 'N/A'}
                                            </Text>
                                            {report.images && report.images.length > 0 && (
                                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                                    {report.images.map((image, index) => (
                                                        <Text key={index} style={{ marginRight: 5 }}>
                                                            Image {index + 1}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                        
                                        {/* Like Button */}
                                        <TouchableOpacity 
                                            onPress={() => handleLikeReport(report.report_id, report.userId)}
                                            style={styles.likeButton}
                                        >
                                            <Ionicons 
                                                name={report.isLiked ? "heart" : "heart-outline"} 
                                                size={24} 
                                                color={report.isLiked ? "#ff6b6b" : "#555"} 
                                            />
                                            <Text style={styles.likeCount}>{report.likes || 0}</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity onPress={() => saveReport(report)}>
                                            {report.isSaved ? (
                                                <View style={{ alignItems: 'center' }}>
                                                    <Ionicons name="checkmark-circle" size={24} color="#ED8936" />
                                                    <Text style={{ fontSize: 10, color: '#ED8936' }}>Saved</Text>
                                                </View>
                                            ) : (
                                                <Ionicons name="checkmark-circle-outline" size={24} color="#ED8936" />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => {
                                                Alert.alert(
                                                    'Delete Report',
                                                    `Are you sure you want to delete report ${report.report_id}?`,
                                                    [
                                                        { text: 'Cancel', style: 'cancel' },
                                                        {
                                                            text: 'Delete', onPress: () => {
                                                                deleteReport(report.report_id);
                                                            }, style: 'destructive'
                                                        },
                                                    ],
                                                    { cancelable: false }
                                                );
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}
                </View>
            )}

            {/* Saved Items */}
            {showSaved && (
                <View style={styles.eventsContainer}>
                    <View style={styles.eventsHeader}>
                        <Text style={styles.eventsTitle}>Saved Items</Text>
                        <TouchableOpacity onPress={() => setShowSaved(false)} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#555" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text>Loading...</Text>
                    ) : error ? (
                        <Text>Error: {error}</Text>
                    ) : (
                        <>
                            <View style={styles.summaryCards}>
                                <View style={[styles.summaryCard, styles.totalCard]}>
                                    <Text style={styles.summaryCount}>{totalSavedItems}</Text>
                                    <Text style={styles.summaryLabel}>Total Saved</Text>
                                </View>
                            </View>

                            <View style={styles.savedToggleContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.savedToggleButton,
                                        selectedSavedSection === 'events' && styles.savedToggleButtonActive
                                    ]}
                                    onPress={() => setSelectedSavedSection('events')}
                                >
                                    <Text style={[
                                        styles.savedToggleText,
                                        selectedSavedSection === 'events' && styles.savedToggleTextActive
                                    ]}>
                                        Events
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.savedToggleButton,
                                        selectedSavedSection === 'reports' && styles.savedToggleButtonActive
                                    ]}
                                    onPress={() => setSelectedSavedSection('reports')}
                                >
                                    <Text style={[
                                        styles.savedToggleText,
                                        selectedSavedSection === 'reports' && styles.savedToggleTextActive
                                    ]}>
                                        Reports
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.eventsList}>
                                {selectedSavedSection === 'events' ? (
                                    savedItems.filter(item => item.type === 'event').length > 0 ? (
                                        savedItems.filter(item => item.type === 'event').map(item => (
                                            <View key={`event_${item.event_id}`} style={styles.eventListItem}>
                                                <View style={styles.eventIcon}>
                                                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.eventTitle}>{item.event_name}</Text>
                                                    <Text style={styles.eventDate}>
                                                        {item.event_date ? format(new Date(item.event_date), 'PPP') : 'N/A'}
                                                        {item.event_time && ` • ${item.event_time}`}
                                                    </Text>
                                                    <Text style={styles.eventLocation}>{item.location}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => deleteSavedItem(item)}>
                                                    <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noItemsText}>No saved events found</Text>
                                    )
                                ) : (
                                    savedItems.filter(item => item.type === 'report').length > 0 ? (
                                        savedItems.filter(item => item.type === 'report').map(item => (
                                            <View key={`report_${item.report_id}`} style={styles.eventListItem}>
                                                <View style={styles.eventIcon}>
                                                    <Ionicons name="document-text" size={20} color="#fff" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.eventTitle}>Report #{item.report_id}</Text>
                                                    <Text style={styles.eventDate}>
                                                        {item.timestamp ? format(new Date(item.timestamp), 'PPPpp') : 'N/A'}
                                                    </Text>
                                                    <Text style={styles.eventLocation}>By: {item.full_name || 'Unknown'}</Text>
                                                    <Text style={styles.eventDescription}>{item.description}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => deleteSavedItem(item)}>
                                                    <Ionicons name="trash-outline" size={24} color="#dc3545" />
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noItemsText}>No saved reports found</Text>
                                    )
                                )}
                            </ScrollView>
                        </>
                    )}
                </View>
            )}

            {/* Settings Modal */}
            {settingsVisible && (
                <View style={styles.settingsOverlay}>
                    <View
                        style={[
                            styles.settingsContainer,
                            darkMode ? styles.darkSettingsContainer : styles.lightSettingsContainer,
                        ]}
                    >
                        <TouchableOpacity onPress={toggleSettings} style={styles.settingsCloseButton}>
                            <Ionicons
                                name="close-outline"
                                size={32}
                                color={darkMode ? "#F7FAFC" : "#1A202C"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.settingsItem}>
                            <Ionicons
                                name="log-out-outline"
                                size={22}
                                color={darkMode ? "#E5E7EB" : "#4A5568"}
                                style={styles.settingsIcon}
                            />
                            <Text style={styles.settingsText}>
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    darkContainer: {
        backgroundColor: '#1A202C',
    },
    lightContainer: {
        backgroundColor: '#F7FAFC',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    topBarItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topBarItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topBarText: {
        marginLeft: 8,
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profilePlaceholderContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3182CE',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userRole: {
        fontSize: 30,
        color: '#718096',
    },
    featuresGrid: {
        width: '100%',
        marginBottom: 20,
    },
    featureItem: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    centeredFeatureItem: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    featureItemSpacer: {
        width: '48%',
    },
    darkFeatureItem: {
        backgroundColor: '#2D3748',
    },
    lightFeatureItem: {
        backgroundColor: '#EDF2F7',
    },
    featureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    featureText: {
        fontSize: 25,
        fontWeight: '500',
    },
    eventsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        padding: 20,
        zIndex: 10,
    },
    eventsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    eventsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    summaryCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    totalCard: {
        backgroundColor: '#F0FFF4',  // Light green
        borderLeftWidth: 4,
        borderLeftColor: '#38A169'  // Accent green border
    },
    summaryCount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#4A5568',
    },
    filterAndSort: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        marginRight: 10,
        fontSize: 16,
    },
    filterDisplay: {
        borderWidth: 1,
        borderColor: '#CBD5E0',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 10,
    },
    filterValue: {
        fontSize: 16,
    },
    filterPicker: {
        width: 150,
        height: 50,
    },
    eventsList: {
        flex: 1,
    },
    eventListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        backgroundColor: '#EDF2F7',
        borderRadius: 10,
    },
    eventIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4299E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    eventDate: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 3,
    },
    eventLocation: {
        fontSize: 14,
        color: '#718096',
    },
    deleteButton: {
        marginLeft: 10,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        padding: 5,
    },
    likeCount: {
        marginLeft: 5,
        fontSize: 14,
        color: '#555',
    },
    settingsOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    settingsContainer: {
        width: '80%',
        borderRadius: 10,
        padding: 20,
    },
    darkSettingsContainer: {
        backgroundColor: '#2D3748',
    },
    lightSettingsContainer: {
        backgroundColor: 'white',
    },
    settingsCloseButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    settingsIcon: {
        marginRight: 15,
    },
    settingsText: {
        fontSize: 18,
    },
    savedToggleContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingVertical: 10,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CBD5E0',
        backgroundColor: '#fff',
    },
    savedToggleButton: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: 'center',
        backgroundColor: '#EDF2F7',
        borderRadius: 5,
        marginHorizontal: 20,
        marginRight: 10,
    },
    savedToggleButtonActive: {
        backgroundColor: '#3182CE',
    },
    savedToggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4A5568',
    },
    savedToggleTextActive: {
        color: 'white',
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#718096',
        fontSize: 16,
    },
    eventDescription: {
        fontSize: 14,
        color: '#718096',
        marginTop: 3,
    },
});

export default AdminProfile;