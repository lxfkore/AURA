import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";

const businesses = [
  {
    id: "1",
    name: "Emma - Florist + Deliveries",
    category: "Florist & Flower Delivery Service",
    price: "RM 10-30",
    address: "No 2-35G & 2-36G, Festival Walk @ Ipoh, Jalan Medan Ipoh 1, Medan Ipoh Bistari, 31400 Ipoh, Perak",
    image: require("../../../assets/flower.png"),
    profile: require("../../../assets/emma.png"),
  },
  {
    id: "2",
    name: "Anna Winston (FA)",
    category: "Financial Adviser",
    price: "RM 150 per hour",
    address: "Previously worked at Intel.co, currently working as a WFH adviser for stock selling and crypto investments.",
    profile: require("../../../assets/anna.png"),
  },
];

const Business = ({ navigation}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 60,
      }}>
        <TouchableOpacity
          style={{ position: "absolute", left: 20 }}
          onPress={() => setMenuVisible(!menuVisible)}
          onLayout={(event) => {
            const { x, y } = event.nativeEvent.layout;
            setMenuButtonPosition({ x: x - 250, y });
          }}
        >
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={{ position: "absolute", right: 20 }} onPress={() => navigation.navigate("Chat")}>
          <FontAwesome name="envelope" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* "Business" Label Below Menu Button */}
      <View style={{ alignItems: "flex-start", paddingHorizontal: 20, marginTop: 5 }}>
        <Text style={{ fontSize: 27, fontWeight: "600", textAlign: "left", marginTop: -45, color: "black" }}>Business</Text>
      </View>

      {/* Menu Dropdown */}
      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          navigation={navigation}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={{ left: 30, top: menuButtonPosition.y }}
          style={{ left: menuButtonPosition.left }}
        />
      )}

      {/* Business Posts */}
      <ScrollView style={{ paddingHorizontal: 10, marginTop: 2 }}>
        {businesses.map((business) => (
          <View key={business.id} style={{
            padding: 20,
            backgroundColor: "#000",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginBottom: 15,
          }}>
            {/* Profile & Business Name */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: -8 }}>
              <Image source={business.profile} style={{ width: 50, height: 50, borderRadius: 25 }} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "white" }}>{business.name}</Text>
            </View>

            {/* Business Image */}
            {business.image && (
              <Image source={business.image} style={{ width: "100%", height: 150, borderRadius: 10, marginTop: 10 }} />
            )}

            {/* Description & Address */}
            <Text style={{ fontSize: 16, color: "white", marginTop: 10 }}>{business.category}</Text>
            <Text style={{ fontSize: 16, color: "white", marginTop: 5 }}>{business.price}</Text>
            <Text style={{ fontSize: 14, color: "white", marginTop: 5 }}>{business.address}</Text>

           {/* Chat Button */}
           <TouchableOpacity
              style={{ backgroundColor: "#db7a80", padding: 14, borderRadius: 5, width: "100%", justifyContent: "center", alignItems: "center", marginTop: 10 }}
              onPress={() =>
                navigation.navigate("Chatroom", {
                  businessName: business.name,
                  businessProfile: business.profile,
                })
              }
            >
              <Text style={{ fontSize: 16, color: "#fff", textAlign: "center" }}>Chat Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* Floating Button */}
      <TouchableOpacity 
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#db7a80",
          padding: 15,
          width: 55,
          height: 55,
          borderRadius: 60,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => console.log("Floating button pressed")}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Business;