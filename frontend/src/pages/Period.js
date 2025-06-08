import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ImageBackground } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { OpenSans_700Bold } from "@expo-google-fonts/open-sans";
import { LinearGradient } from "expo-linear-gradient";
import MenuBar from "../components/MenuBar"; // Import Menu
import AsyncStorage from '@react-native-async-storage/async-storage';

const Period = ({ navigation }) => {
  const [fontsLoaded] = useFonts({ "OpenSans-Bold": OpenSans_700Bold });
  const [menuVisible, setMenuVisible] = useState(false); // Declare the menuVisible state variable
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 }); // Track button position

  // New state for day count and last increment date
  const [dayCount, setDayCount] = useState(0);
  const [lastIncrementDate, setLastIncrementDate] = useState(null);

  useEffect(() => {
    const fetchUserPeriod = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const response = await fetch(`http://192.168.0.102:5000/api/periods/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user period data');
        const periods = await response.json();
        if (periods.length > 0) {
          // Assuming the latest period is the first
          const latestPeriod = periods[0];
          const startDate = new Date(latestPeriod.start_date);
          const today = new Date();
          const diffTime = Math.abs(today - startDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
          setDayCount(diffDays);
          setLastIncrementDate(today.toDateString());
        }
      } catch (error) {
        console.error('Error fetching user period:', error);
      }
    };
    fetchUserPeriod();
  }, []);

  if (!fontsLoaded) return null;

  // Get current month name
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[new Date().getMonth()];

  // Function to increment day count once per day and update backend
  const incrementDayCount = async () => {
    const today = new Date().toDateString();
    if (lastIncrementDate !== today) {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        // Calculate new start_date and end_date for user_periods
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + dayCount);

        // Send POST request to backend to add or update period record
        const response = await fetch('http://192.168.0.102:5000/api/periods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          }),
        });
        if (!response.ok) throw new Error('Failed to update period record');
        setDayCount(dayCount + 1);
        setLastIncrementDate(today);
      } catch (error) {
        console.error('Error updating period record:', error);
      }
    } else {
      console.log('Day count already incremented today');
    }
  };

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
        <Text style={styles.month}>{currentMonthName}</Text>
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
        <TouchableOpacity style={styles.dayCircle} onPress={incrementDayCount}>
          <Text style={styles.dayText}>DAY</Text>
          <Text style={styles.dayNumber}>{dayCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => navigation.navigate('MRecord', { month: currentMonthName, cycleDay: dayCount })}
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
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity 
          style={{ ...styles.insightBoxBlack, flex: 0.5 }}
          onPress={() => navigation.navigate("MRecord", { month: currentMonthName, cycleDay: dayCount })}
        >
          <View style={{ paddingBottom: 10 }}>
            <Text style={styles.insightText}>Log Your Symptoms</Text>
          </View>
          <FontAwesome name="plus" size={15} color="white" />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 10 }}>
          {[
            {
              key: 'card1',
              title: 'Menstrual Cycle: An Overview',
              image: require('../../../assets/menstrual_cycle.jpg'),
              url: 'https://kidshealth.org/en/teens/menstruation.html',
            },
            {
              key: 'card2',
              title: 'Keeping up with the cycles',
              image: require('../../../assets/uterus.jpg'),
              url: 'https://www.youtube.com/watch?v=42WIByexiXc&themeRefresh=1',
            },
            {
              key: 'card3',
              title: 'Period Blood Guide',
              image: require('../../../assets/blood_drop_icon.png'),
              url: 'https://www.bodyform.co.uk/break-taboos/discover/living-with-periods/period-blood/',
            },
            {
              key: 'card4',
              title: '6 Causes of Heavy Periods',
              image: require('../../../assets/heavy_periods.jpg'),
              url: 'https://www.businessinsider.com/guides/health/reproductive-health/heavy-periods',
            },
            {
              key: 'card5',
              title: 'Does Birth Control Stops Your Period?',
              image: require('../../../assets/birth_control.jpg'),
              url: 'https://www.yourperiod.ca/normal-periods/birth-control-and-your-period/',
            },
            {
              key: 'card6',
              title: 'About: Period Pain',
              image: require('../../../assets/period_pain.jpg'),
              url: 'https://www.health.com/condition/menstruation/period-pain',
            },
          ].map(card => (
            <TouchableOpacity
              key={card.key}
              style={{
                width: 160,
                height: 180,
                borderRadius: 12,
                marginRight: 10,
                overflow: 'hidden',
                justifyContent: 'flex-end',
                backgroundColor: 'black',
              }}
              onPress={() => {
                import('react-native').then(({ Linking }) => {
                  Linking.openURL(card.url);
                });
              }}
            >
              <ImageBackground
                source={card.image}
                style={{ flex: 1, justifyContent: 'flex-end' }}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 6 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{card.title}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Text style={styles.viewAll} onPress={() => navigation.navigate('Tabs')}>
        view all...
      </Text>
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
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
    marginRight: 1,
  },
  insightBoxPurple: {
    backgroundColor: "#b983ff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
    marginRight: 6,
  },
  insightBoxGreen: {
    backgroundColor: "#8bcb75",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
    marginRight: 10,
  },
  insightText: { fontSize: 13, fontFamily: "OpenSans-Bold", color: "white", textAlign: "center" },
  insightImage: { width: 40, height: 40, marginTop: 5 },
  viewAll: { fontSize: 12, fontFamily: "OpenSans-Bold", textAlign: "right", marginTop: 5 },
});

export default Period;
