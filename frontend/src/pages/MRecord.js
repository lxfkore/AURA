import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import MenuBar from '../components/MenuBar';

const symptoms = [
  { key: 'nothing', display: 'nothing' },
  { key: 'fatigue', display: 'fatigue' },
  { key: 'cramps', display: 'cramps' },
  { key: 'bloating', display: 'bloating' },
  { key: 'tenderness', display: 'tenderness' },
  { key: 'mood_swings', display: 'mood swings' }, // Underscored key, spaced display
  { key: 'diarrhea', display: 'diarrhea' },
  { key: 'acne', display: 'acne' },
  { key: 'headache', display: 'headache' },
  { key: 'cravings', display: 'cravings' },
  { key: 'insomnia', display: 'insomnia' },
  { key: 'itching_dryness', display: 'itching & dryness' }, // Underscored key, ampersand display
];

const discharges = [
  'none', 'egg white', 'watery', 'sticky',
  'creamy', 'spotting', 'clumpy whites', 'unusual', 'gray'
];

const MRecord = ({ navigation, route }) => {
  const { month, cycleDay } = route.params || {};
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [flowLevel, setFlowLevel] = useState('medium');
  const [bloodClots, setBloodClots] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState('');
  const [pillStatus, setPillStatus] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
  const isFocused = useIsFocused();

  // New state to track if existing record is loaded
  const [existingRecordLoaded, setExistingRecordLoaded] = useState(false);
  // State to store period start date and end date
  const [periodStartDate, setPeriodStartDate] = useState(null);
  const [periodEndDate, setPeriodEndDate] = useState(null);

  const toggleSymptom = (key) => { 
    setSelectedSymptoms(prev =>
      prev.includes(key)
        ? prev.filter(s => s !== key)
        : [...prev, key]
    );
  };

  const getIntakeStatusId = (status) => {
    switch(status) {
      case 'on time': return 1;
      case 'yesterday': return 2;
      default: return 3; // not taken
    }
  };

  const fetchPillStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setPillStatus('');
        return;
      }
      const response = await fetch(`http://192.168.0.102:5000/api/pills/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pills');
      }
      const pills = await response.json();
      if (pills.length > 0) {
        const intakeStatusId = pills[0].intake_status_id;
        let status = '';
        switch (intakeStatusId) {
          case 1:
            status = 'on time';
            break;
          case 2:
            status = 'yesterday';
            break;
          default:
            status = '';
        }
        setPillStatus(status);
      } else {
        setPillStatus('');
      }
    } catch (error) {
      console.error('Error fetching pill status:', error);
      setPillStatus('');
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPillStatus();
      fetchExistingRecord();
      fetchPeriodRecord();
    }
  }, [isFocused]);

  // Function to fetch existing record for the day and populate state
  const fetchExistingRecord = async () => {
    try {
      const user_id = await AsyncStorage.getItem('userId');
      if (!user_id) {
        return;
      }
      const record_date = new Date().toISOString().split('T')[0];

      // Fetch symptoms
      const symptomsResponse = await fetch(`http://192.168.0.102:5000/api/symptoms/${user_id}/${record_date}`);
      if (symptomsResponse.ok) {
        const symptomsData = await symptomsResponse.json();
        const selected = [];
        if (symptomsData.nothing) selected.push('nothing');
        if (symptomsData.fatigue) selected.push('fatigue');
        if (symptomsData.cramps) selected.push('cramps');
        if (symptomsData.bloating) selected.push('bloating');
        if (symptomsData.tenderness) selected.push('tenderness');
        if (symptomsData.mood_swings) selected.push('mood_swings');
        if (symptomsData.diarrhea) selected.push('diarrhea');
        if (symptomsData.acne) selected.push('acne');
        if (symptomsData.headache) selected.push('headache');
        if (symptomsData.cravings) selected.push('cravings');
        if (symptomsData.insomnia) selected.push('insomnia');
        if (symptomsData.itching_dryness) selected.push('itching_dryness');
        setSelectedSymptoms(selected);
      }

      // Fetch menstrual flow
      const flowResponse = await fetch(`http://192.168.0.102:5000/api/menstrual_flow/${user_id}/${record_date}`);
      if (flowResponse.ok) {
        const flowData = await flowResponse.json();
        if (flowData.light) setFlowLevel('light');
        else if (flowData.medium) setFlowLevel('medium');
        else if (flowData.heavy) setFlowLevel('heavy');
        else setFlowLevel('medium');
        setBloodClots(flowData.blood_clots === 1);
      }

      // Fetch vaginal discharge
      const dischargeResponse = await fetch(`http://192.168.0.102:5000/api/vaginal_discharge/${user_id}/${record_date}`);
      if (dischargeResponse.ok) {
        const dischargeData = await dischargeResponse.json();
        // Map database columns to selectedDischarge string
        const dischargeTypes = [
          { value: 'none', column: 'none' },
          { value: 'egg white', column: 'egg_white' },
          { value: 'watery', column: 'watery' },
          { value: 'sticky', column: 'sticky' },
          { value: 'creamy', column: 'creamy' },
          { value: 'spotting', column: 'spotting' },
          { value: 'clumpy whites', column: 'clumpy_whites' },
          { value: 'unusual', column: 'unusual' },
          { value: 'gray', column: 'gray' },
        ];
        const selected = dischargeTypes.find(type => dischargeData[type.column] === 1);
        setSelectedDischarge(selected ? selected.value : '');
      }

      setExistingRecordLoaded(true);
    } catch (error) {
      console.error('Error fetching existing record:', error);
    }
  };

  // Fetch period record to get start_date and end_date
  const fetchPeriodRecord = async () => {
    try {
      const user_id = await AsyncStorage.getItem('userId');
      if (!user_id) return;
      const response = await fetch(`http://192.168.0.102:5000/api/periods/${user_id}`);
      if (!response.ok) return;
      const periods = await response.json();
      if (periods.length > 0) {
        const latestPeriod = periods[0];
        setPeriodStartDate(latestPeriod.start_date);
        setPeriodEndDate(latestPeriod.end_date);
      }
    } catch (error) {
      console.error('Error fetching period record:', error);
    }
  };

  // Function to check if cycle day exceeds 7 days and prompt user
  const checkPeriodExceed = () => {
    if (!periodStartDate) return;
    const startDate = new Date(periodStartDate);
    const today = new Date();
    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to count start day as day 1
    if (diffDays > 7) {
      Alert.alert(
        'Period Duration Exceeded',
        'Your period has exceeded 7 days. Is this correct?',
        [
          { text: 'No', onPress: () => console.log('User indicated period not exceeded') },
          { text: 'Yes', onPress: () => updatePeriodEndDate(today) },
        ]
      );
    }
  };

  // Function to update period end date in backend
  const updatePeriodEndDate = async (newEndDate) => {
    try {
      const user_id = await AsyncStorage.getItem('userId');
      if (!user_id) return;
      const formattedDate = newEndDate.toISOString().split('T')[0];
      // Assuming an API endpoint to update period end_date exists, else create one
      const response = await fetch(`http://192.168.0.102:5000/api/periods/update-end-date`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(user_id), end_date: formattedDate }),
      });
      if (!response.ok) {
        console.error('Failed to update period end date');
      } else {
        setPeriodEndDate(formattedDate);
        console.log('Period end date updated');
      }
    } catch (error) {
      console.error('Error updating period end date:', error);
    }
  };

  // Call checkPeriodExceed when cycleDay changes or on load
  useEffect(() => {
    if (periodStartDate) {
      checkPeriodExceed();
    }
  }, [periodStartDate, cycleDay]);

  const handleDone = async () => {
    const log = {
      symptoms: selectedSymptoms,
      menstrualFlow: flowLevel,
      bloodClots,
      vaginalDischarge: selectedDischarge,
      contraceptive: pillStatus,
    };
    console.log('Menstrual Log:', log);

    // Retrieve user_id from AsyncStorage
    const user_id = await AsyncStorage.getItem('userId');
    if (!user_id) {
      Alert.alert('Login Required', 'Please log in to save your data.');
      return;
    }

    // Use current date as record_date
    const record_date = new Date().toISOString().split('T')[0];

    // Prepare symptoms data object with 1/0 values
    const symptomsData = {
      user_id: parseInt(user_id),
      record_date,
      nothing: selectedSymptoms.includes('nothing') ? 1 : 0,
      fatigue: selectedSymptoms.includes('fatigue') ? 1 : 0,
      cramps: selectedSymptoms.includes('cramps') ? 1 : 0,
      bloating: selectedSymptoms.includes('bloating') ? 1 : 0,
      tenderness: selectedSymptoms.includes('tenderness') ? 1 : 0,
      mood_swings: selectedSymptoms.includes('mood_swings') ? 1 : 0,
      diarrhea: selectedSymptoms.includes('diarrhea') ? 1 : 0,
      acne: selectedSymptoms.includes('acne') ? 1 : 0,
      headache: selectedSymptoms.includes('headache') ? 1 : 0,
      cravings: selectedSymptoms.includes('cravings') ? 1 : 0,
      insomnia: selectedSymptoms.includes('insomnia') ? 1 : 0,
      itching_dryness: selectedSymptoms.includes('itching_dryness') ? 1 : 0,
    };

      // Prepare menstrual flow data object
      const menstrualFlowData = {
        user_id: parseInt(user_id),
        record_date,
        light: flowLevel === 'light' ? 1 : 0,
        medium: flowLevel === 'medium' ? 1 : 0,
        heavy: flowLevel === 'heavy' ? 1 : 0,
        blood_clots: bloodClots ? 1 : 0,
      };

    // Prepare vaginal discharge data object
    const vaginalDischargeData = {
      user_id: parseInt(user_id),
      record_date,
      none: selectedDischarge === 'none' ? 1 : 0,
      'egg_white': selectedDischarge === 'egg white' ? 1 : 0,
      watery: selectedDischarge === 'watery' ? 1 : 0,
      sticky: selectedDischarge === 'sticky' ? 1 : 0,
      creamy: selectedDischarge === 'creamy' ? 1 : 0,
      spotting: selectedDischarge === 'spotting' ? 1 : 0,
      'clumpy_whites': selectedDischarge === 'clumpy whites' ? 1 : 0,
      unusual: selectedDischarge === 'unusual' ? 1 : 0,
      gray: selectedDischarge === 'gray' ? 1 : 0,
    };

    try {
      // Fetch existing record for the day to decide insert or update
      const symptomsFetch = await fetch(`http://192.168.0.102:5000/api/symptoms/${user_id}/${record_date}`);
      const menstrualFlowFetch = await fetch(`http://192.168.0.102:5000/api/menstrual_flow/${user_id}/${record_date}`);
      const vaginalDischargeFetch = await fetch(`http://192.168.0.102:5000/api/vaginal_discharge/${user_id}/${record_date}`);

      const symptomsExists = symptomsFetch.ok;
      const menstrualFlowExists = menstrualFlowFetch.ok;
      const vaginalDischargeExists = vaginalDischargeFetch.ok;

      // 1. Save period record (original code)
      const response = await fetch('http://192.168.0.102:5000/api/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: parseInt(user_id), start_date: record_date, end_date: null }),
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error('Failed to parse JSON:', jsonError, 'Response text:', text);
        throw new Error('Invalid JSON response');
      }
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save period record');
      }
      console.log('Period record saved:', data);

      // 2. Save or update symptoms data
      const symptomsResponse = await fetch('http://192.168.0.102:5000/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(symptomsData),
      });
      if (!symptomsResponse.ok) {
        const errorText = await symptomsResponse.text();
        throw new Error(`Failed to save symptoms data: ${errorText}`);
      }
      console.log('Symptoms data saved');

      // 3. Save or update menstrual flow data
      const flowResponse = await fetch('http://192.168.0.102:5000/api/menstrual_flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menstrualFlowData),
      });
      if (!flowResponse.ok) {
        const errorText = await flowResponse.text();
        throw new Error(`Failed to save menstrual flow data: ${errorText}`);
      }
      console.log('Menstrual flow data saved');

      // 4. Save or update vaginal discharge data
      const dischargeResponse = await fetch('http://192.168.0.102:5000/api/vaginal_discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaginalDischargeData),
      });
      if (!dischargeResponse.ok) {
        const errorText = await dischargeResponse.text();
        throw new Error(`Failed to save vaginal discharge data: ${errorText}`);
      }
      console.log('Vaginal discharge data saved');

      // 5. Save pill intake status if selected
      if (pillStatus) {
        const intakeStatusId = getIntakeStatusId(pillStatus);
        // Fetch existing pills to update their status
        try {
          const response = await fetch(`http://192.168.0.102:5000/api/pills/user/${user_id}`, {
            method: 'GET',
          });

          const pills = await response.json();

          if (pills.length > 0) {
            // Update the first pill (or adjust to target specific pills)
            const pillId = pills[0].id; // Assuming one pill per user for simplicity
            const updateResponse = await fetch(`http://192.168.0.102:5000/api/pills/${pillId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pillName: pills[0].name,
                intake: pills[0].intake_no,
                description: pills[0].description,
                prescribedDate: pills[0].date_prescribed,
                intake_status_id: intakeStatusId,
              }),
            });

            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error('Update pill status failed:', updateResponse.status, errorText);
              throw new Error(`Failed to update pill status: ${errorText}`);
            }
            console.log('Pill status updated');
          }
        } catch (error) {
          console.error('Error updating pill status:', error);
          throw error;
        }
      }

      navigation.navigate('Period');
    } catch (error) {
      console.error('Error saving data:', error);
      // Handle specific errors (e.g., user not logged in)
      if (error.message === 'User not logged in') {
        Alert.alert('Login Required', 'Please log in to save your data.');
      } else {
        Alert.alert('Save Failed', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

        <Text style={styles.headerTitle}>Log Your Symptoms</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
          <FontAwesome name="calendar" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={menuButtonPosition}
          navigation={navigation}
        />
      )}

      <Text style={styles.cycleText}>{month || 'December'} - Cycle Day {cycleDay || 2}</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Symptoms */}
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.sectionBox}>
        <View style={styles.grid}>
          {symptoms.map(({ key, display }) => (
            <TouchableOpacity
              key={key} // Use unique key for each item
              style={[
                styles.symptomButton,
                selectedSymptoms.includes(key) && styles.selectedButton
              ]}
              onPress={() => toggleSymptom(key)} 
            >
              <Text style={styles.symptomText}>{display}</Text> 
            </TouchableOpacity>
          ))}
        </View>
      </View>

        {/* Menstrual Flow */}
        <Text style={styles.sectionTitle}>Menstrual Flow</Text>
        <View style={styles.sectionBox}>
          <View style={styles.flowBar}>
            {['light', 'medium', 'heavy'].map((level, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.flowButton,
                  flowLevel === level && styles.selectedButton
                ]}
                onPress={() => setFlowLevel(level)}
              >
                <Text style={styles.flowText}>{level}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.flowButton,
                bloodClots && styles.selectedButton
              ]}
              onPress={() => setBloodClots(!bloodClots)}
            >
              <Text style={styles.flowText}>blood clots</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Vaginal Discharge */}
        <Text style={styles.sectionTitle}>Vaginal Discharge</Text>
        <View style={styles.sectionBox}>
          <View style={styles.grid}>
            {discharges.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.symptomButton,
                  selectedDischarge === type && styles.selectedButton
                ]}
                onPress={() => setSelectedDischarge(type)}
              >
                <Text style={styles.symptomText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Oral Contraceptives */}
        <Text style={styles.sectionTitle}>Oral Contraceptives & Others</Text>
        <View style={styles.sectionBox}>
          <View style={styles.flowBar}>
            <TouchableOpacity
              style={[styles.flowButton, pillStatus === 'on time' && styles.selectedButton]}
              onPress={() => setPillStatus('on time')}
            >
              <Text style={styles.flowText}>taken on time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.flowButton, pillStatus === 'yesterday' && styles.selectedButton]}
              onPress={() => setPillStatus('yesterday')}
            >
              <Text style={styles.flowText}>taken yesterday</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.flowButton, !pillStatus && styles.selectedButton]}
              onPress={() => setPillStatus('')}
            >
              <Text style={styles.flowText}>not taken</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.reminderButton}
            onPress={() => navigation.navigate('Pill', { getIntakeStatusId })}
          >
            <Text style={styles.reminderText}>set reminders and pill info !</Text>
            <FontAwesome name="angle-right" size={14} color="white" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MRecord;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scroll: {
    padding: 16,
    paddingBottom: 60
  },
  header: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  cycleText: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: 16,
    color: '#444'
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  sectionBox: {
    backgroundColor: 'black',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  symptomButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 16,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: '#f4b4b4',
  },
  symptomText: {
    fontSize: 14
  },
  flowBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  flowButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#eee',
    borderRadius: 16,
    margin: 5
  },
  flowText: {
    fontSize: 14
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10
  },
  reminderText: {
    color: 'white',
    fontSize: 13,
    textDecorationLine: 'underline',
    marginRight: 2
  },
  arrowIcon: {
    marginLeft: 6,
  },
  doneButton: {
    backgroundColor: '#db7a80',
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 60,
    alignSelf: 'center',
    paddingHorizontal: 40
  },
  doneText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});
