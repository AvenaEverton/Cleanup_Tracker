import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [restrictedCount, setRestrictedCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const sortOptions = ['Date', 'Username', 'Status'];

  useEffect(() => {
    const fetchUsersData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching users with filter:', filter, 'Sort by:', sortBy);
        const response = await axios.get(
          `http://192.168.1.19:5000/api/admin/users?filter=${filter}&sortBy=${sortBy}`
        );
        console.log('API Response:', response.data);

        if (response.data) {
          setUsers(response.data.users);
          setApprovedCount(response.data.approvedCount);
          setPendingCount(response.data.pendingCount);
          setRestrictedCount(response.data.restrictedCount);
          setTotalUsers(response.data.totalUsers);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err.response);
        setError('Failed to fetch user data');
        Alert.alert('Error', 'Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    };

    fetchUsersData();
  }, [filter, sortBy]);

  if (loading) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.loadingContainer}>
          <Text>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getUserItemStyle = (status) => {
    switch (status) {
      case 'Approved':
        return styles.approvedUserContent;
      case 'Pending':
        return styles.pendingUserContent;
      case 'Restricted':
        return styles.restrictedUserContent;
      default:
        return styles.allUserContent; // Apply a default style for "All" or any other status
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={[styles.userItem, getUserItemStyle(item.status)]}>
      <View style={styles.userIcon}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person-outline" size={24} color="#333" />
        </View>
      </View>
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity style={styles.optionsIcon}>
        <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  const getSummaryContainerStyle = (status) => {
    const baseStyle = {
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginLeft: 10,
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    };
    switch (status) {
      case 'Approved':
        return { ...baseStyle, backgroundColor: '#d4edda' };
      case 'Pending':
        return { ...baseStyle, backgroundColor: '#e7f3ff' };
      case 'Restricted':
        return { ...baseStyle, backgroundColor: '#f8d7da' };
      default:
        return baseStyle;
    }
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Hello Admin! "Username"</Text>
          <TouchableOpacity style={styles.profileIcon}>
            <Ionicons name="person-circle-outline" size={32} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.controlCenter}>
          <Text style={styles.controlCenterTitle}>User Control Center</Text>
          <View style={styles.filterSortBar}>
            <View style={styles.filterContainer}>
              <View style={styles.filterInfo}>
                <Text style={styles.filterLabel}>Filter:</Text>
                <Text style={styles.filterValue}>{filter}</Text>
              </View>
              <Picker
                selectedValue={filter}
                style={styles.filterPicker}
                onValueChange={(itemValue) => setFilter(itemValue)}
                dropdownIconColor="black"
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Approved" value="Approved" />
                <Picker.Item label="Pending" value="Pending" />
                <Picker.Item label="Restricted" value="Restricted" />
              </Picker>
            </View>
            <View style={styles.sortContainer}>
              <View style={styles.sortInfo}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <Text style={styles.sortValue}>{sortBy}</Text>
              </View>
              <Picker
                selectedValue={sortBy}
                style={styles.sortPicker}
                onValueChange={(itemValue) => setSortBy(itemValue)}
                dropdownIconColor="black"
              >
                {sortOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.userListContainer}>
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.user_id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.userListContent}
            />
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Approved accounts:</Text>
              <View style={[styles.summaryCountBox, getSummaryContainerStyle('Approved')]}>
                <Text style={styles.summaryValue}>{approvedCount}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pending accounts:</Text>
              <View style={[styles.summaryCountBox, getSummaryContainerStyle('Pending')]}>
                <Text style={styles.summaryValue}>{pendingCount}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Restricted accounts:</Text>
              <View style={[styles.summaryCountBox, getSummaryContainerStyle('Restricted')]}>
                <Text style={styles.summaryValue}>{restrictedCount}</Text>
              </View>
            </View>
            <View style={styles.totalUsersContainer}>
              <Text style={styles.totalUsersLabel}>Total users:</Text>
              <View style={styles.totalUsersBox}>
                <Text style={styles.totalUsersValue}>{totalUsers}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileIcon: {
    padding: 5,
  },
  controlCenter: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flex: 1,
    flexDirection: 'column',
  },
  controlCenterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterSortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  filterLabel: {
    fontSize: 14,
    marginRight: 5,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
    minWidth: 120,
    position: 'relative', // Added position relative
  },
  filterPicker: {
    height: 40,
    position: 'absolute',  // Added position absolute
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0, // Make it invisible
  },
  sortInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 5,
  },
  sortValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sortContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    width: 120,
    position: 'relative', // Added
  },
  sortPicker: {
    height: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  userListContainer: {
    flex: 1,
  },
  userListContent: {
    paddingBottom: 10,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  userItem: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  userIcon: {
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    textAlign: 'center',
  },
  optionsIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  summary: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    marginBottom: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalUsersContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalUsersLabel: {
    fontSize: 14,
  },
  totalUsersBox: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  totalUsersValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  summaryCountBox: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedSummaryContainer: {
    backgroundColor: '#d4edda',
  },
  pendingSummaryContainer: {
    backgroundColor: '#e7f3ff',
  },
  restrictedSummaryContainer: {
    backgroundColor: '#f8d7da',
  },
  approvedUserContent: {
    backgroundColor: '#d4edda',
  },
  pendingUserContent: {
    backgroundColor: '#e7f3ff',
  },
  restrictedUserContent: {
    backgroundColor: '#f8d7da',
  },
  allUserContent: {
    backgroundColor: '#e0e0e0',
  },
});

export default AdminUsers;
