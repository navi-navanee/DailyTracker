import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getLocalDateString } from '../utils/dateUtils';
import { Habit } from '../types';

interface HabitWeeklyItemProps {
    habit: Habit;
    onToggleDate: (id: string, date: string) => void;
    onLongPress: (id: string) => void;
    onMenuPress?: (habit: Habit, position: { x: number, y: number }) => void;
}

export default function HabitWeeklyItem({ habit, onToggleDate, onLongPress, onMenuPress }: HabitWeeklyItemProps) {
    const moreRef = React.useRef<React.ElementRef<typeof TouchableOpacity>>(null);
    const today = new Date();

    // Generate current week dates (Mon - Sun)
    const weekDates = useMemo(() => {
        const dates = [];
        const currentDay = today.getDay(); // 0=Sun, 1=Mon
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, []);

    const isCompleted = (dateStr: string) => {
        return habit.completedDates.some(d => d.startsWith(dateStr));
    };

    const getDayLabel = (date: Date) => {
        const days = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
        return days[date.getDay()];
    };

    return (
        <View style={[styles.container, { borderColor: habit.color || '#333' }]}>
            {/* Header Section */}
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
                        <View style={styles.statsRow}>
                            <MaterialCommunityIcons name="fire" size={14} color={colors.palette[1]} />
                            <Text style={styles.streak}> Streak: {habit.streak || 0}</Text>
                            <Text style={styles.dot}> • </Text>
                            <Text style={styles.daysCount}>
                                {/* Calculate completions this week */}
                                {habit.completedDates.filter(d => {
                                    const startOfWeek = weekDates[0].toISOString().split('T')[0];
                                    const endOfWeek = weekDates[6].toISOString().split('T')[0];
                                    return d >= startOfWeek && d <= endOfWeek;
                                }).length}/7 days
                            </Text>
                        </View>
                    </View>
                </View>

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

            {/* Week Row Section */}
            <View style={styles.weekRow}>
                {weekDates.map((date, index) => {
                    const dateStr = getLocalDateString(date);
                    const completed = isCompleted(dateStr);
                    const isToday = dateStr === getLocalDateString(today);
                    const isFuture = date > today && !isToday; // Don't allow future clicks

                    return (
                        <View key={dateStr} style={styles.dayColumn}>
                            <Text style={[styles.dayLabel, isToday && { color: colors.white, fontWeight: 'bold' }]}>
                                {getDayLabel(date)}
                            </Text>
                            <TouchableOpacity
                                disabled={isFuture}
                                activeOpacity={0.7}
                                onPress={() => onToggleDate(habit.id, dateStr)}
                                style={[
                                    styles.checkbox,
                                    completed && { backgroundColor: habit.color || colors.primary, borderColor: habit.color || colors.primary },
                                    isToday && !completed && { borderColor: '#fff' }, // Highlight today
                                ]}
                            >
                                {habit.type === 'time' ? (
                                    completed && (
                                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                                            {habit.progress?.[dateStr]
                                                ? (habit.progress[dateStr] / 60).toFixed(1) + 'h'
                                                : ''}
                                        </Text>
                                    )
                                ) : (
                                    completed && <Ionicons name="checkmark" size={20} color="#000" />
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E1E1E',
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
        marginBottom: 20,
        paddingRight: 4,
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
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streak: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    dot: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    daysCount: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    moreBtn: {
        padding: 4,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    dayLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    checkbox: {
        width: 36, // Large checkbox as per screenshot
        height: 36,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});
