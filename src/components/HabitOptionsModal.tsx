import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface HabitOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    position: { x: number; y: number } | null;
}

export default function HabitOptionsModal({ visible, onClose, onEdit, onDelete, position }: HabitOptionsModalProps) {
    if (!position) return null;

    // Adjust position to keep within screen bounds
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const MENU_WIDTH = 180;
    const rightSpace = SCREEN_WIDTH - position.x;

    // If not enough space on right, shift left
    const left = rightSpace < MENU_WIDTH ? position.x - MENU_WIDTH + 40 : position.x - 140;
    // Adjusted logic: Screenshot shows it appearing to the left of the button usually if button is far right.
    // Let's assume button is at top-right of card. Menu appears "below" and "aligned right" usually.

    const menuStyle = {
        top: position.y + 10,
        left: position.x - MENU_WIDTH + 20, // Align right side roughly with button
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.menu, menuStyle]}>
                            <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                                <View style={styles.iconBox}>
                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.white} />
                                </View>
                                <Text style={styles.menuText}>Edit</Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textGray} style={styles.chevron} />
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                                <View style={[styles.iconBox, styles.deleteIconBox]}>
                                    <Ionicons name="trash-outline" size={18} color="#FF453A" />
                                </View>
                                <Text style={[styles.menuText, styles.deleteText]}>Delete</Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textGray} style={styles.chevron} />
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)', // Very faint overlay? Or transparent? Screenshot implies popup.
    },
    menu: {
        position: 'absolute',
        width: 200,
        backgroundColor: '#252525',
        borderRadius: 16,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#3A3A3C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    deleteIconBox: {
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
    },
    menuText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    deleteText: {
        color: '#FF453A',
    },
    chevron: {
        opacity: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#3A3A3C',
        marginHorizontal: 12,
        marginVertical: 4,
    }
});
