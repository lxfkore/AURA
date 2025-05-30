import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import { LinearGradient } from "expo-linear-gradient";
import MenuBar from "../components/MenuBar"; // Import Menu

const Period = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ "OpenSans-Bold": OpenSans_700Bold });
  const [menuVisible, setMenuVisible] = useState(false); // Declare the menuVisible state variable
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 }); // Track button position

  if (!fontsLoaded) return null;

  return (
    <View style={{ ...styles.container, paddingTop: 40 }}>
      {/* Centered Half-Sphere Gradient */}
      <LinearGradient 
        colors={["#cd58b7", "#e0d577", "white"]} 
        locations={[0, 0.5, 1]} 
        style={{ ...styles.gradient, top: -1 }} 
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setMenuVisible(!menuVisible); }} 
                onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout; // Get button position
                setMenuButtonPosition({ x, y });
        }}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.month}>December</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
          <FontAwesome name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {menuVisible && (
          <MenuBar menuVisible={menuVisible} setMenuVisible={setMenuVisible} menuButtonPosition={menuButtonPosition} navigation={navigation}/>
      )}

      {/* Title */}
      <Text style={styles.title}>Your Cycle</Text>

      {/* Cycle Day - "DAY" Inside the Circle */}
      <View style={styles.cycleContainer}>
        <View style={styles.dayCircle}>
          <Text style={styles.dayText}>DAY</Text>
          <Text style={styles.dayNumber}>2</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate("MRecord")}
        >
          <FontAwesome name="plus" size={40} color="white" />
        </TouchableOpacity>
      </View>

      {/* Edit Dates Button */}
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => navigation.navigate("Calendar")}
      >
        <Text style={styles.editButtonText}>edit dates</Text>
      </TouchableOpacity>

      {/* Daily Insights Section */}
      <Text style={styles.sectionTitle}>Daily Insights</Text>
      <View style={styles.insightsContainer}>
        <TouchableOpacity 
          style={styles.insightBoxBlack}
          onPress={() => navigation.navigate("MRecord")}
        >
          <View style={{ paddingBottom: 10 }}>
            <Text style={styles.insightText}>Log Your Symptoms</Text>
          </View>
          <FontAwesome name="plus" size={15} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.insightBoxPurple}>
          <Text style={styles.insightText}>Keeping up with the cycles</Text>
          <Image source={{ uri: "https://example.com/uterus_icon.png" }} style={styles.insightImage} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.insightBoxGreen}>
          <Text style={styles.insightText}>Track Your Moods</Text>
          <Image source={{ uri: "https://example.com/mood_icon.png" }} style={styles.insightImage} />
        </TouchableOpacity>
      </View>
      <Text style={styles.viewAll}>view all...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 20 },

  /* Centered Half-Sphere Gradient */
  gradient: {
    position: "absolute",
    width: 400, // Width for centering
    height: 200, // Half-sphere effect
    top: 0,
    left: "50%",
    marginLeft: -180, // Center align
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },

  /* Header */
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  month: { fontSize: 16, fontFamily: "OpenSans-Bold" },

  /* Title */
  title: { fontSize: 24, fontFamily: "OpenSans-Bold", marginTop: 10, textAlign: "center" },

  /* Day Circle */
  cycleContainer: { alignItems: "center", marginTop: 30 },
  dayCircle: {
    backgroundColor: "#db7a80",
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dayText: { fontSize: 20, fontFamily: "OpenSans-Bold", color: "black" },
  dayNumber: { fontSize: 80, fontFamily: "OpenSans-Bold", color: "black" },

  /* Add Button */
  addButton: {
    backgroundColor: "black",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
  },

  /* Edit Button */
  editButton: {
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  editButtonText: { fontSize: 14, fontFamily: "OpenSans-Bold" },

  /* Daily Insights */
  sectionTitle: { fontSize: 18, fontFamily: "OpenSans-Bold", marginTop: 20 },
  insightsContainer: { flexDirection: "row", marginTop: 10 },

  insightBoxBlack: {
    backgroundColor: "black",
    paddingVertical: 35,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 6,
  },
  insightBoxPurple: {
    backgroundColor: "#b983ff",
    paddingVertical: 35,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 6,
  },
  insightBoxGreen: {
    backgroundColor: "#8bcb75",
    paddingVertical: 35,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  insightText: { fontSize: 13, fontFamily: "OpenSans-Bold", color: "white", textAlign: "center" },
  insightImage: { width: 40, height: 40, marginTop: 5 },
  viewAll: { fontSize: 12, fontFamily: "OpenSans-Bold", textAlign: "right", marginTop: 5 },
});

export default Period;
