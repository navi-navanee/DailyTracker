import React from 'react';
import { render } from '@testing-library/react-native';
import CalendarStrip from './CalendarStrip';

describe('CalendarStrip', () => {
    beforeAll(() => {
        // Mock current date to "2023-10-25" (Wednesday)
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-10-25T12:00:00'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { getByText, getAllByTestId } = render(<CalendarStrip />);
        
        // Check header date: Wednesday, 25 Oct
        expect(getByText(/Wednesday, 25 Oct/)).toBeTruthy();

        // Check 7 day items
        const dayItems = getAllByTestId(/^date-item-/);
        expect(dayItems.length).toBe(7);

        // Check if "Today" is rendered
        expect(getByText('Today')).toBeTruthy();
    });
});
