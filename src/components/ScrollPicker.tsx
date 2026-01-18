import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, FlatList, TouchableOpacity } from 'react-native';
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

    // We use a ref to track if we are currently handling a user interaction
    // to prevent the useEffect from interfering.
    const isUserInteracting = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate container height
    const height = itemHeight * visibleItems;

    // Add padding items so the first and last items can be centered
    const paddingCount = Math.floor(visibleItems / 2);
    // Memoize data to prevent unnecessary re-rendering
    const data = useMemo(() => [
        ...Array(paddingCount).fill(''),
        ...items,
        ...Array(paddingCount).fill('')
    ], [items, paddingCount]);

    useEffect(() => {
        if (!isUserInteracting.current) {
            const index = items.indexOf(selectedValue);
            if (index !== -1 && flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current?.scrollToOffset({
                        offset: index * itemHeight,
                        animated: false
                    });
                }, 50);
            }
        }
    }, [selectedValue, items, itemHeight]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
        const newValue = items[clampedIndex];

        if (newValue !== selectedValue) {
            onValueChange(newValue);
        }
    };

    const handleScrollBeginDrag = () => {
        isUserInteracting.current = true;
        setIsScrolling(true);
    };

    const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            isUserInteracting.current = false;
            setIsScrolling(false);
        }, 100);
    };

    const handleMomentumScrollBegin = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        isUserInteracting.current = true;
        setIsScrolling(true);
    };

    const handleMomentumScrollEnd = () => {
        isUserInteracting.current = false;
        setIsScrolling(false);
    };

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
    }), [itemHeight]);

    const handleItemPress = useCallback((item: string) => {
        if (!item) return;
        const index = items.indexOf(item);
        if (index !== -1) {
            onValueChange(item);
            isUserInteracting.current = true;
            flatListRef.current?.scrollToOffset({
                offset: index * itemHeight,
                animated: true
            });
            setTimeout(() => {
                isUserInteracting.current = false;
            }, 500);
        }
    }, [items, itemHeight, onValueChange]);

    const renderItem = useCallback(({ item }: { item: string }) => {
        if (item === '') {
            return <View style={{ height: itemHeight }} />;
        }
        return (
            <TouchableOpacity
                style={[styles.item, { height: itemHeight }]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <Text style={styles.text}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    }, [itemHeight, handleItemPress]);

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
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                initialScrollIndex={
                    items.indexOf(selectedValue) !== -1
                        ? items.indexOf(selectedValue)
                        : undefined
                }
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16} // Live updates
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollBegin={handleMomentumScrollBegin}
                onMomentumScrollEnd={handleMomentumScrollEnd}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 60,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
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
