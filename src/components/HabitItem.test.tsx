import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HabitItem from './HabitItem';

describe('HabitItem', () => {
  const mockHabit = {
    id: '1',
    name: 'Morning Run',
    icon: 'run',
    iconType: 'material',
    color: 'blue',
    completedDates: []
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <HabitItem habit={mockHabit} onToggle={() => { }} onLongPress={() => { }} />
    );
    expect(getByText('Morning Run')).toBeTruthy();
  });

  it('calls onToggle when checkbox is pressed', () => {
    const onToggleMock = jest.fn();
    const { getByTestId } = render(
      <HabitItem habit={mockHabit} onToggle={onToggleMock} onLongPress={() => { }} />
    );

    fireEvent.press(getByTestId(`habit-checkbox-${mockHabit.id}`));
    expect(onToggleMock).toHaveBeenCalledWith(mockHabit.id);
  });
});
