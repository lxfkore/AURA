import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import LottieView from "lottie-react-native";

WebBrowser.maybeCompleteAuthSession();

const Signup = ({ navigation }) => {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "275605283188-ilet75uj030f4lspee1cfv3j9b3qjm43.apps.googleusercontent.com",
        expoClientId: "275605283188-t5dqblqaqkhs2ul6ahfk8s40nua.apps.googleusercontent.com",
    });

    React.useEffect(() => {
        if (response?.type === "success") {
            const { authentication } = response;
            Alert.alert("Google Sign-In Success", "You have successfully signed in with Google.");
            navigation.navigate("Period");
        } else if (response?.type === "error") {
            Alert.alert("Google Sign-In Failed", "An error occurred during Google Sign-In.");
        }
    }, [response]);

    const handleGoogleSignIn = () => {
        promptAsync();
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
                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={handleGoogleSignIn}
                    disabled={!request}
                >
                    <Image
                        source={require("../../../assets/google-icon.png")}
                        style={styles.googleIcon}
                    />
                    <Text style={styles.buttonText}>Google Account</Text>
                </TouchableOpacity>
            </View>
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
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EDEDED",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: 200,
        justifyContent: "center",
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#555",
    },
});

export default Signup;