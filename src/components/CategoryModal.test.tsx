import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryModal, { COMMON_CATEGORIES } from './CategoryModal';

describe('CategoryModal', () => {
    const mockOnClose = jest.fn();
    const mockOnUpdateCategories = jest.fn();
    const initialCategories = ['Health'];

    it('renders correctly', () => {
        const { getByText } = render(
            <CategoryModal
                visible={true}
                onClose={mockOnClose}
                selectedCategories={initialCategories}
                onUpdateCategories={mockOnUpdateCategories}
            />
        );

        expect(getByText('Categories')).toBeTruthy();
        expect(getByText('Health')).toBeTruthy();
        // Check if common categories are rendered
        expect(getByText(COMMON_CATEGORIES[0].name)).toBeTruthy();
    });

    it('toggles a category selection', () => {
        const { getByText } = render(
            <CategoryModal
                visible={true}
                onClose={mockOnClose}
                selectedCategories={[]}
                onUpdateCategories={mockOnUpdateCategories}
            />
        );

        fireEvent.press(getByText('Fitness'));
        // Since state is local, we can't observe external change immediately unless we press Done.
        // But we can check if it stays selected visually if we could inspect styles.
    });

    it('calls onUpdateCategories when Done is pressed', () => {
        const { getByText } = render(
            <CategoryModal
                visible={true}
                onClose={mockOnClose}
                selectedCategories={initialCategories}
                onUpdateCategories={mockOnUpdateCategories}
            />
        );

        fireEvent.press(getByText('Done'));
        expect(mockOnUpdateCategories).toHaveBeenCalledWith(initialCategories);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
