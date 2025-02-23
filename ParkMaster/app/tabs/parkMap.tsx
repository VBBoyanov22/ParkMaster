import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Image, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

interface ParkingSpot {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  description: string;
  occupied: 'available' | 'occupied' | 'myOccupied';
}

export default function ParkMap() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 42.4975, // Default to Burgas Bulgaria's approximate center
    longitude: 27.4716,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const router = useRouter();
  
  // Sample parking spots data
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([
    {
      id: '1',
      coordinate: {
        latitude: 42.68648,
        longitude: 26.34274,
      },
      title: 'Брилянтин Parking Spot',
      description: 'Available',
      occupied: 'available',
    },
    {
      id: '2',
      coordinate: {
        latitude: 42.5092,
        longitude: 27.48371,
      },
      title: 'Parking Spot 1',
      description: 'Occupied',
      occupied: 'occupied',
    },
    {
      id: '3',
      coordinate: {
        latitude: 42.4988,
        longitude: 27.4607,
      },
      title: '96 Ulitsa Parking Spot',
      description: 'Available',
      occupied: 'available',
    },
    {
      id: '4',
      coordinate: {
        latitude: 42.5000,
        longitude: 27.4756,
      },
      title: '83 Ulitsa Parking Spot',
      description: 'Available',
      occupied: 'available',
    },
    {
      id: '5',  
      coordinate: {
        latitude: 42.6474,
        longitude: 27.6815,
      },
      title: '28 Ulitsa Parking Spot',
      description: 'Available',
      occupied: 'available',
    },
    {
      id: '6',
      coordinate: {
        latitude: 42.45734,
        longitude: 27.40390,
      },
      title: '3 Ulitsa Kapche Parking Spot',
      description: 'Available',
      occupied: 'available',
    }
  ]);

  const mapRef = useRef<MapView>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const userLatitude = currentLocation.coords.latitude;
      const userLongitude = currentLocation.coords.longitude;

      // Filter parking spots within x meters
      const nearbySpots = parkingSpots.filter(spot => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          spot.coordinate.latitude,
          spot.coordinate.longitude
        );
        return distance <= 650;
      });

      setParkingSpots(nearbySpots);

      setRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    };

    fetchLocation();
  }, []);

  const onRegionChange = (newRegion: any) => {
    setRegion(newRegion);
  };

  const handleCenter = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0421,
        }, 600); // 600ms centering transition
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleNavigateToHome = () => {
    router.push('./home');
  }


  const handleNavigateToParkSpot = () => {
    // TO DO: implement navigation to parking spot
  };

  const handleNavigateToParkingHistory = () => {
    // TO DO: implement navigation to parking history
  };


  const handleMarkerPress = (spotId: string) => {
    const selectedSpot = parkingSpots.find((spot) => spot.id === spotId);
    if (selectedSpot && selectedSpot.occupied === 'available') {
      // Show popup with availability and option to park
        Alert.alert(
            selectedSpot.description,
            'Would you like to park here?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Park', onPress: () => handlePark(spotId) },
            ]
        );
    }
  };

  const handlePark = (spotId: string) => {
    setParkingSpots((prevSpots) =>
        prevSpots.map((spot) => {
            if (spot.id === spotId) {
                console.log(spot.occupied);
                return { ...spot, occupied: 'myOccupied' }; 
            }
            return spot;
        })
    );
    console.log(`Updated parking spots: `, parkingSpots); // Debugging log to see the updated spots
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleNavigateToHome} style={styles.backButton}>
          <Text style={{color: '#007AFF', fontSize: 34}}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ParkMap</Text>
        <Image source={require('../../assets/notFound404-logo-blue.png')} style={styles.logo} />
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={spot.coordinate}
            title={spot.title}
            description={spot.description}
            pinColor={
              spot.occupied === 'myOccupied' ? '#007AFF' :
              spot.occupied === 'occupied' ? 'red' :
              'green'
            }
            onPress={() => handleMarkerPress(spot.id)}
          />
        ))}
      </MapView>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={handleCenter} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require("../../assets/centerIcon.png")} style={{ width: 25, height: 25 , right: 12 }} />
          <Text style={styles.navbarButton1}>Center</Text>
        </TouchableOpacity>

        <View style={styles.line} />

        <TouchableOpacity onPress={handleNavigateToParkSpot} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require("../../assets/spotIcon.png")} style={{ width: 27, height: 25, right: 10 }} />
          <Text style={styles.navbarButton1}>Spot</Text>
        </TouchableOpacity>

        <View style={styles.line} />

        <TouchableOpacity onPress={handleNavigateToParkingHistory} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="history" size={25} color="#000" />  
        <Text style={styles.navbarButton2}>Parking History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    height: 60,
    top: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#000',
    fontWeight: 'bold',
    fontSize: 23,
    right: 20,
  },
  logo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 45,
    height: 45,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 125,
  },
  navbar: {
    height: 65,
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  navbarButton1: {
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#007AFF',
    fontSize: 18,
  },
  navbarButton2: {
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#007AFF',
    fontSize: 18,
  },
  line: {
    height: '100%',
    marginBottom: 0,
    width: 1,
    backgroundColor: '#ddd',
  },
});