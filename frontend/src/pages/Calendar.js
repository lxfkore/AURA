import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import RNPickerSelect from 'react-native-picker-select';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MenuBar from '../components/MenuBar';

export default function CalendarScreen() {
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0, left: 0 });
  const navigation = useNavigation();
  const currentDate = moment().format('YYYY-MM-DD');

  const periodDates = {
    '2025-04-05': { selected: true, selectedColor: 'rgba(128,128,128,0.3)' },
    '2025-04-06': { selected: true, selectedColor: 'rgba(128,128,128,0.3)' },
    '2025-04-10': { selected: true, selectedColor: 'rgba(128,128,128,0.3)' },
    [currentDate]: { selected: true, selectedColor: '#FF5C8D' },
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2000; y--) {
    years.push({ label: `${y}`, value: `${y}` });
  }

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