import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";
import Modal from 'react-native-modal';

const Post = ({ navigation }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [postText, setPostText] = useState("");
    const wordLimit = 100;
    const [activeTab, setActiveTab] = useState("blogs");

    const handlePost = async () => {
        if (postText === '') {
            setIsVisible(true);
        } else {
            try {
                const response = await fetch('http://192.168.99.94:5000/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        post_name: postText,
                        post_category: activeTab, // Use the active tab to determine the category
                    }),
                });

                if (response.ok) {
                    navigation.navigate('Community', { newPost: { post_name: postText, post_category: activeTab } });
                } else {
                    const errorData = await response.json();
                    console.error('Error creating post:', errorData);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(!menuVisible)}
                    onLayout={(event) => {
                    const { x, y } = event.nativeEvent.layout;
                    setMenuButtonPosition({ x: x - 250, y });
                 }}
                >
                    <FontAwesome name="bars" size={28} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: "white", fontSize: 18 }}>Back</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ height: 1, backgroundColor: "white", width: "99%", marginTop: 15 }} />

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

            {/* Text Input */}
            <TextInput
                style={styles.textInput}
                placeholder="Write about something here..."
                placeholderTextColor="rgba(255, 255, 255, 0.75)" // Increase transparency
                multiline
                onChangeText={setPostText}
                value={postText}
                maxLength={wordLimit}
                placeholderStyle={{ fontWeight: "bold", fontSize: 400 }} // Make placeholder text bold and bigger
            />

            <View style={{ flex: 1 }} />

            {/* Word Counter */}
            <View style={{ marginTop: 10 }}>
            <Text style={styles.wordCounter}>{postText.length}/{wordLimit} words</Text>
            </View>

            {/* Line */}
            <View style={{ height: 1, backgroundColor: "white", width: "99%", marginTop: 10 }} />

             {/* Tabs */}
             <View style={styles.tabs}>
             <TouchableOpacity style={activeTab === "blog" ? styles.tabActive : styles.tabInactive} onPress={() => setActiveTab("blog")}>
                <Text style={activeTab === "blog" ? styles.tabTextActive : styles.tabTextInactive}>Blogs</Text>
            </TouchableOpacity>
                <TouchableOpacity style={activeTab === "questionnaire" ? styles.tabActive : styles.tabInactive} onPress={() => setActiveTab("questionnaire")}>
                    <Text style={activeTab === "questionnaire" ? styles.tabTextActive : styles.tabTextInactive}>Questionnaire</Text>
                </TouchableOpacity>
            </View>

            {/* Post Button */}
            <View style={{ marginTop: 20, marginBottom: 90 }}>
            <TouchableOpacity style={[styles.postButton, { alignSelf: "center" }]} onPress={handlePost}>
                        <Text style={styles.postButtonText}>Post</Text>
                    </TouchableOpacity>
                </View>

            {/*Alert pop up*/}
            <Modal isVisible={isVisible} style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Error</Text>
                    <Text style={styles.modalMessage}>You can't post without writing anything!</Text>
                    <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.okButton}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        padding: 20,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 40,
    },
    textInput: {
        color: "white",
        fontSize: 35,
        flex: 1,
        paddingBottom: 40,
    },
    wordCounter: {
        color: "white",
        textAlign: "right",
        marginTop: 5,
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 10,
        marginTop: 20,
    },
    tabActive: {
        backgroundColor: "#db7a80",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tabInactive: {
        backgroundColor: "lightgray",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
    },
    tabTextActive: {
        color: "white",
        fontWeight: "bold",
    },
    tabTextInactive: {
        color: "black",
    },
    postButton: {
        backgroundColor: "#db7a80",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
        width: 257,
    },
    postButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    modalContainer: {
        backgroundColor: 'black',
        padding: 20,
        width: 270,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'white',
        borderWidth: 1,
    },
    modalText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalMessage: {
        color: 'white',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
    okButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        width: 100,
        borderColor: 'white',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    okButtonText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
});

export default Post;