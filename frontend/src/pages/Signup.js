import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import LottieView from "lottie-react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const validateInputs = () => {
        if (!email.includes('@')) {
            Alert.alert("Invalid Email", "Email must contain '@' symbol.");
            return false;
        }
        if (password.length < 6 || !/\d/.test(password)) {
            Alert.alert("Invalid Password", "Password must be at least 6 characters and include a number.");
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        if (!validateInputs()) return;

        try {
            const response = await axios.post('http://192.168.0.102:5000/api/register', { email, password });
            Alert.alert("Success", response.data.message);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            await AsyncStorage.setItem('userId', response.data.userId ? response.data.userId.toString() : '');
            if (response.data.token) {
                await AsyncStorage.setItem('token', response.data.token);
            } else {
                console.warn('No token in signup response');
            }
            navigation.replace("Period");
        } catch (error) {
            if (error.response) {
                Alert.alert("Registration Failed", error.response.data.error);
            } else {
            console.log("Signup Error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        }
        }
    };

    return (
        <View style={styles.container}>
            <LottieView
                source={require("../../../assets/lottiebackground.json")}
                autoPlay
                loop
                resizeMode="cover"
                style={styles.background}
            />
            <View style={styles.signupBox}>
                <Text style={styles.title}>Let's get you started</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSignUp}
            >
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginTextContainer}>
                <Text style={styles.loginText}>Already have an account? Login here</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    signupBox: {
        position: "absolute",
        bottom: "40%",
        alignSelf: "center",
        backgroundColor: "#fff",
        paddingVertical: 25,
        paddingHorizontal: 35,
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        width: 283,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },
    signInButton: {
        backgroundColor: "#000000",
        paddingVertical: 13,
        paddingHorizontal: 13,
        borderRadius: 13,
        width: "100%",
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: "bold",
        color: "white",
    },
    loginText: {
        color: 'white',
        marginTop: 15,
        textAlign: 'center',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    loginTextContainer: {
        marginTop: 450,
        alignItems: 'center',
    },
    bottomTextContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    bottomText: {
        color: 'black',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
});

export default Signup;
