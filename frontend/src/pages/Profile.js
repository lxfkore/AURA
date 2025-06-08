import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuBar from '../components/MenuBar';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function Profile({ navigation }) {
  const [pregnancyStatusId, setPregnancyStatusId] = useState(null);
  const [pregnancyOptions, setPregnancyOptions] = useState([
    { id: 1, status: 'yes' },
    { id: 2, status: 'no' }
  ]);
  const [email, setEmail] = useState('');  // New state for email
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch current user data from backend
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('Retrieved userId from AsyncStorage:', userId);
        if (!userId) return;
        const response = await fetch(`http://192.168.0.102:5000/api/users/${userId}`);
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        setPregnancyStatusId(userData.pregnancy_status_id || 2);
        setEmail(userData.email || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const updatePregnancyStatus = async (newStatusId) => {
  try {
    console.log('Updating pregnancy status to:', newStatusId);
    setPregnancyStatusId(newStatusId); // Update local state
    const userId = await AsyncStorage.getItem('userId'); // Get stored user ID
    console.log('User ID from AsyncStorage:', userId);
    if (!userId) return;

    // Send PUT request to update the backend
    const response = await fetch(`http://192.168.0.102:5000/api/users/${userId}/pregnancy-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregnancy_status_id: newStatusId }), // Send the new status ID
    });

    console.log('Response status:', response.status);
    if (!response.ok) throw new Error('Failed to update pregnancy status');
    Alert.alert('Success', 'Pregnancy status updated successfully'); // Optional: Show success message
  } catch (error) {
    console.error('Error updating pregnancy status:', error);
    Alert.alert('Error', 'Failed to update pregnancy status. Please try again.');
  }
};

  return (
    <View style={styles.container}>
      {/* Hamburger Icon */}
      <TouchableOpacity
        onPress={() => setMenuVisible(!menuVisible)}
        onLayout={(event) => {
          const { x, y } = event.nativeEvent.layout;
          setMenuButtonPosition({ x, y });
        }}
      >
        <FontAwesome name="bars" size={24} color="white" />
      </TouchableOpacity>

      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={menuButtonPosition}
          navigation={navigation}
        />
      )}

      {/* Profile Circle */}
      <View style={styles.profileCircle}>
        <Ionicons name="person" size={50} color="#fff" />
      </View>

      {/* Email Text */}
      <Text style={styles.email}>{email || 'Loading email...'}</Text>

      {/* Pregnancy Status Section */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Pregnancy Status:</Text>
        <View style={styles.switchBox}>
          <Switch
            value={pregnancyStatusId === 1} // Check if status is "yes" (id=1)
            onValueChange={(value) => updatePregnancyStatus(value ? 1 : 2)} // Toggle between 1 and 2
            trackColor={{ false: '#444', true: '#FF5C8D' }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }}
          />
          <Text style={styles.switchText}>
            {pregnancyStatusId === 1 ? 'pregnant' : 'not pregnant'}
          </Text>
        </View>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuBox}>
        <MenuItem title="Send Notifications" />
        <MenuItem
          title="Apply for business account"
          onPress={() => setShowBusinessModal(true)}
        />
        <MenuItem
          title="Delete my account"
          onPress={() => setShowDeleteModal(true)}
        />
        <MenuItem
          title="Log Out >"
          onPress={() => setShowLogoutModal(true)}
          textStyle={styles.logoutText}
        />
      </View>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons
              name="log-out-outline"
              size={40}
              color="#000"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    await AsyncStorage.clear();
                    setShowLogoutModal(false);
                    navigation.replace('Startup');
                  } catch (error) {
                    console.error('Error during logout:', error);
                    alert('Failed to log out. Please try again.');
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Business Inquiry Modal */}
      <Modal visible={showBusinessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              For business inquiries, please email us at{'\n'}
              aurapp2025@gmail.com
            </Text>
            <TouchableOpacity
              onPress={() => setShowBusinessModal(false)}
              style={styles.modalSingleButton}>
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons
              name="alert-circle"
              size={40}
              color="#000"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalText}>
              Are you sure that you want to delete this account?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    // Assuming user_id is 1 for demo, replace with actual user id
                    const response = await fetch('http://192.168.0.102:5000/api/users/1', {
                      method: 'DELETE',
                    });
                    if (response.ok) {
                      // Successfully deleted user, handle logout or redirect
                      alert('Account deleted successfully.');
                      // Redirect to login or home screen
                      // navigation.navigate('Login'); // Uncomment if navigation is available here
                    } else {
                      alert('Failed to delete account.');
                    }
                  } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('Error deleting account.');
                  }
                  setShowDeleteModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <View style={styles.modalDivider} />
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalButton}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const MenuItem = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  menuIcon: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  profileCircle: {
    alignSelf: 'center',
    backgroundColor: '#FF5C8D',
    width: 70,
    height: 70,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  email: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  switchContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  switchBox: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 200,
  },
  switchText: {
    color: '#fff',
    marginLeft: -5,
    textTransform: 'lowercase',
    fontSize: 17,
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 17,
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  modalSingleButton: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    color: '#000',
    marginTop: 5, // ⬅️ Add this line to lower the entire button section
  },
  modalDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#ccc',
    marginVertical: 8,
  },  
});
