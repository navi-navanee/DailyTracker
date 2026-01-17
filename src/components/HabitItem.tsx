import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import { Habit } from '../types';

interface HabitItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onLongPress: (id: string) => void;
}

export default function HabitItem({ habit, onToggle, onLongPress }: HabitItemProps) {
  const today = new Date().toISOString().split('T')[0];
  // Check if completed dates includes today (simple string match for now)
  // Refined Logic: Check if any date in the array matches today's YYYY-MM-DD
  const isCompletedToday = habit.completedDates.some(date =>
    date.startsWith(today)
  );

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onLongPress={() => onLongPress && onLongPress(habit.id)}
    >
      <View style={styles.info}>
        <View style={styles.titleRow}>
          {habit.iconType === 'emoji' ? (
            <Text style={styles.emojiIcon}>{habit.icon}</Text>
          ) : (
            <MaterialCommunityIcons
              name={(habit.icon || 'dumbbell') as any}
              size={24}
              color={habit.color || colors.primary}
              style={styles.icon}
            />
          )}
          <Text style={[styles.name, isCompletedToday && styles.completedName]}>
            {habit.name}
          </Text>
        </View>
        <Text style={styles.streak}>
          {habit.completedDates.length} days completed
          {/* Simple count for now, streak logic can be added later */}
        </Text>
      </View>

      <TouchableOpacity
        testID={`habit-checkbox-${habit.id}`}
        style={[styles.checkbox, isCompletedToday && styles.checkedCheckbox]}
        onPress={() => onToggle(habit.id)}
      >
        {isCompletedToday && <View style={styles.checkmark} />}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  emojiIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  completedName: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  streak: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  checkedCheckbox: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    width: 12,
    height: 6,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: colors.black,
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },
});
