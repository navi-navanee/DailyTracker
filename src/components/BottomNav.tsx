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
          testID="tab-home"
          style={[styles.btn, activeTab === 'Home' && styles.activeBtn]}
          onPress={() => onTabPress('Home')}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={activeTab === 'Home' ? "black" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-grid"
          style={[styles.btn, activeTab === 'Grid' && styles.activeBtn]}
          onPress={() => onTabPress('Grid')}
        >
          <Ionicons
            name="grid-outline"
            size={24}
            color={activeTab === 'Grid' ? "black" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-menu"
          style={[styles.btn, activeTab === 'Menu' && styles.activeBtn]}
          onPress={() => onTabPress('Menu')}
        >
          <Ionicons
            name="options-outline"
            size={24}
            color={activeTab === 'Menu' ? "black" : "#666"}
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
