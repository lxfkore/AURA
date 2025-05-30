import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const [isPregnant, setIsPregnant] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSwitch = () => setIsPregnant(previousState => !previousState);

  return (
    <View style={styles.container}>
      {/* Hamburger Icon */}
      <Ionicons name="menu" size={28} color="#fff" style={styles.menuIcon} />

      {/* Profile Circle */}
      <View style={styles.profileCircle}>
        <Ionicons name="person" size={50} color="#fff" />
      </View>

      {/* Email Text */}
      <Text style={styles.email}>liewhewthong@gmail.com</Text>

      {/* Switch Mode Section */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Switch Mode:</Text>
        <View style={styles.switchBox}>
          <Switch
            value={isPregnant}
            onValueChange={toggleSwitch}
            trackColor={{ false: '#444', true: '#FF5C8D' }}
            thumbColor="#fff"
            style={{ transform: [{ scaleX: 1.4 }, { scaleY: 1.4 }] }}
          />
          <Text style={styles.switchText}>
            {isPregnant ? 'pregnant' : 'not pregnant'}
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
      </View>

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
            <TouchableOpacity style={styles.modalButton}>
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

function MenuItem({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#000" />
    </TouchableOpacity>
  );
}

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
