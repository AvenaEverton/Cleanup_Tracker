import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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

  const fetchUsersData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching users with filter:', filter);
      const response = await axios.get(`http://192.168.1.23:5000/api/admin/users?filter=${filter}`);
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

  useEffect(() => {
    fetchUsersData();
  }, [filter]);

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      await axios.post(`http://192.168.1.23:5000/api/admin/users/${userId}/status`, { status: newStatus });
      fetchUsersData();
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status.');
    }
  };

  const handleOptionsPress = (user) => {
    const options = user.status === 'Approved' ? ['Restrict'] : ['Approve', 'Reject'];
    Alert.alert(
      'Options',
      `Select an option for ${user.username}`,
      options.map((option) => ({
        text: option,
        onPress: () => {
          if (option === 'Approve') {
            handleStatusUpdate(user.user_id, 'Approved');
          } else if (option === 'Reject') {
            handleStatusUpdate(user.user_id, 'Restricted');
          } else if (option === 'Restrict') {
            handleStatusUpdate(user.user_id, 'Restricted');
          }
        },
      })),
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Fetching Users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.controlPanel}>
        <Text style={styles.panelTitle}>User Management</Text>
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.approvedCard]}>
            <Text style={styles.summaryCount}>{approvedCount}</Text>
            <Text style={styles.summaryLabel}>Approved</Text>
          </View>
          <View style={[styles.summaryCard, styles.pendingCard]}>
            <Text style={styles.summaryCount}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
          <View style={[styles.summaryCard, styles.restrictedCard]}>
            <Text style={styles.summaryCount}>{restrictedCount}</Text>
            <Text style={styles.summaryLabel}>Restricted</Text>
          </View>
          <View style={[styles.summaryCard, styles.totalCard]}>
            <Text style={styles.summaryCount}>{totalUsers}</Text>
            <Text style={styles.summaryLabel}>Total Users</Text>
          </View>
        </View>

        <View style={styles.filterAndSort}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter:</Text>
            <View style={styles.filterDisplay}>
              <Text style={styles.filterValue}>{filter}</Text>
            </View>
            <Picker
              selectedValue={filter}
              style={styles.filterPicker}
              onValueChange={(itemValue) => setFilter(itemValue)}
            >
              <Picker.Item label="All" value="All" />
              <Picker.Item label="Approved" value="Approved" />
              <Picker.Item label="Pending" value="Pending" />
              <Picker.Item label="Restricted" value="Restricted" />
            </Picker>
          </View>
          {/* <Text style={styles.sortText}>Sort by: Date</Text> */}
        </View>

        <ScrollView style={styles.userList}>
          {users.map((user) => (
            <View key={user.user_id} style={[styles.userListItem, styles[`userItem_${user.status.toLowerCase()}`]]}>
              <View style={styles.statusIndicator} />
              <View style={styles.userIcon}>
                <Ionicons name="person-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.username}>{user.username}</Text>
              <View style={[
                styles.statusBadge,
                user.status === 'Approved' && styles.approvedBadge,
                user.status === 'Pending' && styles.pendingBadge,
                user.status === 'Restricted' && styles.restrictedBadge,
              ]}>
                <Text style={styles.statusText}>{user.status}</Text>
              </View>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => handleOptionsPress(user)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#555" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  controlPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap', // Added for better responsiveness
  },
  summaryCard: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    minWidth: 100, // Increased minWidth for label visibility
    marginBottom: 10, // Added marginBottom for spacing in wrapped layout
  },
  approvedCard: {
    backgroundColor: '#d1e7dd',
  },
  pendingCard: {
    backgroundColor: '#fff3cd',
  },
  restrictedCard: {
    backgroundColor: '#f8d7da',
  },
  totalCard: {
    backgroundColor: '#cfe2ff',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  filterAndSort: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  filterDisplay: {
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  filterValue: {
    fontSize: 16,
    color: '#333',
  },
  filterPicker: {
    height: 40,
    width: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  sortText: {
    fontSize: 16,
    color: '#333',
  },
  userList: {
    maxHeight: 350,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 5,
    height: '100%',
    borderRadius: 2.5,
    marginRight: 10,
  },
  userItem_approved: {
    borderColor: '#28a745',
    borderLeftWidth: 5,
  },
  userItem_pending: {
    borderColor: '#ffc107',
    borderLeftWidth: 5,
  },
  userItem_restricted: {
    borderColor: '#dc3545',
    borderLeftWidth: 5,
  },
  userIcon: {
    backgroundColor: '#6c757d',
    borderRadius: 15,
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statusBadge: {
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  approvedBadge: {
    backgroundColor: '#28a745',
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
  },
  restrictedBadge: {
    backgroundColor: '#dc3545',
  },
  optionsButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default AdminUsers;
