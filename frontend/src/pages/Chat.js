import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import MenuBar from "../components/MenuBar"; // Import Menu

const Chat = () => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false); // Declare the menuVisible state variable
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 }); // Track button position

  const chats = [
    {
      id: "1",
      name: "Emma - Florist + Deliveries",
      message: "Hi! I’m interested in buying some roses, when are you available...",
      image: require("../../../assets/emma.png"), // Ensure correct path
      unread: false,
    },
    {
      id: "2",
      name: "Chef Boston",
      message: "Hello, yes I am available for a private booking, are you here...",
      image: require("../../../assets/icon.png"), // Update with actual profile
      unread: true,
    },
    {
      id: "3",
      name: "Anna Winston (FA)",
      message: "Hello, thank you for reaching out. You may contact me via...",
      image: require("../../../assets/anna.png"),
      unread: true,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 40 }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            onLayout={(event) => {
              const { x, y } = event.nativeEvent.layout;
              setMenuButtonPosition({ x, y });
            }}
          >
            <FontAwesome name="bars" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginRight: 10 }}>Chats</Text>

        <TouchableOpacity
          style={{ justifyContent: "center", alignItems: "center" }}
          onPress={() => navigation.navigate("Calendar")}
        >
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

      {/* Chat List */}
      <ScrollView style={{ flex: 1, padding: 5 }}>
        {chats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={{ flexDirection: "row", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" }}
            onPress={() =>
              navigation.navigate("Chatroom", {
                businessName: chat.name,
                businessProfile: chat.image,
              })
            }
          >
            <Image source={chat.image} style={{ width: 50, height: 50, borderRadius: 25 }} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{chat.name}</Text>
              <Text style={{ fontSize: 14, color: "#666", marginTop: 2 }}>{chat.message}</Text>
            </View>
            {chat.unread && <View style={{ width: 10, height: 10, backgroundColor: "#db7a80", borderRadius: 5, marginLeft: 10 }} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


export default Chat;