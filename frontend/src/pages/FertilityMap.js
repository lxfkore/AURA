import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import MenuBar from "../components/MenuBar";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

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

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const fertilityCenter = {
    name: "Sunfert Ipoh",
    rating: 4.8,
    address:
      "No 2-35G & 2-36G, Festival Walk @ Ipoh, Jalan Medan Ipoh 1, Medan Ipoh Bistari, 31400 Ipoh, Perak",
    coordinates: {
      latitude: 4.625339,
      longitude: 101.106729,
    },
    image:
      "https://lh5.googleusercontent.com/p/AF1QipPo6g4lSmqz_SauSL-q_NLNFMi06gh0UIqu9n0x=w408-h306-k-no",
  };

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
    })();
  }, []);

  const openInMaps = () => {
    const { latitude, longitude } = fertilityCenter.coordinates;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleSearchPress = () => {
    if (autocompleteRef.current) {
      autocompleteRef.current.focus();
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
        <TouchableOpacity>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          ref={autocompleteRef}
          placeholder="Search fertility centers"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details?.geometry?.location) {
              const { lat, lng } = details.geometry.location;
              const newRegion = {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
              setRegion(newRegion);
              mapRef.current?.animateToRegion(newRegion, 1000);
            }
          }}
          query={{
            key: "AIzaSyDXO_-3hJN8TJ2ZREw8X6hGUyUY6TLHgfc", // replace with your API key
            language: "en",
            types: "establishment",
            keyword: "fertility center",
            location: `${region.latitude},${region.longitude}`,
            radius: 10000,
          }}
          styles={{
            textInputContainer: {
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 20,
              paddingLeft: 10,
              paddingRight: 5,
              borderColor: "#ccc",
              borderWidth: 1,
              height: 40,
            },
            textInput: {
              flex: 1,
              fontSize: 14,
              borderRadius: 20,
              paddingLeft: 10,
              paddingVertical: 5,
            },
            listView: {
              backgroundColor: "#fff",
              marginTop: 2,
              borderRadius: 10,
            },
          }}
          nearbyPlacesAPI="GooglePlacesSearch"
          debounce={300}
        />
        <TouchableOpacity onPress={handleSearchPress} style={styles.searchIconWrapper}>
          <FontAwesome name="search" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <MapView ref={mapRef} style={styles.map} region={region}>
        <Marker
          coordinate={fertilityCenter.coordinates}
          title={fertilityCenter.name}
          pinColor="red"
        />
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}
      </MapView>

      {/* Bottom Card */}
      <View style={styles.card}>
        <Text style={styles.name}>
          {fertilityCenter.name}{" "}
          <Text style={styles.rating}>{fertilityCenter.rating} ★</Text>
        </Text>
        <View style={styles.cardContent}>
          <Image source={{ uri: fertilityCenter.image }} style={styles.image} />
          <Text style={styles.address}>{fertilityCenter.address}</Text>
        </View>
        <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
          <Text style={styles.mapButtonText}>Open in Maps</Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconWrapper: {
    marginLeft: 5,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
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
