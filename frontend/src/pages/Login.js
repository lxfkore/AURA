import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import LottieView from "lottie-react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const checkLoggedIn = async () => {
            const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
            if (isLoggedIn === 'true') {
                navigation.replace('Period');
            } else {
                // Stay on login page
            }
        };
        checkLoggedIn();
    }, []);

    const handleLogin = async () => {
        if (!email.includes('@')) {
            Alert.alert("Invalid Email", "Email must contain '@' symbol.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Invalid Password", "Password must be at least 6 characters.");
            return;
        }

        try {
            const response = await axios.post('http://192.168.0.102:5000/api/login', { email, password });
            console.log('Login response:', response.data);
            Alert.alert("Success", response.data.message);
            await AsyncStorage.setItem('isLoggedIn', 'true');
            if (response.data.userId) {
                console.log('Storing userId:', response.data.userId);
                await AsyncStorage.setItem('userId', response.data.userId.toString());
                console.log('UserId stored in AsyncStorage');
            } else {
                console.warn('No userId in login response');
            }
            if (response.data.token) {
                await AsyncStorage.setItem('token', response.data.token);
            } else {
                console.warn('No token in login response');
            }
            navigation.replace("Period");
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                const errorMsg = error.response.data.error;
                if (errorMsg === "Incorrect password") {
                    Alert.alert(
                        "Login Failed",
                        "Do you want to change password? ",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Click here", style: "default", onPress: () => handlePasswordReset() }
                        ],
                        { cancelable: true }
                    );
                } else if (errorMsg === "Email doesn't exist") {
                    Alert.alert("Login Failed", "Email doesn't exist.");
                } else {
                    Alert.alert("Login Failed", errorMsg);
                }
            } else {
                Alert.alert("Error", "An unexpected error occurred.");
            }
        }
    };


    const handlePasswordReset = async () => {
        try {
            const response = await axios.post('http://192.168.0.102:5000/api/request-password-reset', { email });
            Alert.alert("Password Reset", response.data.message);
        } catch (error) {
            Alert.alert("Error", "Failed to send password reset email.");
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
            <View style={styles.loginBox}>
                <Text style={styles.title}>Welcome Back</Text>
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
                    style={styles.loginButton}
                    onPress={handleLogin}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>Are you new here? Sign up now</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    loginBox: {
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
        width: 300,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    loginButton: {
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
    bottomTextContainer: {
        marginTop: 460,
        alignItems: 'center',
    },
    bottomText: {
        color: 'white',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
});

