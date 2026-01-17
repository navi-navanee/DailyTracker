import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHabits, saveHabits, addHabit, updateHabitInStorage, deleteHabitFromStorage } from './storage';

// Helper to cast mocks
const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('storage utils', () => {
  const mockHabit: any = { 
    id: '1', 
    name: 'Run', 
    icon: 'run', 
    iconType: 'material', 
    color: 'blue', 
    completedDates: [] 
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHabits', () => {
    it('returns empty array if no data', async () => {
      mockedGetItem.mockResolvedValue(null);
      const habits = await getHabits();
      expect(habits).toEqual([]);
    });

    it('returns parsed habits if data exists', async () => {
      const mockHabits = [mockHabit];
      mockedGetItem.mockResolvedValue(JSON.stringify(mockHabits));
      const habits = await getHabits();
      expect(habits).toEqual(mockHabits);
    });
  });

  describe('saveHabits', () => {
    it('saves habits to AsyncStorage', async () => {
      const mockHabits = [mockHabit];
      await saveHabits(mockHabits);
      expect(mockedSetItem).toHaveBeenCalledWith('@habits_data', JSON.stringify(mockHabits));
    });
  });

  describe('addHabit', () => {
    it('adds a new habit to existing habits', async () => {
      const existingHabits = [mockHabit];
      const newHabit: any = { ...mockHabit, id: '2', name: 'Read' };
      mockedGetItem.mockResolvedValue(JSON.stringify(existingHabits));

      await addHabit(newHabit);

      const expectedHabits = [...existingHabits, newHabit];
      expect(mockedSetItem).toHaveBeenCalledWith('@habits_data', JSON.stringify(expectedHabits));
    });
  });

  describe('updateHabitInStorage', () => {
    it('updates an existing habit', async () => {
      const existingHabits = [mockHabit];
      const updatedHabit = { ...mockHabit, name: 'Run Fast' };
      mockedGetItem.mockResolvedValue(JSON.stringify(existingHabits));

      await updateHabitInStorage(updatedHabit);

      expect(mockedSetItem).toHaveBeenCalledWith('@habits_data', JSON.stringify([updatedHabit]));
    });
  });

  describe('deleteHabitFromStorage', () => {
    it('deletes a habit by id', async () => {
      const habit2 = { ...mockHabit, id: '2', name: 'Read' };
      const existingHabits = [mockHabit, habit2];
      mockedGetItem.mockResolvedValue(JSON.stringify(existingHabits));

      await deleteHabitFromStorage('1');

      const expectedHabits = [habit2];
      expect(mockedSetItem).toHaveBeenCalledWith('@habits_data', JSON.stringify(expectedHabits));
    });
  });
});
