// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import { Picker } from '@react-native-picker/picker';

// const AdminUsers = () => {
//   const [users, setUsers] = useState([]);
//   const [approvedCount, setApprovedCount] = useState(0);
//   const [pendingCount, setPendingCount] = useState(0);
//   const [restrictedCount, setRestrictedCount] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('All');

//   useEffect(() => {
//     const fetchUsersData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         console.log('Fetching users with filter:', filter);
//         const response = await axios.get(`http://192.168.1.17:5000/api/admin/users?filter=${filter}`);
//         console.log('API Response:', response.data);

//         if (response.data) {
//           setUsers(response.data.users);
//           setApprovedCount(response.data.approvedCount);
//           setPendingCount(response.data.pendingCount);
//           setRestrictedCount(response.data.restrictedCount);
//           setTotalUsers(response.data.totalUsers);
//         } else {
//           setError('Failed to fetch user data');
//         }
//       } catch (err) {
//         console.error('Error fetching user data:', err.response); // Added err.response
//         setError('Failed to fetch user data');
//         Alert.alert('Error', 'Failed to fetch user data. Please try again.');
//       } finally {
//         setLoading(false);
//         console.log('Loading state set to false');
//       }
//     };

//     fetchUsersData();
//   }, [filter]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text>Loading users...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Error: {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Hello Admin! "Username"</Text>
//         <TouchableOpacity style={styles.profileIcon}>
//           <Ionicons name="person-circle-outline" size={32} color="black" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.controlCenter}>
//         <Text style={styles.controlCenterTitle}>User Control Center</Text>
//         <View style={styles.filterBar}>
//           <Picker
//             selectedValue={filter}
//             style={{ height: 50, width: 150 }}
//             onValueChange={(itemValue) => setFilter(itemValue)}
//           >
//             <Picker.Item label="All" value="All" />
//             <Picker.Item label="Approved" value="Approved" />
//             <Picker.Item label="Pending" value="Pending" />
//             <Picker.Item label="Restricted" value="Restricted" />
//           </Picker>
//           <Text style={styles.sortText}>Sort by: Date</Text>
//         </View>

//         <ScrollView style={styles.userList}>
//           {users.map((user) => (
//             <View key={user.user_id} style={styles.userItem}>
//               <View style={styles.userIcon}>
//                 <Ionicons name="people-outline" size={24} color="black" />
//               </View>
//               <Text style={styles.username}>{user.username}</Text>
//               <TouchableOpacity style={styles.optionsIcon}>
//                 <Ionicons name="ellipsis-vertical-outline" size={24} color="black" />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </ScrollView>

//         <View style={styles.summary}>
//           <Text style={styles.summaryText}>Approved accounts: {approvedCount}</Text>
//           <Text style={styles.summaryText}>Pending accounts: {pendingCount}</Text>
//           <Text style={styles.summaryText}>Restricted accounts: {restrictedCount}</Text>
//           <Text style={styles.totalUsersText}>Total users: {totalUsers}</Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//     padding: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   profileIcon: {
//     padding: 5,
//   },
//   controlCenter: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 15,
//   },
//   controlCenterTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   filterBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//     alignItems: 'center',
//   },
//   filterText: {
//     fontSize: 14,
//   },
//   sortText: {
//     fontSize: 14,
//   },
//   userList: {
//     maxHeight: 300,
//   },
//   userItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   userIcon: {
//     backgroundColor: '#e0e0e0',
//     borderRadius: 20,
//     padding: 8,
//     marginRight: 10,
//   },
//   username: {
//     flex: 1,
//     fontSize: 16,
//   },
//   optionsIcon: {
//     padding: 5,
//   },
//   summary: {
//     marginTop: 15,
//   },
//   summaryText: {
//     fontSize: 14,
//   },
//   totalUsersText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     color: 'red',
//   },
// });

// export default AdminUsers;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

// Define the base URL, preferably from a config file or environment variable
const API_BASE_URL = 'http://192.168.1.17:5000'; // Replace with your actual API base URL

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
      const response = await axios.get(`${API_BASE_URL}/api/admin/users?filter=${filter}`);
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

  const handleOptionsPress = async (user) => {
    const updateUserStatus = async (newStatus) => { //extracted the status update logic
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/admin/users/${user.user_id}`,
          { status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } // First letter uppercase
        );
        console.log(`User ${user.user_id} status updated to ${newStatus}`);
        fetchUsersData(); // Refresh user list
        Alert.alert(
          "Success",
          `User ${user.username} has been ${newStatus}.`
        );
      } catch (error) {
        let errorMessage = "Failed to update user status.";  //Default Error Message
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += ` Server responded with status code ${error.response.status}.`;
          if (error.response.data && error.response.data.error) {
            errorMessage += ` Error from server: ${error.response.data.error}`; //append the error
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += " No response received from the server.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage += ` Error setting up the request: ${error.message}`;
        }
        console.error(errorMessage);
        Alert.alert("Error", errorMessage); //show user the error
      }
    };
  
    if (user.status === 'pending') {
      Alert.alert(
        'Users Approval',
        `for ${user.username}?`,
        [
          { text: 'Accept', onPress: () => updateUserStatus('approved') },
          { text: 'Reject', onPress: () => updateUserStatus('rejected') },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('No Actions Available', `No actions can be taken for ${user.username} with status: ${user.status}`);
      console.log(`Options not available for user ${user.username} with status: ${user.status}`);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading users...</Text>
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello Admin! "Username"</Text>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.controlCenter}>
        <Text style={styles.controlCenterTitle}>User Control Center</Text>
        <View style={styles.filterBar}>
          <Picker
            selectedValue={filter}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setFilter(itemValue)}
          >
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Approved" value="Approved" />
            <Picker.Item label="Pending" value="Pending" />
            <Picker.Item label="Restricted" value="Restricted" />
          </Picker>
          <Text style={styles.sortText}>Sort by: Date</Text>
        </View>

        <ScrollView style={styles.userList}>
          {users.map((user) => (
            <View key={user.user_id} style={styles.userItem}>
              <View style={styles.userIcon}>
                <Ionicons name="people-outline" size={24} color="black" />
              </View>
              <Text style={styles.username}>{user.username}</Text>
              <TouchableOpacity
                style={styles.optionsIcon}
                onPress={() => handleOptionsPress(user)}
                disabled={user.status !== 'pending'}
              >
                <Ionicons
                  name="ellipsis-vertical-outline"
                  size={24}
                  color={user.status === 'Pending' ? 'black' : 'gray'}
                />
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
    backgroundColor: '#f0f0f0',
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
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
  },
  sortText: {
    fontSize: 14,
  },
  userList: {
    maxHeight: 300,
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
});

export default AdminUsers;

