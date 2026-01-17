import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { freeColors, premiumColors } from '../data/colors';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseColor'>;

export default function ChooseColorScreen({ navigation, route }: Props) {
  const { currentColor, onSelect } = route.params || {};
  const [selectedColor, setSelectedColor] = useState(currentColor || freeColors[1]);

  const handleSelect = (color: string) => {
    setSelectedColor(color);
    if (onSelect) {
      onSelect(color);
    }
    navigation.goBack();
  };

  const renderColorItem = (color: string) => {
    const isSelected = selectedColor === color;

    return (
      <TouchableOpacity
        key={color}
        style={[
          styles.colorItem,
          { backgroundColor: color },
          isSelected && styles.selectedColorItem
        ]}
        onPress={() => handleSelect(color)}
        activeOpacity={0.7}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="color-palette-outline" size={24} color={colors.primaryGreen} style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Choose Color</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        {/* Free Colors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Free Colors</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{freeColors.length}</Text>
            </View>
          </View>
          <View style={styles.gridContainer}>
            {freeColors.map(color => renderColorItem(color))}
          </View>
        </View>

        {/* Premium Colors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Colors</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{premiumColors.length}+</Text>
            </View>
          </View>
          <View style={styles.gridContainer}>
            {premiumColors.map(color => renderColorItem(color))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  countBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 'auto', // Pushes unlock button to the right if present
  },
  countText: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  unlockButton: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unlockText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // Add border to distinguish dark colors from bg
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedColorItem: {
    borderWidth: 2,
    borderColor: colors.white,
    // Glow effect
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  lockOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
