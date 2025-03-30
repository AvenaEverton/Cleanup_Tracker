import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo Icons

const AdminUsers = () => {
  // Dummy data for users (replace with your actual data fetching)
  const users = [
    { id: 1, username: 'User1', status: 'Approved' },
    { id: 2, username: 'User2', status: 'Pending' },
    { id: 3, username: 'User3', status: 'Restricted' },
    { id: 4, username: 'User4', status: 'Approved' },
    { id: 5, username: 'User5', status: 'Pending' },
    { id: 6, username: 'User6', status: 'Restricted' },
    { id: 7, username: 'User7', status: 'Approved' },
    { id: 8, username: 'User8', status: 'Pending' },
  ];

  // Dummy data for counts (replace with your actual data fetching)
  const approvedCount = 100;
  const pendingCount = 100;
  const restrictedCount = 100;
  const totalUsers = 300; // Calculated from the above counts

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello Admin! "Username"</Text>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.controlCenter}>
        <Text style={styles.controlCenterTitle}>User Control Center</Text>
        <View style={styles.filterBar}>
          <Text style={styles.filterText}>Filter: All</Text>
          <Text style={styles.sortText}>Sort by: Date</Text>
        </View>

        <ScrollView style={styles.userList}>
          {users.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userIcon}>
                <Ionicons name="people-outline" size={24} color="black" />
              </View>
              <Text style={styles.username}>{user.username}</Text>
              <TouchableOpacity style={styles.optionsIcon}>
                <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Approved accounts: {approvedCount}</Text>
          <Text style={styles.summaryText}>Pending accounts: {pendingCount}</Text>
          <Text style={styles.summaryText}>Restricted accounts: {restrictedCount}</Text>
          <Text style={styles.totalUsersText}>Total users: {totalUsers}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Light background
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIcon: {
    padding: 5,
  },
  controlCenter: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  controlCenterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterText: {
    fontSize: 14,
  },
  sortText: {
    fontSize: 14,
  },
  userList: {
    maxHeight: 300, // Adjust as needed
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userIcon: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  username: {
    flex: 1,
    fontSize: 16,
  },
  optionsIcon: {
    padding: 5,
  },
  summary: {
    marginTop: 15,
  },
  summaryText: {
    fontSize: 14,
  },
  totalUsersText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default AdminUsers;