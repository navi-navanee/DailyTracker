import AsyncStorage from '@react-native-async-storage/async-storage';

import { Habit } from '../types';

const HABITS_KEY = '@habits_data';

export const getHabits = async (): Promise<Habit[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(HABITS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading habits', e);
    return [];
  }
};

export const saveHabits = async (habits: Habit[]) => {
  try {
    const jsonValue = JSON.stringify(habits);
    await AsyncStorage.setItem(HABITS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving habits', e);
  }
};

export const addHabit = async (habit: Habit) => {
  try {
    const existingHabits = await getHabits();
    const newHabits = [...existingHabits, habit];
    await saveHabits(newHabits);
    return newHabits;
  } catch (e) {
    console.error('Error adding habit', e);
    return [];
  }
};

export const updateHabitInStorage = async (updatedHabit: Habit) => {
  try {
    const existingHabits = await getHabits();
    const newHabits = existingHabits.map((habit) => 
      habit.id === updatedHabit.id ? updatedHabit : habit
    );
    await saveHabits(newHabits);
    return newHabits;
  } catch (e) {
    console.error('Error updating habit', e);
    return [];
  }
};

export const deleteHabitFromStorage = async (habitId: string) => {
  try {
    const existingHabits = await getHabits();
    const newHabits = existingHabits.filter(habit => habit.id !== habitId);
    await saveHabits(newHabits);
    return newHabits;
  } catch (e) {
    console.error('Error deleting habit', e);
    return [];
  }
};
