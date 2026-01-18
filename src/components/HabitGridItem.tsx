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
  onAddLog?: (habit: Habit) => void;
}

export default function HabitGridItem({ habit, onToggle, onLongPress, onMenuPress, onGridPress, onAddLog }: HabitGridItemExtendedProps) {
  const moreRef = React.useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const today = new Date();

  // Helper to get start of week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  // Generate date range based on history (Standard Heatmap)
  const weeks = React.useMemo(() => {
    // ... (Keep existing logic for standard heatmap if needed, or we can separate)
    // For now, let's keep the logic for standard heatmap but wrapped or just unused if time grid
    // Actually, let's just leave it as is for non-time habits

    // Find earliest completion date
    let earliestDate = new Date();
    if (habit.completedDates && habit.completedDates.length > 0) {
      habit.completedDates.forEach(d => {
        const date = new Date(d);
        if (date < earliestDate) earliestDate = date;
      });
    }

    // Default to at least 52 weeks ago
    const minWeeks = 52;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksDiff = Math.ceil((today.getTime() - earliestDate.getTime()) / msPerWeek);
    const totalWeeks = Math.max(minWeeks, weeksDiff + 1);

    const result = [];
    const currentWeekMonday = getStartOfWeek(today);

    for (let w = 0; w < totalWeeks; w++) {
      const weekDates = [];
      const mondayOfThisWeek = new Date(currentWeekMonday);
      mondayOfThisWeek.setDate(currentWeekMonday.getDate() - (totalWeeks - 1 - w) * 7);

      for (let d = 0; d < 7; d++) {
        const date = new Date(mondayOfThisWeek);
        date.setDate(mondayOfThisWeek.getDate() + d);
        weekDates.push(getLocalDateString(date));
      }
      result.push(weekDates);
    }
    return result;
  }, [habit.completedDates]);

  // Generate LAST 7 WEEKS for Time Grid
  const timeGridData = React.useMemo(() => {
    if (habit.type !== 'time') return null;

    const result = [];
    const currentWeekMonday = getStartOfWeek(today);

    // Generate last 7 weeks (current week + 6 previous weeks)
    // Order: Oldest week -> Current week (Left to Right)
    for (let w = 6; w >= 0; w--) {
      const weekMonday = new Date(currentWeekMonday);
      weekMonday.setDate(currentWeekMonday.getDate() - (w * 7));

      const weekDays = [];
      let weekTotal = 0;

      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(weekMonday);
        dayDate.setDate(weekMonday.getDate() + d);
        const dateStr = getLocalDateString(dayDate);
        const val = habit.progress?.[dateStr] || 0;
        weekTotal += val;
        weekDays.push({ date: dateStr, value: val });
      }
      result.push({ days: weekDays, total: weekTotal });
    }
    return result;
  }, [habit.progress, habit.type]);

  const isCompleted = (dateStr: string) => {
    return habit.completedDates.some(d => d.startsWith(dateStr));
  };

  const todayStr = getLocalDateString(today);
  const isCompletedToday = isCompleted(todayStr);

  const renderStandardHeatmap = () => (
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
                    dateStr === todayStr && !completed && { borderWidth: 1, borderColor: '#555' }
                  ]}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTimeGrid = () => {
    if (!timeGridData) return null;

    const rowLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total'];

    return (
      <View style={styles.timeGridWrapper}>
        {/* Row Labels Column */}
        <View style={styles.timeGridLabelsColumn}>
          {rowLabels.map((label, index) => (
            <View key={label} style={[styles.timeGridCell, styles.labelCell]}>
              <Text style={[
                styles.labelText,
                label === 'Total' && styles.totalLabelText,
                // Highlight "Total" row slightly
              ]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Data Columns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeGridScrollContent}
        >
          {timeGridData.map((week, wIndex) => (
            <View key={wIndex} style={styles.timeGridColumn}>
              {week.days.map((day, dIndex) => {
                const isToday = day.date === todayStr;
                const hasValue = day.value > 0;

                return (
                  <TouchableOpacity
                    key={day.date}
                    activeOpacity={0.7}
                    onPress={() => onGridPress && onGridPress(habit, day.date)}
                    style={[
                      styles.timeGridCell,
                      styles.dataCell,
                      hasValue && { backgroundColor: (habit.color || colors.primary) + '40' }, // 40 = 25% opacity approx
                      hasValue && { borderColor: habit.color || colors.primary, borderWidth: 1 },
                      isToday && !hasValue && { borderWidth: 1, borderColor: colors.white }
                    ]}
                  >
                    <Text style={[
                      styles.cellValueText,
                      hasValue ? { color: colors.white, fontWeight: 'bold' } : { color: colors.textSecondary }
                    ]}>
                      {(day.value / 60).toFixed(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* Weekly Total Cell */}
              <View style={[
                styles.timeGridCell,
                styles.totalCell,
                week.total > 0 ? { backgroundColor: (habit.color || colors.primary) } : { backgroundColor: '#2C2C2E' }
              ]}>
                <Text style={styles.totalValueText}>{(week.total / 60).toFixed(1)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

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
            onPress={() => {
              if (habit.type === 'time' && onAddLog) {
                onAddLog(habit);
              } else {
                onToggle(habit.id);
              }
            }}
          >
            <MaterialCommunityIcons
              name={habit.type === 'time' ? "plus" : "check"}
              size={24}
              color={isCompletedToday ? colors.black : colors.textSecondary}
            />
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

      {/* Render the appropriate grid based on habit type */}
      {habit.type === 'time' ? renderTimeGrid() : renderStandardHeatmap()}

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
    paddingRight: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  weekColumn: {
    gap: 3,
    marginRight: 3,
  },
  dayBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#2C2C2E',
  },

  // Time Grid Styles
  timeGridWrapper: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timeGridLabelsColumn: {
    width: 40,
    marginRight: 8,
    gap: 4,
  },
  timeGridScrollContent: {
    gap: 4,
    paddingRight: 16,
  },
  timeGridColumn: {
    gap: 4,
  },
  timeGridCell: {
    width: 45,
    height: 25,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelCell: {
    width: 40,
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  labelText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  totalLabelText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  dataCell: {
    // defaults
  },
  totalCell: {
    // highlighted background set inline
  },
  cellValueText: {
    fontSize: 10,
  },
  totalValueText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
