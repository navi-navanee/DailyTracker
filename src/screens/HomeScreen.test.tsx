import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { NavigationContainer } from '@react-navigation/native';

// Mock dependencies
jest.mock('../utils/storage', () => ({
    getHabits: jest.fn(() => Promise.resolve([])),
    updateHabitInStorage: jest.fn(),
    deleteHabitFromStorage: jest.fn(),
}));

jest.mock('../components/CalendarStrip', () => 'CalendarStrip');
jest.mock('../components/BottomNav', () => 'BottomNav');
jest.mock('../components/HabitOptionsModal', () => 'HabitOptionsModal');

describe('HomeScreen', () => {
    const mockNavigation: any = {
        navigate: jest.fn(),
    };

    const mockRoute: any = {};

    it('renders correctly', async () => {
        const { findByText } = render(
            <NavigationContainer>
                <HomeScreen navigation={mockNavigation} route={mockRoute} />
            </NavigationContainer>
        );

        // Expect empty state message which appears after habits load (empty array)
        // Using findByText to wait for the async state update from useFocusEffect -> loadHabits
        expect(await findByText('Log Your Hours')).toBeTruthy();
    });
});
