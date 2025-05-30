import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";

const Startup = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000, // 1 second fade in
      useNativeDriver: true,
    }).start(() => {
      // After 1 second delay, fade out and navigate to Signup
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000, // 1 second fade out
          useNativeDriver: true,
        }).start(() => {
          navigation.replace("Signup"); // Navigate to Signup.js after animation
        });
      }, 1000);
    });
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Animation Background */}
      <LottieView
        source={require("../../../assets/lottiebackground.json")}
        autoPlay
        loop
        resizeMode="cover"
        style={styles.background}
      />

      {/* Fading Logo */}
      <Animated.View style={{ ...styles.overlay, opacity: fadeAnim }}>
        <Text style={styles.logo}>AURA</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { 
    position: "absolute", 
    width: "100%", 
    height: "100%" 
  },
  overlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  logo: { 
    fontSize: 50, 
    fontFamily: "OpenSans-Bold", 
    letterSpacing: 1.0, 
    color: "#fff", 
    textShadowColor: "rgba(0, 0, 0, 0.8)", 
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 5 
  }
});

export default Startup;
