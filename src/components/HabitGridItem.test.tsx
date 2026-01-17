import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HabitGridItem from './HabitGridItem';

describe('HabitGridItem', () => {
    const mockHabit = {
        id: '1',
        name: 'Workout',
        icon: 'dumbbell',
        iconType: 'material',
        color: 'red',
        streak: 5,
        completedDates: ['2023-10-25']
    };

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-10-25T12:00:00'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { getByText } = render(
            <HabitGridItem habit={mockHabit} onToggle={() => { }} onLongPress={() => { }} />
        );
        expect(getByText('Workout')).toBeTruthy();
        expect(getByText(/Streak: 5/)).toBeTruthy();
    });

    it('calls onToggle when check button is pressed', () => {
        const onToggleMock = jest.fn();
        const { getByTestId } = render(
            <HabitGridItem habit={mockHabit} onToggle={onToggleMock} onLongPress={() => { }} />
        );

        fireEvent.press(getByTestId(`grid-check-btn-${mockHabit.id}`));
        expect(onToggleMock).toHaveBeenCalledWith(mockHabit.id);
    });
});
