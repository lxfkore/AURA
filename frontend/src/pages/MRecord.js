import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MenuBar from '../components/MenuBar';

const symptoms = [
  'nothing', 'fatigue', 'cramps', 'bloating',
  'tenderness', 'mood swings', 'diarrhea', 'acne',
  'headache', 'cravings', 'insomnia', 'itching & dryness'
];

const discharges = [
  'none', 'egg white', 'watery', 'sticky',
  'creamy', 'spotting', 'clumpy whites', 'unusual', 'gray'
];

const MRecord = ({ navigation }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [flowLevel, setFlowLevel] = useState('medium');
  const [bloodClots, setBloodClots] = useState(false);
  const [selectedDischarge, setSelectedDischarge] = useState('');
  const [pillStatus, setPillStatus] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleDone = () => {
    const log = {
      symptoms: selectedSymptoms,
      menstrualFlow: flowLevel,
      bloodClots,
      vaginalDischarge: selectedDischarge,
      contraceptive: pillStatus,
    };
    console.log('Menstrual Log:', log);
    // TODO: Save to DB later
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

      <Text style={styles.cycleText}>December - Cycle Day 2</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Symptoms */}
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.sectionBox}>
          <View style={styles.grid}>
            {symptoms.map((symptom, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom) && styles.selectedButton
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text style={styles.symptomText}>{symptom}</Text>
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
              style={[
                styles.flowButton,
                pillStatus === 'on time' && styles.selectedButton
              ]}
              onPress={() => setPillStatus('on time')}
            >
              <Text style={styles.flowText}>taken on time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.flowButton,
                pillStatus === 'yesterday' && styles.selectedButton
              ]}
              onPress={() => setPillStatus('yesterday')}
            >
              <Text style={styles.flowText}>taken yesterday</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.reminderButton}
            onPress={() => navigation.navigate('Pill')}
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
