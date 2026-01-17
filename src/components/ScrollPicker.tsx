import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, FlatList, Dimensions, Platform } from 'react-native';
import { colors } from '../theme/colors';


interface ScrollPickerProps {
    items: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    itemHeight?: number;
    visibleItems?: number;
}

export default function ScrollPicker({
    items,
    selectedValue,
    onValueChange,
    itemHeight = 50,
    visibleItems = 3
}: ScrollPickerProps) {
    const flatListRef = useRef<FlatList>(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Calculate container height
    const height = itemHeight * visibleItems;

    // Add padding items so the first and last items can be centered
    // For visibleItems=3, we need 1 empty item at top (index 0) and 1 at bottom.
    // The "real" items start at index 1.
    const paddingCount = Math.floor(visibleItems / 2);
    const data = [
        ...Array(paddingCount).fill(''),
        ...items,
        ...Array(paddingCount).fill('')
    ];

    useEffect(() => {
        // Scroll to initial value on mount or when value changes externally (if not scrolling)
        if (!isScrolling) {
            const index = items.indexOf(selectedValue);
            if (index !== -1 && flatListRef.current) {
                // We need to wait a tick for layout sometimes, but scrollToIndex works on data index
                // Our data has padding. The item at `index` in `items` is at `index + paddingCount` in `data`.
                // snapToOffsets logic matches pixels.
                // Actually scrollToOffset is safer.
                setTimeout(() => {
                    flatListRef.current?.scrollToOffset({
                        offset: index * itemHeight,
                        animated: false // Initial render instant
                    });
                }, 50);
            }
        }
    }, [selectedValue]);

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setIsScrolling(false);
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / itemHeight);

        // Clamp index
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));

        const newValue = items[clampedIndex];
        if (newValue !== selectedValue) {
            onValueChange(newValue);
        }
    };

    const getItemLayout = (_: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
    });

    return (
        <View style={[styles.container, { height }]}>
            {/* Selection Highlight / Overlay */}
            <View style={[
                styles.highlight,
                {
                    height: itemHeight,
                    top: (height - itemHeight) / 2
                }
            ]} pointerEvents="none" />

            <FlatList
                ref={flatListRef}
                data={data}
                keyExtractor={(item, index) => `${index}-${item}`}
                renderItem={({ item, index }) => {
                    // Logic to determine opacity/scale based on distance from center is hard in plain FlatList without Reanimated.
                    // We will stick to simple highlighting via the overlay and text color if possible?
                    // Actually, let's just render. The highlight view provides the visual cue.

                    // We can check if this item is the selected one to bold it?
                    // But scrolling is controlled by parent state often lagging.
                    // Let's just keep it simple.

                    if (item === '') {
                        return <View style={{ height: itemHeight }} />;
                    }

                    const isSelected = item === selectedValue;

                    return (
                        <View style={[styles.item, { height: itemHeight }]}>
                            <Text style={[
                                styles.text,
                                isSelected && styles.selectedText
                            ]}>
                                {item}
                            </Text>
                        </View>
                    );
                }}
                getItemLayout={getItemLayout}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollBeginDrag={() => setIsScrolling(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    selectedText: {
        color: colors.primaryGreen,
        fontSize: 28,
        fontWeight: 'bold',
    },
    highlight: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: 'rgba(76, 217, 100, 0.1)', // Light green bg
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(76, 217, 100, 0.3)',
        zIndex: -1, // Behind text
    }
});
