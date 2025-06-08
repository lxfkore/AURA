import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";
 
const FertilityMap = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 4.625339,
    longitude: 101.106729,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState({ x: 0, y: 0 });
  const [fertilityCenters, setFertilityCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [searchText, setSearchText] = useState("");
 
  const mapRef = useRef(null);
 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
 
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
 
      fetchNearbyCenters(currentLocation.coords.latitude, currentLocation.coords.longitude);
    })();
  }, []);
 
  const fetchNearbyCenters = async (latitude, longitude) => {
    try {
      const response = await fetch(`http://192.168.0.102:5000/api/fertility-centers-nearby?latitude=${latitude}&longitude=${longitude}&radius=10`);
      const data = await response.json();
      setFertilityCenters(data);
      if (data.length > 0) {
        setSelectedCenter(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch nearby fertility centers:", error);
    }
  };
 
  const searchCentersByName = async (name) => {
    if (!name) {
      // If search is empty, fetch nearby centers again
      if (location) {
        fetchNearbyCenters(location.latitude, location.longitude);
      }
      return;
    }
    try {
      const response = await fetch(`http://192.168.0.102:5000/api/fertility-centers/search?name=${encodeURIComponent(name)}`);
      const data = await response.json();
      setFertilityCenters(data);
      if (data.length > 0) {
        const firstCenter = data[0];
        const newRegion = {
          latitude: firstCenter.coordinates.latitude,
          longitude: firstCenter.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        setSelectedCenter(firstCenter);
      }
    } catch (error) {
      console.error("Failed to search fertility centers:", error);
    }
  };
 
  const handleSearchChange = (text) => {
    setSearchText(text);
    searchCentersByName(text);
  };
 
  const openInMaps = () => {
    if (!selectedCenter) return;
    const { latitude, longitude } = selectedCenter.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };
 
  const handleLocateUser = async () => {
    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      fetchNearbyCenters(currentLocation.coords.latitude, currentLocation.coords.longitude);
    } catch (error) {
      console.error("Failed to get user location:", error);
    }
  };
 
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMenuVisible(!menuVisible)}
          onLayout={(event) => {
            const { x, y } = event.nativeEvent.layout;
            setMenuButtonPosition({ x, y });
          }}
        >
          <FontAwesome name="bars" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLocateUser}>
          <FontAwesome name="location-arrow" size={24} color="black" />
        </TouchableOpacity>
      </View>
 
      {menuVisible && (
        <MenuBar
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          menuButtonPosition={menuButtonPosition}
          navigation={navigation}
        />
      )}
 
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search fertility centers by name"
          value={searchText}
          onChangeText={handleSearchChange}
          clearButtonMode="while-editing"
        />
      </View>
 
      {/* Map View */}
      <MapView ref={mapRef} style={styles.map} region={region}>
        {fertilityCenters.map(center => (
          <Marker
            key={center.id}
            coordinate={center.coordinates}
            title={center.name}
            pinColor="#db7a80"
            onPress={() => setSelectedCenter(center)}
          />
        ))}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            pinColor="black"
          />
        )}
      </MapView>
 
      {/* Bottom Card */}
      {selectedCenter && (
        <View style={styles.card}>
          <Text style={styles.name}>
            {selectedCenter.name}{" "}
            <Text style={styles.rating}>{selectedCenter.rating} ★</Text>
          </Text>
          <View style={styles.cardContent}>
            <Image source={{ uri: selectedCenter.image }} style={styles.image} />
            <Text style={styles.address}>{selectedCenter.address}</Text>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
 
export default FertilityMap;
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    position: "absolute",
    top: 50,
    zIndex: 10,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  searchContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  map: {
    flex: 1,
    zIndex: 1,
  },
  card: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  rating: {
    color: "#f7b733",
    fontWeight: "bold",
  },
  cardContent: {
    flexDirection: "row",
    marginTop: 8,
    gap: 10,
  },
  image: {
    width: 90,
    height: 70,
    borderRadius: 6,
  },
  address: {
    flex: 1,
    fontSize: 13,
  },
  mapButton: {
    backgroundColor: "#db7a80",
    marginTop: 10,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  mapButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});