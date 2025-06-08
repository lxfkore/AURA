import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MenuBar from '../components/MenuBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarScreen() {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0, left: 0 });
  const [periodDates, setPeriodDates] = useState({});
  const navigation = useNavigation();
  const currentDate = moment().format('YYYY-MM-DD');

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2000; y--) {
    years.push({ label: `${y}`, value: `${y}` });
  }

  useEffect(() => {
    // Fetch period dates from backend for logged in user
    const fetchPeriodDates = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const response = await fetch(`http://192.168.0.102:5000/api/periods/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch period dates');
        const data = await response.json();
        const marked = {};

        // Constants for cycle phases (typical values)
        const cycleLength = 28; // days
        const periodLength = 7; // days
        const ovulationDay = 14; // day of cycle
        const follicularPhaseColor = 'grey';
        const ovulationPhaseColor = 'pink';
        const lutealPhaseColor = 'black';
        const periodColor = '#FF5C8D';

        data.forEach(record => {
          const start = moment(record.start_date);
          const end = moment(record.end_date);

          // Mark period days in pink shade
          for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
            const dateStr = m.format('YYYY-MM-DD');
            marked[dateStr] = { selected: true, selectedColor: periodColor };
          }

          // Calculate cycle start (start_date) and mark phases for one cycle
          for (let i = 1; i <= cycleLength; i++) {
            const day = moment(start).add(i - 1, 'days');
            const dateStr = day.format('YYYY-MM-DD');

            // Skip if already marked as period day
            if (marked[dateStr]) continue;

            if (i >= 1 && i < ovulationDay - 5) {
              // Follicular phase (before ovulation - 5 days)
              marked[dateStr] = { selected: true, selectedColor: follicularPhaseColor };
            } else if (i >= ovulationDay - 5 && i <= ovulationDay + 1) {
              // Ovulation phase (5 days before to 1 day after ovulation)
              marked[dateStr] = { selected: true, selectedColor: ovulationPhaseColor };
            } else if (i > ovulationDay + 1 && i <= cycleLength) {
              // Luteal phase (after ovulation)
              marked[dateStr] = { selected: true, selectedColor: lutealPhaseColor };
            }
          }
        });

        // Add current date with pink circle
        marked[currentDate] = { selected: true, selectedColor: '#FF5C8D' };
        setPeriodDates(marked);
      } catch (error) {
        console.error('Error fetching period dates:', error);
      }
    };
    fetchPeriodDates();
  }, []);

  return (
    <LinearGradient colors={['#db7a80', '#fff']} style={styles.gradient}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={(event) => {
            event.persist();
            event.target.measure((_fx, _fy, _w, _h, px, py) => {
              setMenuButtonPosition({ x: px, y: py + 30, left: px });
              setMenuVisible(true);
            });
          }}>
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>

        {/* Year Picker Centered */}
        <View style={styles.yearContainer}>
        <RNPickerSelect
            style={{
                inputIOS: styles.yearText,
                inputAndroid: styles.yearText,
                viewContainer: styles.yearButton,
            }}
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            placeholder={{}}
            items={years}
            useNativeAndroidPickerStyle={false}
        />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <FontAwesome name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={{ left: 30, top: menuButtonPosition.y }}
          navigation={navigation}
          style={{ left: menuButtonPosition.left }}
        />
      )}

      {/* Calendar */}
      <View style={styles.calendarWrapper}>
      <View style={styles.calendarPadding} />
        <CalendarList
          pastScrollRange={100}
          futureScrollRange={0}
          scrollEnabled
          showScrollIndicator
          markingType={'custom'}
          markedDates={periodDates}
          onDayPress={async (day) => {
            const selectedDate = day.dateString;
            // Confirm with user to set/change period start date
            Alert.alert(
              'Set Period Start Date',
              `Do you want to set ${selectedDate} as your period start date?`,
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes',
                  onPress: async () => {
                    try {
                      const userId = await AsyncStorage.getItem('userId');
                      if (!userId) {
                        Alert.alert('Login Required', 'Please log in to update your period.');
                        return;
                      }
                      // Send API request to update period start date
                      const response = await fetch(`http://192.168.0.102:5000/api/user_periods/update-start-date`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: parseInt(userId), start_date: selectedDate }),
                      });
                      if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Failed to update period start date: ${errorText}`);
                      }
                      // Refresh period dates after update
                      const updatedResponse = await fetch(`http://192.168.0.102:5000/api/periods/${userId}`);
                      if (!updatedResponse.ok) throw new Error('Failed to fetch updated period dates');
                      const updatedData = await updatedResponse.json();
                      const marked = {};
                      // Recalculate markings including phases
                      const cycleLength = 28;
                      const periodLength = 7;
                      const ovulationDay = 14;
                      const follicularPhaseColor = 'grey';
                      const ovulationPhaseColor = 'white';
                      const lutealPhaseColor = 'black';
                      const periodColor = '#FF5C8D';
                      updatedData.forEach(record => {
                        const start = moment(record.start_date);
                        const end = moment(record.end_date);
                        for (let m = moment(start); m.diff(end, 'days') <= 0; m.add(1, 'days')) {
                          const dateStr = m.format('YYYY-MM-DD');
                          marked[dateStr] = { selected: true, selectedColor: periodColor, customTextStyle: { color: 'white' } };
                        }
                        for (let i = 1; i <= cycleLength; i++) {
                          const day = moment(start).add(i - 1, 'days');
                          const dateStr = day.format('YYYY-MM-DD');
                          if (marked[dateStr]) continue;
                          if (i >= 1 && i < ovulationDay - 5) {
                            marked[dateStr] = { selected: true, selectedColor: follicularPhaseColor };
                          } else if (i >= ovulationDay - 5 && i <= ovulationDay + 1) {
                            marked[dateStr] = { selected: true, selectedColor: ovulationPhaseColor, customTextStyle: { color: '#555555' } };
                          } else if (i > ovulationDay + 1 && i <= cycleLength) {
                            marked[dateStr] = { selected: true, selectedColor: lutealPhaseColor };
                          }
                        }
                      });
                      marked[moment().format('YYYY-MM-DD')] = { selected: true, selectedColor: '#FF5C8D' };
                      setPeriodDates(marked);
                      // Optionally, navigate or update Period.js to reflect new cycle day
                      navigation.navigate('Period', { newStartDate: selectedDate });
                    } catch (error) {
                      console.error('Error updating period start date:', error);
                      Alert.alert('Update Failed', error.message);
                    }
                  },
                },
              ],
              { cancelable: true }
            );
          }}
          theme={{
            calendarBackground: 'transparent',
            dayTextColor: '#000',
            monthTextColor: '#000',
            todayTextColor: '#FF5C8D',
            arrowColor: '#FF5C8D',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textSectionTitleColor: '#000',
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  calendarWrapper: {
    flex: 1,
  },
  calendarPadding: {
    height: 20,
    backgroundColor: '#de838a',
  },
  topBar: {
    marginTop: 50,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1, // Add a z-index to the top bar
  },
  yearContainer: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -23 }], // Half of width to truly center
    zIndex: 1,
  },
  yearButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 12,
    width: 120,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  yearText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  calendarWrapper: {
    flex: 1,
    marginTop: -10,
  },
});
