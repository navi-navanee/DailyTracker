import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { addHabit, updateHabitInStorage } from '../utils/storage';
import SmartRemindersModal from '../components/SmartRemindersModal';
import CategoryModal from '../components/CategoryModal';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

export default function AddHabitScreen({ navigation, route }: Props) {
  const existingHabit = route.params?.habit;

  const [habitName, setHabitName] = useState(existingHabit?.name || '');
  const [selectedColor, setSelectedColor] = useState(existingHabit?.color || colors.palette[1]);
  const [habitType, setHabitType] = useState(existingHabit?.type || 'checkmark');
  const [hasTarget, setHasTarget] = useState(existingHabit?.hasTarget || false);
  const [selectedIcon, setSelectedIcon] = useState(existingHabit?.icon || 'dumbbell');
  const [iconType, setIconType] = useState(existingHabit?.iconType || 'icon');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [targetType, setTargetType] = useState<'daily' | 'weekly'>(existingHabit?.targetType as any || 'daily');
  const [targetCount, setTargetCount] = useState(existingHabit?.targetCount || 1);

  const [isRemindersVisible, setIsRemindersVisible] = useState(false);
  const [reminders, setReminders] = useState<{ id: string, time: string, isEnabled: boolean, days: string, notificationId?: string }[]>(existingHabit?.reminders || []);

  const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(existingHabit?.categories || []);

  /* ... */

  const handleIconSelect = (selection: { icon: string; type: string }) => {
    setSelectedIcon(selection.icon);
    setIconType(selection.type);
  };

  const openIconPicker = () => {
    navigation.navigate('ChooseIcon', {
      currentIcon: selectedIcon,
      currentType: iconType,
      onSelect: handleIconSelect
    });
  };

  const handleSave = async () => {
    if (!habitName.trim()) {
      return;
    }

    const newHabit = {
      id: existingHabit?.id || Date.now().toString(),
      name: habitName.trim(),
      color: selectedColor,
      icon: selectedIcon,
      iconType,
      type: habitType,
      hasTarget,
      targetType: hasTarget ? targetType : undefined,
      targetCount: hasTarget ? targetCount : undefined,
      reminders,
      categories: selectedCategories,
      completedDates: existingHabit?.completedDates || [],
      createdAt: existingHabit?.createdAt || new Date().toISOString(),
      streak: existingHabit?.streak || 0,
    };

    if (existingHabit) {
      await updateHabitInStorage(newHabit);
    } else {
      await addHabit(newHabit);
    }
    navigation.goBack();
  };

  const renderColorOption = (color: string) => {
    const isSelected = selectedColor === color;
    return (
      <TouchableOpacity
        key={color}
        onPress={() => setSelectedColor(color)}
        style={[
          styles.colorOption,
          { backgroundColor: color },
          isSelected && styles.selectedColorOption
        ]}
      >
        {isSelected && <Ionicons name="checkmark" size={20} color="#FFF" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingHabit ? 'Edit Habit' : 'New Habit'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        {/* Icon Selector */}
        <View style={styles.iconSection}>
          <TouchableOpacity style={styles.iconCircle} onPress={openIconPicker}>
            {iconType === 'icon' ? (
              <MaterialCommunityIcons name={selectedIcon as any} size={40} color={selectedColor} />
            ) : (
              <Text style={{ fontSize: 40 }}>{selectedIcon}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.tapToChange}>Tap to change</Text>
        </View>

        {/* Name Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="pencil" size={16} color={colors.text} />
            <Text style={styles.label}>Habit Name <Text style={{ color: colors.primaryGreen }}>*</Text></Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="What habit do you want to build?"
            placeholderTextColor={colors.textGray}
            value={habitName}
            onChangeText={setHabitName}
          />
        </View>

        {/* Color Selector */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Ionicons name="color-palette-outline" size={18} color={colors.text} />
            <Text style={styles.label}>Color</Text>
          </View>
          <View style={styles.colorsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {colors.palette.map(renderColorOption)}
              <TouchableOpacity
                style={styles.addColorButton}
                onPress={() => navigation.navigate('ChooseColor', {
                  currentColor: selectedColor,
                  onSelect: (color: string) => setSelectedColor(color)
                })}
              >
                <Text style={styles.addColorText}>+30 {'>'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Habit Type */}
        <View style={styles.section}>
          <Text style={styles.labelSimple}>Habit Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                habitType === 'checkmark' && styles.selectedTypeOption
              ]}
              onPress={() => setHabitType('checkmark')}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.text} />
              <Text style={styles.typeText}>Checkmark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                habitType === 'time' && styles.selectedTypeOption
              ]}
              onPress={() => setHabitType('time')}
            >
              <Ionicons name="timer-outline" size={20} color={colors.text} />
              <Text style={styles.typeText}>Time Tracked</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.descriptionText}>
            Mark habit as done for the day with a single tap or set frequency targets.
          </Text>
        </View>

        {/* Completion Target */}
        <View style={styles.rowSection}>
          <View>
            <Text style={styles.rowLabel}>Completion Target</Text>
            <Text style={styles.rowSubLabel}>Set a daily or weekly goal for this habit</Text>
          </View>
          <Switch
            trackColor={{ false: colors.darkGray, true: colors.primaryGreen }}
            thumbColor={colors.white}
            onValueChange={setHasTarget}
            value={hasTarget}
          />
        </View>

        {hasTarget && (
          <View style={styles.targetSection}>
            <View style={styles.targetTypeContainer}>
              <TouchableOpacity
                style={[styles.targetTypeCard, targetType === 'daily' && styles.activeTargetCard]}
                onPress={() => setTargetType('daily')}
              >
                <View style={styles.targetCardHeader}>
                  <Ionicons name="calendar-outline" size={18} color={targetType === 'daily' ? colors.primaryGreen : colors.text} />
                  <Text style={styles.targetCardTitle}>Daily</Text>
                  {targetType === 'daily' && <Ionicons name="checkmark-circle" size={18} color={colors.primaryGreen} style={{ marginLeft: 'auto' }} />}
                </View>
                <Text style={styles.targetCardDesc}>Complete multiple times each day</Text>
                <Text style={styles.targetCardExample}>e.g., Drink water 8x daily</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.targetTypeCard, targetType === 'weekly' && styles.activeTargetCard]}
                onPress={() => setTargetType('weekly')}
              >
                <View style={styles.targetCardHeader}>
                  <Ionicons name="calendar" size={18} color={targetType === 'weekly' ? colors.primaryGreen : colors.text} />
                  <Text style={styles.targetCardTitle}>Weekly</Text>
                  {targetType === 'weekly' && <Ionicons name="checkmark-circle" size={18} color={colors.primaryGreen} style={{ marginLeft: 'auto' }} />}
                </View>
                <Text style={styles.targetCardDesc}>Complete certain days per week</Text>
                <Text style={styles.targetCardExample}>e.g., Exercise 3x per week</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.counterContainer}>
              <View>
                <Text style={styles.counterTitle}>
                  {targetType === 'daily' ? 'Times per day' : 'Days per week'}
                </Text>
                <Text style={styles.counterSubtitle}>
                  {targetType === 'daily' ? 'How many times to complete daily' : 'How many days to complete weekly'}
                </Text>
              </View>

              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setTargetCount(Math.max(1, targetCount - 1))}
                >
                  <Ionicons name="remove" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{targetCount}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, { backgroundColor: colors.primaryGreen }]} // Green + button
                  onPress={() => setTargetCount(targetType === 'weekly' ? Math.min(7, targetCount + 1) : targetCount + 1)}
                >
                  <Ionicons name="add" size={24} color={colors.black} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Advanced Accordion Placeholder */}
        <View style={styles.advancedSection}>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.advancedButton}
            onPress={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <Text style={styles.advancedText}>Advanced</Text>
            <Ionicons
              name={isAdvancedOpen ? "chevron-down" : "chevron-up"}
              size={16}
              color={colors.textGray}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
        </View>

        {/* Other Options */}
        {isAdvancedOpen && (
          <View>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setIsRemindersVisible(true)}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.listIconBox, { backgroundColor: '#2E3A2F' }]}>
                  <Ionicons name="notifications-outline" size={20} color={colors.primaryGreen} />
                </View>
                <View>
                  <Text style={styles.listItemTitle}>Reminders</Text>
                  <Text style={styles.listItemSubtitle}>
                    {reminders.length > 0 ? `${reminders.length} reminders set` : 'Stay on track with notifications'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textGray} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => setIsCategoriesVisible(true)}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.listIconBox, { backgroundColor: '#2E3A2F' }]}>
                  <Ionicons name="folder-outline" size={20} color={colors.primaryGreen} />
                </View>
                <View>
                  <Text style={styles.listItemTitle}>Categories</Text>
                  <Text style={styles.listItemSubtitle}>
                    {selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Pick categories for your habit'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textGray} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />

      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <SmartRemindersModal
        visible={isRemindersVisible}
        onClose={() => setIsRemindersVisible(false)}
        reminders={reminders}
        onUpdateReminders={setReminders}
      />

      <CategoryModal
        visible={isCategoriesVisible}
        onClose={() => setIsCategoriesVisible(false)}
        selectedCategories={selectedCategories}
        onUpdateCategories={setSelectedCategories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A', // Darker circle background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    // shadow/glow effect simulation
    shadowColor: colors.primary, // Using primary for glow for now or selected color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  tapToChange: {
    color: colors.textGray,
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.darkGray,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorsContainer: {
    backgroundColor: colors.darkGray,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: colors.white,
    // Add a glow effect
    shadowColor: colors.white,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  addColorButton: {
    backgroundColor: '#3A3A3C',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addColorText: {
    color: colors.primaryGreen,
    fontWeight: '600',
  },
  labelSimple: { // Label without icon
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  selectedTypeOption: {
    borderColor: colors.primaryGreen,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  typeText: {
    color: colors.text,
    fontWeight: '500',
  },
  descriptionText: {
    color: colors.textGray,
    fontSize: 13,
    lineHeight: 18,
  },
  rowSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  rowSubLabel: {
    color: colors.textGray,
    fontSize: 13,
  },
  advancedSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    flex: 1,
    width: '100%',
    opacity: 0.5,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    position: 'absolute', // To sit on top of divider line or simulate layout
    zIndex: 1,
  },
  advancedText: {
    color: colors.textGray,
    marginRight: 6,
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.darkGray,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtitle: {
    color: colors.textGray,
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: colors.background, // or transparent with blur
  },
  saveButton: {
    backgroundColor: colors.primaryGreen,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetSection: {
    marginTop: -15, // Pull close to toggle
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 16,
    marginBottom: 25,
  },
  targetTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  targetTypeCard: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTargetCard: {
    borderColor: colors.primaryGreen,
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  targetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  targetCardDesc: {
    color: colors.textGray,
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  targetCardExample: {
    color: colors.primaryGreen,
    fontSize: 11,
    fontStyle: 'italic',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
  },
  counterTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  counterSubtitle: {
    color: colors.textGray,
    fontSize: 12,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    color: colors.primaryGreen, // Green count
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
});
