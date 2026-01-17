import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
    it('renders correctly', () => {
        const { getByTestId, getAllByRole } = render(
            <BottomNav activeTab="Home" onTabPress={() => {}} />
        );
        // Sanity check that it renders without error
        expect(true).toBeTruthy();
    });

    it('displays the correct active tab style', () => {
        const { getByTestId, toJSON } = render(
            <BottomNav activeTab="Home" onTabPress={() => {}} />
        );
        const tree = toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('calls onTabPress when a tab is pressed', () => {
        const onTabPressMock = jest.fn();
        const { getByTestId } = render(
            <BottomNav activeTab="Home" onTabPress={onTabPressMock} />
        );

        fireEvent.press(getByTestId('tab-grid'));
        expect(onTabPressMock).toHaveBeenCalledWith('Grid');
        
        fireEvent.press(getByTestId('tab-menu'));
        expect(onTabPressMock).toHaveBeenCalledWith('Menu');
    });
});
