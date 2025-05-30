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
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import MenuBar from "../components/MenuBar";

const Pill = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ "OpenSans-Bold": OpenSans_700Bold });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

  const [pillForms, setPillForms] = useState([
    {
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
        <TouchableOpacity style={styles.saveButton}>
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
