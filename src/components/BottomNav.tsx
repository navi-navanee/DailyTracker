import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
// Trying to stick to basic shapes if icons aren't perfectly matched, 
// using Ionicons as they are common in Expo
import { Ionicons } from '@expo/vector-icons';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        <TouchableOpacity
          testID="tab-time"
          style={[styles.btn, activeTab === 'Time' && styles.activeBtn]}
          onPress={() => onTabPress('Time')}
        >
          <Ionicons
            name="timer-outline"
            size={24}
            color={activeTab === 'Time' ? "black" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-checkmark"
          style={[styles.btn, activeTab === 'Checkmark' && styles.activeBtn]}
          onPress={() => onTabPress('Checkmark')}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={24}
            color={activeTab === 'Checkmark' ? "black" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-combined"
          style={[styles.btn, activeTab === 'Combined' && styles.activeBtn]}
          onPress={() => onTabPress('Combined')}
        >
          <Ionicons
            name="layers-outline"
            size={24}
            color={activeTab === 'Combined' ? "black" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30, // Floating slightly up
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E', // Dark background
    borderRadius: 30,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.primaryGreen + '40', // Semi-transparent green border
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  btn: {
    width: 60,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: colors.primaryGreen,
  },
});
