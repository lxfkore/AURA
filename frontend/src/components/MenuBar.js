import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Get screen width
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const MenuBar = ({ menuVisible, setMenuVisible, menuButtonPosition, navigation }) => {
  const menuAnimation = useRef(new Animated.Value(-screenWidth)).current;

  useEffect(() => {
    console.log("Menu Visibility:", menuVisible); // Debugging menu state
    Animated.timing(menuAnimation, {
      toValue: menuVisible ? 0 : -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [menuVisible]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar Menu */}
      <Animated.View style={[styles.menuContainer, { transform: [{ translateX: menuAnimation }] }]}>
        {/* Close Button */}
        <View style={styles.iconContainer}>
          {/* Close Button */}
          <TouchableOpacity style={styles.barsIcon} onPress={() => setMenuVisible(false)}>
            <FontAwesome name="bars" size={32} color="white" />
          </TouchableOpacity>

          {/* Profile Icon */}
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("Profile"); // Navigate to Profile.js
            }}
          >
            <FontAwesome name="user-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        {["Home", "Chat", "Period Calendar", "Community", "Women Led Businesses", "Health Support"].map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => {
            setMenuVisible(false);
            if (item === "Home") {
              navigation.navigate('Period'); // Navigate to Period.js
            } else if (item === "Community") {
              navigation.navigate('Community'); // Navigate to Community.js
            } else if (item === "Women Led Businesses") {
              navigation.navigate('Business'); // Navigate to Business.js
            } else if (item === "Chat") {
              navigation.navigate('Chat'); // Navigate to Chat.js
            } else if (item === "Period Calendar") {
            navigation.navigate('Calendar'); // Navigate to Calendar.js
            } else if (item === "Health Support") {
            navigation.navigate('FertilityMap'); // Navigate to FertilityMap.js
            }
          }}>
            <Text style={styles.menuText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1000,
    backgroundColor: "transparent", // Ensures background doesn't interfere
    position: "absolute",
  },
  menuButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 20,
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 250,
    height: screenHeight,
    backgroundColor: "black",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
    elevation: 5,
  },
  iconContainer: {
    flexDirection: 'row', // Align icons horizontally
    justifyContent: 'space-between', // Space between icons
    alignItems: 'center', // Center icons vertically
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff50",
    backgroundColor: "black",
    paddingLeft: 5,
    marginBottom: 5,
  },
  menuText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left"
  },
});

export default MenuBar;
