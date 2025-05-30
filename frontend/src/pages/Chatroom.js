import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const Chatroom = ({ navigation, route }) => {
  const { businessName, businessProfile } = route.params;

  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I’m interested in buying some roses, when are you available for delivery?", sender: "user" },
    { id: 2, text: "Hello! Thx for asking! I’m mostly available around 2–6pm for deliveries.", sender: "business" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: "user" }]);
      setNewMessage("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 35 }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 17,
        paddingVertical: 15,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="black" />
        </TouchableOpacity>

        <Image source={businessProfile} style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          marginLeft: 15,
        }} />
        
        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>{businessName}</Text>

      </View>

        {/* Header Line */}
        <View style={{
                height: 1,
                backgroundColor: "#ddd",
                marginHorizontal: 10,
            }} />

      {/* Chat Messages */}
      <ScrollView style={{ flex: 1, padding: 15 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#db7a80" : "#ddd",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              maxWidth: "80%",
            }}
          >
            <Text style={{ color: msg.sender === "user" ? "white" : "black" }}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Chat Input */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
      }}>
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 15,
          }}
          placeholder="Welcome to your chat..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
          <FontAwesome name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Chatroom;