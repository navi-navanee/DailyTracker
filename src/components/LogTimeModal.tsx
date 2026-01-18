import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import ScrollPicker from './ScrollPicker';

interface LogTimeModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (minutes: number) => void;
    initialValue?: number; // in minutes
}

type Tab = 'Manual' | 'Stopwatch' | 'Countdown';

export default function LogTimeModal({ visible, onClose, onSave, initialValue = 0 }: LogTimeModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Manual');

    // Manual State
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('0');

    // Stopwatch State
    const [stopwatchTime, setStopwatchTime] = useState(0); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Countdown State (Simplification: User sets a time and we just have a timer)
    // For now, let's keep Countdown simple or similar to Stopwatch but counting down? 
    // Given the complexity of a full countdown with alarm, let's just stick to a timer that you can set.
    // Actually, user request asked for "manual stopwatch countdown feature". 
    // Let's implement a basic Countdown that alerts when done.
    const [countdownInitial, setCountdownInitial] = useState(15 * 60); // 15 mins default
    const [countdownTime, setCountdownTime] = useState(15 * 60);
    const [isCountdownRunning, setIsCountdownRunning] = useState(false);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (visible) {
            // Reset or Set initial values
            const h = Math.floor(initialValue / 60);
            const m = initialValue % 60;
            setHours(h.toString());
            setMinutes(m.toString());

            // Allow resetting stopwatch/countdown if needed, or keep state?
            // Usually we want a fresh start if reopening for a new day, but maybe keep state if same session.
            // For now, let's just sync manual inputs.
        }
        return () => stopAllTimers();
    }, [visible, initialValue]);

    const stopAllTimers = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setIsRunning(false);
        setIsCountdownRunning(false);
    };

    // Stopwatch Logic
    const toggleStopwatch = () => {
        if (isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
        } else {
            intervalRef.current = setInterval(() => {
                setStopwatchTime(prev => prev + 1);
            }, 1000);
            setIsRunning(true);
        }
    };
    const resetStopwatch = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setStopwatchTime(0);
    };

    // Countdown Logic
    const toggleCountdown = () => {
        if (isCountdownRunning) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            setIsCountdownRunning(false);
        } else {
            countdownIntervalRef.current = setInterval(() => {
                setCountdownTime(prev => {
                    if (prev <= 1) {
                        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                        setIsCountdownRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setIsCountdownRunning(true);
        }
    };
    const resetCountdown = () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setIsCountdownRunning(false);
        setCountdownTime(countdownInitial);
    };


    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleSave = () => {
        let totalMinutes = 0;
        if (activeTab === 'Manual') {
            totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
        } else if (activeTab === 'Stopwatch') {
            totalMinutes = Math.floor(stopwatchTime / 60);
        } else if (activeTab === 'Countdown') {
            // What to save for countdown? The time elapsed? Or the target duration?
            // Usually if I do a 15 min countdown and finish it, I logged 15 mins.
            // If I stop early, maybe I want to log what I did (Initial - Remaining).
            totalMinutes = Math.floor((countdownInitial - countdownTime) / 60);
        }

        onSave(totalMinutes);
        onClose();
    };

    const renderManualTab = () => {
        // Generate arrays for picker
        const hourItems = Array.from({ length: 24 }, (_, i) => i.toString());
        const minuteItems = Array.from({ length: 60 }, (_, i) => i.toString());

        return (
            <View style={styles.tabContent}>
                {/* Big Time Display */}
                <View style={styles.displayContainer}>
                    <Text style={styles.displayText}>
                        {parseInt(hours) > 0 ? `${parseInt(hours)}h` : ''} {parseInt(minutes) > 0 ? `${parseInt(minutes)}m` : ''}
                        {parseInt(hours) === 0 && parseInt(minutes) === 0 ? '0h' : ''}
                    </Text>
                </View>

                {/* Presets - moved to middle */}
                <View style={styles.presetsContainer}>
                    {[15, 30, 60, 120].map(m => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.presetBtn,
                            ((parseInt(hours) * 60 + parseInt(minutes)) === m) && styles.activePresetBtn
                            ]}
                            onPress={() => {
                                setHours(Math.floor(m / 60).toString());
                                setMinutes((m % 60).toString());
                            }}
                        >
                            <Text style={[styles.presetText,
                            ((parseInt(hours) * 60 + parseInt(minutes)) === m) && styles.activePresetText
                            ]}>{m >= 60 ? `${m / 60}h` : `${m}m`}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.timeInputContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Hours</Text>
                        <ScrollPicker
                            items={hourItems}
                            selectedValue={hours}
                            onValueChange={setHours}
                            itemHeight={50}
                            visibleItems={3}
                        />
                    </View>

                    <View style={{ justifyContent: 'center', height: 150 }}>
                        <Text style={styles.colon}>:</Text>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>Minutes</Text>
                        <ScrollPicker
                            items={minuteItems}
                            selectedValue={minutes}
                            onValueChange={setMinutes}
                            itemHeight={50}
                            visibleItems={3}
                        />
                    </View>
                </View>

            </View>
        );
    };

    const renderStopwatchTab = () => (
        <View style={styles.tabContent}>
            <Text style={styles.timerDisplay}>{formatTime(stopwatchTime)}</Text>
            <View style={styles.timerControls}>
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]} onPress={resetStopwatch}>
                    <Text style={styles.controlBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlBtn, { backgroundColor: isRunning ? '#FF453A' : colors.primaryGreen }]}
                    onPress={toggleStopwatch}
                >
                    <Text style={[styles.controlBtnText, { color: isRunning ? 'white' : 'black' }]}>
                        {isRunning ? 'Stop' : 'Start'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderCountdownTab = () => (
        <View style={styles.tabContent}>
            {/* Simple preset selector for countdown if not running? for now just hardcoded 15m default or edit? */}
            {/* To keep it simple, let's just let user pick from presets to SET countdown, then start. */}
            {!isCountdownRunning && countdownTime === countdownInitial && (
                <View style={styles.presetsContainer}>
                    {[5, 15, 30, 60].map(m => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.presetBtn, countdownInitial === m * 60 && { borderColor: colors.primaryGreen, borderWidth: 1 }]}
                            onPress={() => {
                                setCountdownInitial(m * 60);
                                setCountdownTime(m * 60);
                            }}
                        >
                            <Text style={styles.presetText}>{m}m</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.timerDisplay}>{formatTime(countdownTime)}</Text>
            <View style={styles.timerControls}>
                <TouchableOpacity style={[styles.controlBtn, { backgroundColor: colors.surface }]} onPress={resetCountdown}>
                    <Text style={styles.controlBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlBtn, { backgroundColor: isCountdownRunning ? '#FF453A' : colors.primaryGreen }]}
                    onPress={toggleCountdown}
                >
                    <Text style={[styles.controlBtnText, { color: isCountdownRunning ? 'white' : 'black' }]}>
                        {isCountdownRunning ? 'Pause' : 'Start'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {visible && (
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <Ionicons name="time-outline" size={24} color={colors.primaryGreen} />
                                <Text style={styles.title}>Log Time</Text>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.tabs}>
                            {(['Manual', 'Stopwatch', 'Countdown'] as Tab[]).map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Ionicons
                                        name={tab === 'Manual' ? 'create-outline' : tab === 'Stopwatch' ? 'stopwatch-outline' : 'hourglass-outline'}
                                        size={16}
                                        color={activeTab === tab ? 'black' : colors.textSecondary}
                                    />
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {activeTab === 'Manual' && renderManualTab()}
                        {activeTab === 'Stopwatch' && renderStopwatchTab()}
                        {activeTab === 'Countdown' && renderCountdownTab()}

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>
                                <Ionicons name="checkmark" size={20} color="black" /> Log Time
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1C1C1E',
        borderRadius: 24,
        padding: 24,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        backgroundColor: colors.primaryGreen,
    },
    tabText: {
        color: colors.textSecondary,
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: 'black',
    },
    tabContent: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Ensure centering
        gap: 16,
        marginBottom: 24,
    },
    inputWrapper: {
        alignItems: 'center',
        gap: 8,
    },
    inputLabel: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    timeInput: {
        backgroundColor: '#2C2C2E',
        width: 100,
        height: 60,
        borderRadius: 12,
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primaryGreen,
        textAlign: 'center',
    },
    colon: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginTop: 16,
    },
    presetsContainer: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    presetBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        minWidth: 70,
        alignItems: 'center',
    },
    presetText: {
        color: colors.primaryGreen,
        fontWeight: '600',
    },
    timerDisplay: {
        fontSize: 56,
        fontWeight: 'bold',
        color: colors.primaryGreen,
        fontVariant: ['tabular-nums'],
        marginBottom: 32,
    },
    timerControls: {
        flexDirection: 'row',
        gap: 24,
    },
    controlBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtnText: {
        color: 'white',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: colors.primaryGreen,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    saveButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
    },
    displayContainer: {
        backgroundColor: '#2C2C2E',
        width: '100%',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.primaryGreen,
    },
    displayText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primaryGreen,
    },
    activePresetBtn: {
        backgroundColor: colors.primaryGreen,
    },
    activePresetText: {
        color: 'black',
    },
});
