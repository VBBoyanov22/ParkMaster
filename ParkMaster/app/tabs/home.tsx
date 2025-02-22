import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomePage() {
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUserData() {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFullName(userDoc.data().name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setFullName('User');
      }
    }

    fetchUserData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{fullName}! 👋</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard}>
            <MaterialCommunityIcons name="car-parking-lights" size={32} color="#2196F3" />
            <Text style={styles.actionTitle}>Find Parking</Text>
            <Text style={styles.actionSubtitle}>Locate available spots</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MaterialCommunityIcons name="ticket-confirmation" size={32} color="#2196F3" />
            <Text style={styles.actionTitle}>My Tickets</Text>
            <Text style={styles.actionSubtitle}>View active tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MaterialCommunityIcons name="history" size={32} color="#2196F3" />
            <Text style={styles.actionTitle}>History</Text>
            <Text style={styles.actionSubtitle}>Past parkings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MaterialCommunityIcons name="account" size={32} color="#2196F3" />
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionSubtitle}>Manage account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.emptyText}>No recent parking activity</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.9,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: -30,
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});