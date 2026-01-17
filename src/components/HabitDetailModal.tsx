import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { getLocalDateString } from '../utils/dateUtils';
import { Habit } from '../types';

interface HabitDetailModalProps {
    visible: boolean;
    onClose: () => void;
    habit: Habit | null;
    onToggleDate: (habitId: string, date: string) => void;
    initialDate?: string;
}

export default function HabitDetailModal({ visible, onClose, habit, onToggleDate, initialDate }: HabitDetailModalProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    React.useEffect(() => {
        if (visible) {
            if (initialDate) {
                setCurrentDate(new Date(initialDate));
            } else {
                setCurrentDate(new Date());
            }
        }
    }, [visible, initialDate]);

    if (!habit) return null;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // First day of the month (0-6, Sun-Sat)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust to Mon-Sun (Mon=0, Sun=6)
    const startingDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const isCompleted = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = getLocalDateString(date);
        return habit.completedDates.some(d => d.startsWith(dateStr));
    };

    const toggleDate = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = getLocalDateString(date);
        onToggleDate(habit.id, dateStr);
    };

    const renderCalendar = () => {
        const totalSlots = daysInMonth + startingDayIndex;
        const rows = Math.ceil(totalSlots / 7);
        const grid = [];

        let dayCounter = 1;

        for (let i = 0; i < rows; i++) {
            const rowItems = [];
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < startingDayIndex) {
                    rowItems.push(<View key={`empty-${j}`} style={styles.emptyDay} />);
                } else if (dayCounter <= daysInMonth) {
                    const day = dayCounter;
                    const date = new Date(currentYear, currentMonth, day);
                    const dateStr = getLocalDateString(date);
                    const todayStr = getLocalDateString(new Date());

                    const isFuture = dateStr > todayStr;
                    const completed = isCompleted(day);

                    rowItems.push(
                        <TouchableOpacity
                            key={day}
                            disabled={isFuture}
                            style={[
                                styles.dayCell,
                                completed && { backgroundColor: habit.color || colors.primary },
                                isFuture && styles.disabledDay
                            ]}
                            onPress={() => toggleDate(day)}
                        >
                            <Text style={[
                                styles.dayText,
                                completed && { color: colors.background },
                                isFuture && styles.disabledDayText
                            ]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    );
                    dayCounter++;
                } else {
                    rowItems.push(<View key={`empty-end-${j}`} style={styles.emptyDay} />);
                }
            }
            grid.push(<View key={i} style={styles.row}>{rowItems}</View>);
        }
        return grid;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{habit.name}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={handlePrevMonth}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
                        <TouchableOpacity onPress={handleNextMonth}>
                            <Ionicons name="chevron-forward" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekHeaders}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <Text key={day} style={styles.weekHeaderText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {renderCalendar()}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 500,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthTitle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    weekHeaders: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    weekHeaderText: {
        color: colors.textSecondary,
        width: 40,
        textAlign: 'center',
        fontSize: 12,
    },
    calendarGrid: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#2C2C2E',
    },
    emptyDay: {
        width: 40,
        height: 40,
    },
    dayText: {
        color: colors.text,
        fontSize: 14,
    },
    disabledDay: {
        opacity: 0.3,
    },
    disabledDayText: {
        color: colors.textSecondary,
    },
});
