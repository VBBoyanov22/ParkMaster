import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || '',
          email: user.email || '',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to fetch user data');
    }
  };

  const handleReauthenticate = async (user: User) => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error: any) {
      console.error('Reauthentication error:', error);
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Incorrect password. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to verify credentials. Please try again.');
      }
      return false;
    }
  };

  const handleUpdateProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      router.replace('/login');
      return;
    }

    if (!userData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      // Update name in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: userData.name,
      });

      // Only handle password update if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          Alert.alert('Error', 'New password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const isReauthenticated = await handleReauthenticate(user);
        if (!isReauthenticated) {
          setIsLoading(false);
          return;
        }

        await updatePassword(user, newPassword);
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      setNewPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to update your profile';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect password. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#fff" />
            <Text style={styles.title}>Profile Settings</Text>
            <Text style={styles.subtitle}>{userData.email}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={24} color="#2196F3" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                placeholder="Name"
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                editable={isEditing}
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={24} color="#2196F3" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="Email"
                value={userData.email}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
              <MaterialCommunityIcons name="lock" size={20} color="#666" style={styles.lockIcon} />
            </View>
          </View>

          {isEditing && (
            <View style={[styles.card, styles.securityCard]}>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock" size={24} color="#2196F3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Current Password (required for password change)"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-reset" size={24} color="#2196F3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password (optional)"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isEditing ? styles.saveButton : styles.editButton]}
              onPress={handleUpdateProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "account-edit"} 
                    size={24} 
                    color="#fff" 
                    style={styles.buttonIcon} 
                  />
                  <Text style={styles.buttonText}>
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 20,
    paddingBottom: 20,
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  form: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  securityCard: {
    marginTop: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  lockIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputDisabled: {
    opacity: 0.7,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    marginTop: 8,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  signOutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});