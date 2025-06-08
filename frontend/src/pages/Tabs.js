import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MenuBar from '../components/MenuBar';

const cards = [
  {
    key: 'card1',
    title: 'Menstrual Cycle: An Overview',
    image: require('../../../assets/menstrual_cycle.jpg'), // updated relative path
    backgroundColor: null,
    textColor: 'white',
    url: 'https://kidshealth.org/en/teens/menstruation.html',
  },
  {
    key: 'card2',
    title: 'Keeping up with the cycles',
    image: require('../../../assets/uterus.jpg'),
    backgroundColor: null,
    textColor: 'white',
    url: 'https://www.youtube.com/watch?v=42WIByexiXc&themeRefresh=1',
  },
  {
    key: 'card3',
    title: 'Period Blood Guide',
    image: require('../../../assets/blood_drop_icon.png'),
    backgroundColor: null,
    icon: null,
    textColor: 'white',
    url: 'https://www.bodyform.co.uk/break-taboos/discover/living-with-periods/period-blood/',
  },
  {
    key: 'card4',
    title: '6 Causes of Heavy Periods',
    image: require('../../../assets/heavy_periods.jpg'), // updated relative path
    backgroundColor: null,
    textColor: 'white',
    url: 'https://www.businessinsider.com/guides/health/reproductive-health/heavy-periods',
  },
  {
    key: 'card5',
    title: 'Does Birth Control Stops Your Period?',
    image: require('../../../assets/birth_control.jpg'), // updated relative path
    backgroundColor: null,
    textColor: 'white',
    url: 'https://www.yourperiod.ca/normal-periods/birth-control-and-your-period/',
  },
  {
    key: 'card6',
    title: 'About: Period Pain',
    image: require('../../../assets/period_pain.jpg'), // updated relative path
    backgroundColor: null,
    textColor: 'white',
    url: 'https://www.health.com/condition/menstruation/period-pain',
  },
];

const Tabs = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

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

        <Text style={styles.headerTitle}>Daily Insights</Text>

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

      {/* Cards Grid */}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {cards.map(card => {
          if (card.image) {
            return (
              <TouchableOpacity key={card.key} style={styles.card} onPress={() => {
                if (card.url) {
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL(card.url);
                  });
                }
              }}>
                <ImageBackground source={card.image} style={styles.cardImage} imageStyle={{ borderRadius: 12 }}>
                  <View style={styles.textOverlay}>
                    <Text style={[styles.cardText, { color: card.textColor }]}>{card.title}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            );
          } else {
            return (
              <TouchableOpacity key={card.key} style={[styles.card, { backgroundColor: card.backgroundColor }]} onPress={() => {
                if (card.url) {
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL(card.url);
                  });
                }
              }}>
                {card.icon && (
                  <ImageBackground source={card.icon} style={styles.iconImage} imageStyle={{ borderRadius: 12, resizeMode: 'contain' }} />
                )}
                <Text style={[styles.cardText, { color: card.textColor, marginTop: card.icon ? 10 : 0 }]}>{card.title}</Text>
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: '48%',
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: 6,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 6,
  },
  cardText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  iconImage: {
    width: 50,
    height: 50,
    alignSelf: 'center',
  },
});
