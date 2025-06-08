import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Linking } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";

const Business = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetch("http://192.168.0.102:5000/api/businesses")
      .then((response) => response.json())
      .then((data) => setBusinesses(data))
      .catch((error) => console.error("Error fetching businesses:", error));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 60,
        }}
      >
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
          <View
            key={business.id}
            style={{
              padding: 20,
              backgroundColor: "#000",
              borderRadius: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              marginBottom: 15,
            }}
          >
            {/* Profile & Business Name */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: -8 }}>
              <Image source={{ uri: business.profile_image_url }} style={{ width: 50, height: 50, borderRadius: 25 }} />
              <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10, color: "white" }}>{business.name}</Text>
            </View>

            {/* Business Image */}
            {business.main_image_url && (
              <Image source={{ uri: business.main_image_url }} style={{ width: "100%", height: 150, borderRadius: 10, marginTop: 10 }} />
            )}

            {/* Description & Address */}
            <Text style={{ fontSize: 16, color: "white", marginTop: 10 }}>{business.category}</Text>
            <Text style={{ fontSize: 16, color: "white", marginTop: 5 }}>{business.price}</Text>
            <Text style={{ fontSize: 14, color: "white", marginTop: 5 }}>{business.address}</Text>

            {/* Check Out Button */}
            <TouchableOpacity
              style={{ backgroundColor: "#db7a80", padding: 14, borderRadius: 5, width: "100%", justifyContent: "center", alignItems: "center", marginTop: 10 }}
              onPress={() => {
                if (business.website_url) {
                  Linking.openURL(business.website_url);
                } else if (business.whatsapp_number) {
                  const whatsappUrl = `https://wa.me/${business.whatsapp_number}`;
                  Linking.openURL(whatsappUrl);
                }
              }}
            >
              <Text style={{ fontSize: 16, color: "#fff", textAlign: "center", fontWeight: "bold" }}>Check Out</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

    </View>
  );
};

export default Business;
