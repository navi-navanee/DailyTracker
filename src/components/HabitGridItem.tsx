import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { Habit } from '../types';

interface HabitGridItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onLongPress: (id: string) => void;
}

export default function HabitGridItem({ habit, onToggle, onLongPress }: HabitGridItemProps) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const todayStr = today.toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.some(date =>
    date.startsWith(todayStr)
  );

  const isDateCompleted = (day: number) => {
    // Construct date string YYYY-MM-DD
    // Note: Month is 0-indexed in JS Date, but we need 01-12 for string
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateToCheck = `${currentYear}-${monthStr}-${dayStr}`;

    return habit.completedDates.some(completedDate =>
      completedDate.startsWith(dateToCheck)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <View style={[styles.iconContainer, { backgroundColor: (habit.color || colors.primary) + '20' }]}>
            {habit.iconType === 'emoji' ? (
              <Text style={styles.emojiIcon}>{habit.icon}</Text>
            ) : (
              <MaterialCommunityIcons
                name={(habit.icon || 'dumbbell') as any}
                size={24}
                color={habit.color || colors.primary}
              />
            )}
          </View>
          <View>
            <Text style={styles.name}>{habit.name}</Text>
            <Text style={styles.streak}>
              <MaterialCommunityIcons name="fire" size={14} color={colors.palette[1]} />
              {' '}Streak: {habit.streak || 0}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            testID={`grid-check-btn-${habit.id}`}
            style={[styles.checkBtn, isCompletedToday && styles.checkedBtn]}
            onPress={() => onToggle(habit.id)}
          >
            <MaterialCommunityIcons name="check" size={20} color={isCompletedToday ? colors.black : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreBtn} onPress={() => onLongPress && onLongPress(habit.id)}>
            <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {days.map(day => {
          const completed = isDateCompleted(day);
          return (
            <View
              key={day}
              style={[
                styles.gridBox,
                completed && { backgroundColor: habit.color || colors.primary }
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E', // Dark surface
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiIcon: {
    fontSize: 22,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streak: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkedBtn: {
    backgroundColor: colors.primaryGreen,
  },
  moreBtn: {
    padding: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4, // React Native 0.71+ supports gap
  },
  gridBox: {
    width: 14, // Roughly calculated for ~30 items in width
    height: 24, // Taller boxes as per screenshot
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    // margin: 2, // usage of gap above
  },
});
