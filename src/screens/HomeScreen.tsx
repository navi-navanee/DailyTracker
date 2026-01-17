import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getHabits, updateHabitInStorage, deleteHabitFromStorage } from '../utils/storage';
import HabitItem from '../components/HabitItem';
import CalendarStrip from '../components/CalendarStrip';
import BottomNav from '../components/BottomNav';

import HabitGridItem from '../components/HabitGridItem';
import HabitOptionsModal from '../components/HabitOptionsModal';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Habit } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [habits, setHabits] = useState<Habit[]>([]);
  /* ... existing code ... */
  const [activeTab, setActiveTab] = useState('Grid');

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const loadHabits = async () => {
    const loadedHabits = await getHabits();
    setHabits(loadedHabits.reverse());
  };

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  const toggleHabit = async (id: string) => {
    const habitToUpdate = habits.find(h => h.id === id);
    if (!habitToUpdate) return;

    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habitToUpdate.completedDates.some(date =>
      date.startsWith(today)
    );

    let newCompletedDates;
    if (isCompletedToday) {
      newCompletedDates = habitToUpdate.completedDates.filter(date =>
        !date.startsWith(today)
      );
    } else {
      newCompletedDates = [...habitToUpdate.completedDates, new Date().toISOString()];
    }

    const updatedHabit = { ...habitToUpdate, completedDates: newCompletedDates };

    setHabits(prevHabits =>
      prevHabits.map(h => h.id === id ? updatedHabit : h)
    );

    await updateHabitInStorage(updatedHabit);
  };

  const handleOpenMenu = (habit: Habit, position: { x: number, y: number }) => {
    setSelectedHabitId(habit.id);
    setMenuPosition(position);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (!selectedHabitId) return;
    const habit = habits.find(h => h.id === selectedHabitId);
    if (habit) {
      navigation.navigate('AddHabit', { habit });
    }
  };

  const handleDelete = (id: string = selectedHabitId!) => {
    setMenuVisible(false); // Close menu if open
    if (!id) return;

    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const newHabits = await deleteHabitFromStorage(id);
            setHabits(newHabits.reverse());
            setSelectedHabitId(null);
          }
        }
      ]
    );
  };

  const renderContent = () => {
    if (habits.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Log Your Hours</Text>
          <Text style={styles.emptyText}>Reading, exercise, meditation — track time spent on what matters.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.addButtonText}>+ Add Habit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'Grid') {
      return (
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HabitGridItem
              habit={item}
              onToggle={toggleHabit}
              onLongPress={() => handleDelete(item.id)}
              onMenuPress={handleOpenMenu}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      );
    }

    // Default 'Home' view or other tabs
    return (
      <FlatList
        data={habits}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HabitItem
            habit={item}
            onToggle={toggleHabit}
            onLongPress={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <CalendarStrip />

      <View style={styles.content}>
        {renderContent()}

        {habits.length > 0 && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.navigate('AddHabit')}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />

      <HabitOptionsModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={() => handleDelete()}
        position={menuPosition}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for bottom nav
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 300,
  },
  addButton: {
    backgroundColor: colors.primaryGreen, // Updated to match design
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 15,
    elevation: 5,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  addButtonText: {
    color: colors.black,
    fontWeight: 'bold',
    fontSize: 18,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100, // Higher than bottom nav
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  floatingButtonText: {
    color: colors.black,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
