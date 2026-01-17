import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getLocalDateString } from '../utils/dateUtils';
import { Habit } from '../types';


interface HabitGridItemProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onLongPress: (id: string) => void;
}

// Define extended props type
interface HabitGridItemExtendedProps extends HabitGridItemProps {
  onMenuPress?: (habit: Habit, position: { x: number, y: number }) => void;
  onGridPress?: (habit: Habit, date?: string) => void;
}

export default function HabitGridItem({ habit, onToggle, onLongPress, onMenuPress, onGridPress }: HabitGridItemExtendedProps) {
  const moreRef = React.useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const today = new Date();

  // Generate last 20 weeks of data
  const weeks = React.useMemo(() => {
    const result = [];

    // We want 20 weeks ending with the current week (Sunday)
    // Find the Monday of the current week (or future Monday if today is Sunday??)
    // Actually standard is Mon-Sun
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() + diffToMonday);

    // We want 20 weeks ending with the current week
    for (let w = 0; w < 20; w++) {
      const weekDates = [];
      const mondayOfThisWeek = new Date(currentWeekMonday);
      mondayOfThisWeek.setDate(currentWeekMonday.getDate() - (19 - w) * 7);

      for (let d = 0; d < 7; d++) {
        const date = new Date(mondayOfThisWeek);
        date.setDate(mondayOfThisWeek.getDate() + d);
        weekDates.push(getLocalDateString(date)); // Use local YYYY-MM-DD
      }
      result.push(weekDates);
    }
    return result;
  }, []);

  const isCompleted = (dateStr: string) => {
    return habit.completedDates.some(d => d.startsWith(dateStr));
  };

  const todayStr = getLocalDateString(today);
  const isCompletedToday = isCompleted(todayStr);

  return (
    <View style={[styles.container, { borderColor: habit.color || '#333' }]}>

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
          <TouchableOpacity
            ref={moreRef}
            style={styles.moreBtn}
            onPress={() => {
              moreRef.current?.measureInWindow((x, y, width, height) => {
                if (onMenuPress) {
                  onMenuPress(habit, { x, y: y + height });
                } else if (onLongPress) {
                  onLongPress(habit.id);
                }
              });
            }}
          >
            <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Heatmap Grid: Columns of Weeks */}
      {/* Heatmap Grid: Columns of Weeks */}
      <View style={styles.heatmapContainer}>
        {weeks.map((week, wIndex) => (
          <View key={wIndex} style={styles.weekColumn}>
            {week.map((dateStr, dIndex) => {
              const completed = isCompleted(dateStr);
              return (
                <TouchableOpacity
                  key={dateStr}
                  activeOpacity={0.7}
                  onPress={() => onGridPress && onGridPress(habit, dateStr)}
                  style={[
                    styles.dayBox,
                    completed && { backgroundColor: habit.color || colors.primary },
                    // Highlight today ?
                    dateStr === todayStr && !completed && { borderWidth: 1, borderColor: '#555' }
                  ]}
                />
              );
            })}
          </View>
        ))}
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
  heatmapContainer: {
    flexDirection: 'row',
    // Screenshot has "Sun Mon Tue..." and grid. It looks like standard contribution graph: Left (past) -> Right (Today).
    // Just flex-start is fine if we start 20 weeks ago.
    justifyContent: 'space-between',
    // We need to fit 20 weeks. 
    // Screen width ~375. 20 columns. 375/20 = ~18px per column.
    // Each box ~12px? + Gap 2px.
  },
  weekColumn: {
    gap: 3,
  },
  dayBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#2C2C2E',
  },
});
