import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface CategoryModalProps {
    visible: boolean;
    onClose: () => void;
    selectedCategories: string[];
    onUpdateCategories: (categories: string[]) => void;
}

export const COMMON_CATEGORIES = [
    { id: 'art', name: 'Art', icon: 'palette-outline' },
    { id: 'finances', name: 'Finances', icon: 'cash-outline' },
    { id: 'fitness', name: 'Fitness', icon: 'barbell-outline' },
    { id: 'health', name: 'Health', icon: 'heart-outline' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant-outline' },
    { id: 'social', name: 'Social', icon: 'people-outline' },
    { id: 'study', name: 'Study', icon: 'school-outline' },
    { id: 'work', name: 'Work', icon: 'briefcase-outline' },
    { id: 'morning', name: 'Morning', icon: 'sunny-outline' },
    { id: 'day', name: 'Day', icon: 'partly-sunny-outline' },
    { id: 'evening', name: 'Evening', icon: 'moon-outline' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal' },
];

const CUSTOM_ICONS = [
    'star', 'heart', 'flag', 'bookmark', 'bulb', 'flame',
    'rocket', 'trophy', 'ribbon', 'paw', 'leaf', 'water'
];

export default function CategoryModal({ visible, onClose, selectedCategories, onUpdateCategories }: CategoryModalProps) {
    const [customCategory, setCustomCategory] = useState('');
    const [customIcon, setCustomIcon] = useState('star');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [customIconsMap, setCustomIconsMap] = useState<Record<string, string>>({}); // valid during session

    // We can manage local selection state if we want "Done" to save, 
    // but for now let's sync directly for simplicity, or use a local state and save on close.
    // The screenshot shows a "Done" button, implying we should probably buffer changes.

    const [localCategories, setLocalCategories] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            setLocalCategories(selectedCategories);
            setCustomCategory('');
            setCustomIcon('star');
            setIsIconPickerOpen(false);
        }
    }, [visible, selectedCategories]);

    const toggleCategory = (categoryName: string) => {
        if (localCategories.includes(categoryName)) {
            setLocalCategories(localCategories.filter(c => c !== categoryName));
        } else {
            setLocalCategories([...localCategories, categoryName]);
        }
    };

    const handleIconCycle = () => {
        const currentIndex = CUSTOM_ICONS.indexOf(customIcon);
        const nextIndex = (currentIndex + 1) % CUSTOM_ICONS.length;
        setCustomIcon(CUSTOM_ICONS[nextIndex]);
    };

    const handleAddCustom = () => {
        if (customCategory.trim()) {
            const name = customCategory.trim();
            setCustomIconsMap(prev => ({ ...prev, [name]: customIcon }));
            toggleCategory(name);
            setCustomCategory('');
            setCustomIcon('star'); // reset
        }
    };

    const handleDone = () => {
        onUpdateCategories(localCategories);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.sheetContainer}>

                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.headerIconBox}>
                                <Ionicons name="pricetag-outline" size={20} color={colors.primaryGreen} />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Categories</Text>
                                <Text style={styles.headerSubtitle}>Pick categories for your habit</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textGray} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                        {/* Common Categories */}
                        <Text style={styles.sectionTitle}>COMMON CATEGORIES</Text>
                        <View style={styles.grid}>
                            {COMMON_CATEGORIES.map((cat) => {
                                const isSelected = localCategories.includes(cat.name);
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.chip, isSelected && styles.selectedChip]}
                                        onPress={() => toggleCategory(cat.name)}
                                    >
                                        <Ionicons
                                            name={cat.icon as any}
                                            size={18}
                                            color={isSelected ? colors.primaryGreen : colors.text}
                                        />
                                        <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Custom Categories */}
                        <Text style={styles.sectionTitle}>CUSTOM CATEGORIES</Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TouchableOpacity
                                    style={[styles.headerIconBox, { width: 32, height: 32 }]}
                                    onPress={handleIconCycle}
                                >
                                    <Ionicons name={customIcon as any} size={16} color={colors.primaryGreen} />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New category name..."
                                    placeholderTextColor={colors.textGray}
                                    value={customCategory}
                                    onChangeText={setCustomCategory}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, !customCategory.trim() && styles.disabledButton]}
                                onPress={handleAddCustom}
                                disabled={!customCategory.trim()}
                            >
                                <Ionicons name="add" size={20} color={colors.black} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.helperText}>Tap icon to change</Text>

                        {/* Display added custom categories that aren't in common list */}
                        <View style={[styles.grid, { marginTop: 12 }]}>
                            {localCategories.filter(c => !COMMON_CATEGORIES.some(common => common.name === c)).map((cat, index) => (
                                <TouchableOpacity
                                    key={`custom-${index}`}
                                    style={[styles.chip, styles.selectedChip]}
                                    onPress={() => toggleCategory(cat)}
                                >
                                    <Ionicons name={(customIconsMap[cat] || 'pricetag') as any} size={18} color={colors.primaryGreen} />
                                    <Text style={[styles.chipText, styles.selectedChipText]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Footer with Done Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                            <Text style={styles.doneButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#1C1C1E', // Darker background for the sheet
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: SCREEN_HEIGHT * 0.85, // 85% height to fit grid
        paddingTop: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#3A3A3C',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2C2C2E',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(74, 222, 128, 0.1)', // Transparent green
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.2)',
    },
    headerTitle: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: colors.textGray,
        fontSize: 13,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    sectionTitle: {
        color: colors.textGray,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3A3A3C',
        gap: 8,
        width: '30%', // Approx 3 columns
        justifyContent: 'center',
    },
    selectedChip: {
        borderColor: colors.primaryGreen,
        backgroundColor: 'rgba(74, 222, 128, 0.05)',
    },
    chipText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
    selectedChipText: {
        color: colors.text, // Keep text white even when selected, or make generic
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#2C2C2E',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 4,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
        paddingVertical: 8,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.primaryGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#3A3A3C',
        opacity: 0.5,
    },
    helperText: {
        color: colors.textGray,
        fontSize: 12,
        marginTop: 8,
        marginLeft: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: '#1C1C1E', // Match sheet bg
        borderTopWidth: 1,
        borderTopColor: '#2C2C2E',
    },
    doneButton: {
        backgroundColor: colors.primaryGreen,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
    },
    doneButtonText: {
        color: colors.black,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
