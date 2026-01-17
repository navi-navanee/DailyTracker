import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    FlatList,
    Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Reminder {
    id: string;
    time: string;
    isEnabled: boolean;
    days: string;
}

interface SmartRemindersModalProps {
    visible: boolean;
    onClose: () => void;
    reminders: Reminder[];
    onUpdateReminders: (reminders: Reminder[]) => void;
}

const formatTime = (hour: number, minute: number) => {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
};

export default function SmartRemindersModal({ visible, onClose, reminders, onUpdateReminders }: SmartRemindersModalProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Time Picker State
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setIsAdding(false);
            setEditingId(null);
        }
    }, [visible]);

    const handleAddStart = () => {
        setSelectedHour(9);
        setSelectedMinute(0);
        setIsAdding(true);
        setEditingId(null);
    };

    const handleEditStart = (reminder: Reminder) => {
        const [h, m] = reminder.time.split(':').map(Number);
        setSelectedHour(h);
        setSelectedMinute(m);
        setIsAdding(true);
        setEditingId(reminder.id);
    };

    const handleSaveReminder = () => {
        const newTime = formatTime(selectedHour, selectedMinute);

        if (editingId) {
            const updated = reminders.map(r =>
                r.id === editingId ? { ...r, time: newTime } : r
            );
            onUpdateReminders(updated);
        } else {
            const newReminder: Reminder = {
                id: Date.now().toString(),
                time: newTime,
                isEnabled: true,
                days: 'Daily'
            };
            onUpdateReminders([...reminders, newReminder]);
        }

        setIsAdding(false);
        setEditingId(null);
    };

    const handleDeleteReminder = (id: string) => {
        const updated = reminders.filter(r => r.id !== id);
        onUpdateReminders(updated);
    };

    const handleToggleReminder = (id: string) => {
        const updated = reminders.map(r =>
            r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
        );
        onUpdateReminders(updated);
    };

    // Render Time Picker Column
    const renderPickerItem = ({ item }: { item: number }, isHour: boolean) => {
        const isSelected = isHour ? item === selectedHour : item === selectedMinute;
        return (
            <TouchableOpacity
                style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
                onPress={() => isHour ? setSelectedHour(item) : setSelectedMinute(item)}
            >
                <Text style={[styles.pickerItemText, isSelected && styles.selectedPickerItemText]}>
                    {item.toString().padStart(2, '0')}
                </Text>
            </TouchableOpacity>
        );
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
                                <Ionicons name="notifications" size={20} color={colors.primaryGreen} />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Smart Reminders</Text>
                                <Text style={styles.headerSubtitle}>Get notified at the perfect time</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textGray} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {isAdding ? (
                            // TIME PICKER UI
                            <View style={styles.pickerContainer}>
                                <Text style={styles.pickerTitle}>Set Time</Text>
                                <View style={styles.pickersRow}>
                                    {/* Hours */}
                                    <View style={styles.pickerColumn}>
                                        <Text style={styles.columnLabel}>Hours</Text>
                                        <FlatList
                                            data={hours}
                                            renderItem={(item) => renderPickerItem(item, true)}
                                            keyExtractor={item => item.toString()}
                                            showsVerticalScrollIndicator={false}
                                            style={styles.list}
                                            initialScrollIndex={selectedHour}
                                            getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                                        />
                                    </View>

                                    <Text style={styles.timeSeparator}>:</Text>

                                    {/* Minutes */}
                                    <View style={styles.pickerColumn}>
                                        <Text style={styles.columnLabel}>Minutes</Text>
                                        <FlatList
                                            data={minutes}
                                            renderItem={(item) => renderPickerItem(item, false)}
                                            keyExtractor={item => item.toString()}
                                            showsVerticalScrollIndicator={false}
                                            style={styles.list}
                                            initialScrollIndex={selectedMinute}
                                            getItemLayout={(data, index) => ({ length: 50, offset: 50 * index, index })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.pickerActions}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsAdding(false)}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.confirmButton} onPress={handleSaveReminder}>
                                        <Text style={styles.confirmText}>{editingId ? 'Update' : 'Set Time'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            // REMINDERS LIST UI
                            <>
                                {reminders.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="notifications-outline" size={48} color={colors.textGray} style={{ opacity: 0.5, marginBottom: 16 }} />
                                        <Text style={styles.emptyTitle}>No reminders yet</Text>
                                        <Text style={styles.emptySubtitle}>Add a reminder to stay on track</Text>
                                    </View>
                                ) : (
                                    <ScrollView style={styles.listContent}>
                                        {reminders.map(reminder => (
                                            <View key={reminder.id} style={styles.reminderItem}>
                                                <View style={styles.reminderLeft}>
                                                    <View style={styles.reminderIconBox}>
                                                        <Ionicons name="notifications" size={16} color={colors.primaryGreen} />
                                                    </View>
                                                    <View>
                                                        <Text style={styles.reminderTime}>{reminder.time}</Text>
                                                        <Text style={styles.reminderDays}>{reminder.days || 'Daily'}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.reminderActions}>
                                                    <Switch
                                                        trackColor={{ false: colors.darkGray, true: colors.primaryGreen }}
                                                        thumbColor={colors.white}
                                                        onValueChange={() => handleToggleReminder(reminder.id)}
                                                        value={reminder.isEnabled}
                                                        style={{ transform: [{ scale: 0.8 }] }}
                                                    />
                                                    <TouchableOpacity style={styles.actionButton} onPress={() => handleEditStart(reminder)}>
                                                        <Ionicons name="pencil" size={16} color={colors.textGray} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteReminder(reminder.id)}>
                                                        <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                <View style={styles.footer}>
                                    <TouchableOpacity style={styles.addButton} onPress={handleAddStart}>
                                        <Ionicons name={reminders.length > 0 ? "add" : "add"} size={20} color={colors.black} />
                                        <Text style={styles.addButtonText}>
                                            {reminders.length > 0 ? "Add Another Reminder" : "Add Reminder"}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.tipContainer}>
                                        <Ionicons name="bulb-outline" size={16} color={colors.primaryGreen} />
                                        <Text style={styles.tipText}>Users with reminders are 3x more successful!</Text>
                                    </View>
                                </View>
                            </>
                        )}
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
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: SCREEN_HEIGHT * 0.75, // 75% height
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
        backgroundColor: '#2E3A2F',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
    },
    emptyTitle: {
        color: colors.textGray,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: colors.textGray,
        fontSize: 14,
        opacity: 0.7,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: 40,
    },
    addButton: {
        backgroundColor: colors.primaryGreen,
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    addButtonText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E3A2F',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: '#3E4A3F',
    },
    tipText: {
        color: '#A0DDA0',
        fontSize: 13,
        fontWeight: '500',
    },
    listContent: {
        flex: 1,
    },
    reminderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#3A3A3C',
    },
    reminderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reminderIconBox: {
        width: 32,
        height: 32,
        borderRadius: 20, // Circle
        backgroundColor: '#2E3A2F', // Default dark green
        justifyContent: 'center',
        alignItems: 'center',
    },
    reminderTime: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    reminderDays: {
        color: colors.textGray,
        fontSize: 12,
    },
    reminderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    // PICKER STYLES
    pickerContainer: {
        flex: 1,
    },
    pickerTitle: {
        color: colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    pickersRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 250,
        marginBottom: 30,
    },
    pickerColumn: {
        width: 80,
        alignItems: 'center',
    },
    columnLabel: {
        color: colors.textGray,
        marginBottom: 10,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    list: {
        width: '100%',
    },
    pickerItem: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerItemText: {
        color: colors.textGray,
        fontSize: 24,
    },
    selectedPickerItem: {
        backgroundColor: '#2C2C2E',
        borderRadius: 8,
        width: '100%',
    },
    selectedPickerItemText: {
        color: colors.primaryGreen,
        fontWeight: 'bold',
        fontSize: 28,
    },
    timeSeparator: {
        color: colors.text,
        fontSize: 40,
        marginTop: 60,
        alignSelf: 'flex-start',
    },
    pickerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#2C2C2E',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: colors.text,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: colors.primaryGreen,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    confirmText: {
        color: colors.black,
        fontWeight: 'bold',
    }
});
