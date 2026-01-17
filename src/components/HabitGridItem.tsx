import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
  const scrollViewRef = React.useRef<ScrollView>(null);
  const today = new Date();

  // Generate date range based on history
  const weeks = React.useMemo(() => {
    // Find earliest completion date
    let earliestDate = new Date();
    if (habit.completedDates && habit.completedDates.length > 0) {
      habit.completedDates.forEach(d => {
        const date = new Date(d);
        if (date < earliestDate) earliestDate = date;
      });
    }

    // Default to at least 52 weeks (1 year) ago, or earlier if data exists
    const minWeeks = 52;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksDiff = Math.ceil((today.getTime() - earliestDate.getTime()) / msPerWeek);
    const totalWeeks = Math.max(minWeeks, weeksDiff + 1); // +1 buffer

    const result = [];

    // Calculate the Monday of the current week (standard Mon-Sun)
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() + diffToMonday);

    // Generate weeks from past to present
    for (let w = 0; w < totalWeeks; w++) {
      const weekDates = [];
      const mondayOfThisWeek = new Date(currentWeekMonday);
      // We go backwards from current week, but we want the array to be ordered Past -> Future ?
      // No, usually we generate Past -> Future 
      // Let's generate from (totalWeeks - 1) weeks ago up to 0 weeks ago
      mondayOfThisWeek.setDate(currentWeekMonday.getDate() - (totalWeeks - 1 - w) * 7);

      for (let d = 0; d < 7; d++) {
        const date = new Date(mondayOfThisWeek);
        date.setDate(mondayOfThisWeek.getDate() + d);
        weekDates.push(getLocalDateString(date));
      }
      result.push(weekDates);
    }
    return result;
  }, [habit.completedDates]); // Re-calc when completedDates change

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

      {/* Heatmap Grid: Scrollable Columns of Weeks */}
      <View style={styles.heatmapWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.heatmapContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
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
                      // Highlight today 
                      dateStr === todayStr && !completed && { borderWidth: 1, borderColor: '#555' }
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </ScrollView>
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
  heatmapWrapper: {
    height: 110, // Approx height for grid + padding
  },
  heatmapContainer: {
    paddingRight: 10, // Adding padding to the right end
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  weekColumn: {
    gap: 3,
    marginRight: 3, // Space between columns
  },
  dayBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#2C2C2E',
  },
});
