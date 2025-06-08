import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import MenuBar from "../components/MenuBar";

const Pill = ({ navigation, route }) => {
  const { getIntakeStatusId } = route.params || {};
  const [fontsLoaded] = useFonts({ "OpenSans-Bold": OpenSans_700Bold });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

  const [pillForms, setPillForms] = useState([
    {
      id: null,
      pillName: "",
      intake: "1",
      description: "",
      prescribedDateInput: "",
      prescribedDate: new Date(),
      dateError: false,
    },
  ]);

  if (!fontsLoaded) return null;

  const handleDateInput = (text, index) => {
    const updatedForms = [...pillForms];
    updatedForms[index].prescribedDateInput = text;

    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(text);
    if (isValid) {
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) {
        updatedForms[index].prescribedDate = parsed;
        updatedForms[index].dateError = false;
        setPillForms(updatedForms);
        return;
      }
    }
    updatedForms[index].dateError = true;
    setPillForms(updatedForms);
  };

  const addPillForm = () => {
    if (pillForms.length >= 10) {
      Alert.alert("Limit Reached", "You can only add up to 10 pill records.");
      return;
    }

    setPillForms([
      ...pillForms,
      {
        id: null,
        pillName: "",
        intake: "1",
        description: "",
        prescribedDateInput: "",
        prescribedDate: new Date(),
        dateError: false,
      },
    ]);
  };

  const updateField = (index, field, value) => {
    const updatedForms = [...pillForms];
    updatedForms[index][field] = value;
    setPillForms(updatedForms);
  };

const handleDeletePill = async (index) => {
    const pillToDelete = pillForms[index];
    if (pillToDelete.id === null) {
      // Just remove from UI if not saved yet
      const updatedForms = pillForms.filter((_, i) => i !== index);
      setPillForms(updatedForms);
      return;
    }
    try {
      const response = await fetch(`http://192.168.0.102:5000/api/pills/${pillToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete pill');
      }
      const updatedForms = pillForms.filter((_, i) => i !== index);
      setPillForms(updatedForms);
    } catch (error) {
      alert('Error deleting pill: ' + error.message);
    }
  };

  const handleSave = async () => {
    // Validate all forms
    for (let i = 0; i < pillForms.length; i++) {
      const pill = pillForms[i];
      if (!pill.pillName.trim()) {
        alert(`Pill name is required for entry ${i + 1}`);
        return;
      }
      if (!pill.intake || isNaN(pill.intake) || Number(pill.intake) <= 0) {
        alert(`Valid intake number is required for entry ${i + 1}`);
        return;
      }
      if (pill.dateError) {
        alert(`Please fix the date for entry ${i + 1}`);
        return;
      }
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        alert('User not logged in');
        return;
      }
      
      for (const pill of pillForms) {
      const pillStatus = 'defaultStatus';
      if (typeof getIntakeStatusId !== 'function') {
        alert('getIntakeStatusId is not a valid function');
        return;
      }
      const payload = {
        user_id: userId,
        pillName: pill.pillName,
        intake: Number(pill.intake),
        description: pill.description,
        prescribedDate: pill.prescribedDateInput,
        intake_status_id: getIntakeStatusId(pillStatus), 
      };
        
        let response;
        if (pill.id) {
          // Update existing pill
          response = await fetch(`http://192.168.0.102:5000/api/pills/${pill.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Create new pill
          response = await fetch('http://192.168.0.102:5000/api/pills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
        
        if (!response.ok) {
          throw new Error('Failed to save pill');
        }
        
        const data = await response.json();
        // Update local state with new ID for future updates
        if (data.id) {
          const updatedForms = pillForms.map(p => 
            p.id === pill.id ? { ...p, id: data.id } : p
          );
          setPillForms(updatedForms);
        }
      }
      
      alert('Pill information saved successfully!');
      fetchPills();
    } catch (error) {
      alert('Error saving pills: ' + error.message);
    }
  };

  const fetchPills = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // No user logged in, set default empty form
        setPillForms([{
          id: null,
          pillName: "",
          intake: "1",
          description: "",
          prescribedDateInput: "",
          prescribedDate: new Date(),
          dateError: false,
        }]);
        return;
      }
      // Fetch pills for the user
      const response = await fetch(`http://192.168.0.102:5000/api/pills/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch pills');
      const data = await response.json();
      if (data.length === 0) {
        // No pills recorded, set default empty form
        setPillForms([{
          id: null,
          pillName: "",
          intake: "1",
          description: "",
          prescribedDateInput: "",
          prescribedDate: new Date(),
          dateError: false,
        }]);
      } else {
        // Map data to pillForms format
        const mapped = data.map(pill => ({
          id: pill.id,
          pillName: pill.name,
          intake: pill.intake_no.toString(),
          description: pill.description,
          prescribedDateInput: pill.date_prescribed,
          prescribedDate: new Date(pill.date_prescribed),
          dateError: false,
        }));
        setPillForms(mapped);
      }
    } catch (error) {
      alert('Error fetching pills: ' + error.message);
    }
  };

  React.useEffect(() => {
    fetchPills();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMenuVisible(!menuVisible)}
          onLayout={(event) => {
            const { x, y } = event.nativeEvent.layout;
            setMenuButtonPosition({ x, y });
          }}
        >
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pill & Reminder</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
          <FontAwesome name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Menu Bar */}
      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={menuButtonPosition}
          navigation={navigation}
        />
      )}

      <ScrollView style={styles.formContainer}>
        {pillForms.map((pill, index) => (
          <View style={styles.inputBox} key={index}>
            <TouchableOpacity
              style={styles.deleteIconRight}
              onPress={() => handleDeletePill(index)}
            >
              <FontAwesome name="trash" size={20} color="black" />
            </TouchableOpacity>
            <TextInput
              placeholder="Pill name..."
              style={styles.pillName}
              placeholderTextColor="#888"
              value={pill.pillName}
              onChangeText={(text) => updateField(index, "pillName", text)}
            />
            <View style={styles.row}>
              <Text style={styles.label}>Numbers of Intake (per day):</Text>
              <TextInput
                style={styles.intakeInput}
                keyboardType="numeric"
                value={pill.intake}
                onChangeText={(text) => updateField(index, "intake", text)}
              />
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Doctor notes..."
              placeholderTextColor="#888"
              style={styles.descriptionInput}
              multiline
              value={pill.description}
              onChangeText={(text) =>
                updateField(index, "description", text)
              }
            />
            <Text style={styles.label}>Date prescribed (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
              value={pill.prescribedDateInput}
              onChangeText={(text) => handleDateInput(text, index)}
            />
            {pill.dateError && (
              <Text style={styles.errorText}>
                *Please insert a valid date.
              </Text>
            )}
          </View>
        ))}

        {/* Add Image/Attachment Box */}
        <TouchableOpacity style={styles.plusBox} onPress={addPillForm}>
          <FontAwesome name="plus" size={28} color="black" />
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Pill;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "OpenSans-Bold",
    color: "black",
  },
  formContainer: {
    marginTop: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    position: "relative",
  },
  deleteIconRight: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  pillName: {
    fontSize: 16,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 12,
    color: "#000",
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 6,
    color: "#000",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  intakeInput: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 40,
    textAlign: "center",
    color: "#000",
  },
  descriptionInput: {
    borderBottomWidth: 1,
    borderColor: "#aaa",
    marginBottom: 10,
    fontStyle: "italic",
    color: "#000",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    color: "#000",
  },
  errorText: {
    color: "red",
    marginTop: 4,
    fontSize: 12,
  },
  plusBox: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: "#db7a80",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
