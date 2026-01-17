import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function CalendarStrip() {
  const dates = [];
  const today = new Date();

  // Generate last 7 days (including today)
  // We want the last one to be today. So loop 0 to 6 backwards?
  // Screenshot shows 7 items. The last one is Today.
  // Let's generate [Today-6, Today-5, ..., Today]

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  const getDayName = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerDate}>
          {today.toLocaleDateString('en-US', { weekday: 'long' })}, {today.getDate()} {today.toLocaleDateString('en-US', { month: 'short' })}
        </Text>
        <View style={styles.headerIcons}>
          {/* Placeholders for icons in screenshot if needed, or just empty for now */}
          {/* The screenshot shows some cloud/lock icons, ignoring for now as per plan focus */}
        </View>
      </View>

      <View style={styles.strip}>
        {dates.map((date, index) => {
          const todayItem = isToday(date);
          return (
            <View key={index} testID={`date-item-${index}`} style={styles.dayItem}>
              {todayItem ? (
                <Text style={[styles.dayText, styles.todayText]}>Today</Text>
              ) : (
                <Text style={styles.dayText}>{getDayName(date)}</Text>
              )}

              <View style={[styles.dateCircle, todayItem && styles.todayDateCircle]}>
                {todayItem ? (
                  <Text style={[styles.dateText, styles.todayDateText]}>0/2</Text> // Hardcoded for match screenshot style initially
                ) : (
                  <Text style={styles.dateText}>{date.getDate()}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerDate: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    width: 40,
  },
  dayText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  todayItem: {
    // Optional: add specific background or visual distinction for today's container
  },
  todayText: {
    color: colors.primaryGreen,
    fontWeight: 'bold',
  },
  dateCircle: {
    width: 40,
    height: 45, // Slightly rectangular/rounded per screenshot
    borderRadius: 12,
    backgroundColor: '#1E1E1E', // Darker gray bg
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  todayDateCircle: {
    borderColor: colors.primaryGreen, // Green glow
    backgroundColor: '#1E1E1E',
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  todayDateText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
