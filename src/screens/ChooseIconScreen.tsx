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
import { iconCategories, emojiCategories } from '../data/icons';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseIcon'>;

export default function ChooseIconScreen({ navigation, route }: Props) {
  // Get initial selection from params if available
  const { currentIcon, currentType, onSelect } = route.params || {};

  const [activeTab, setActiveTab] = useState('icons'); // 'icons' | 'emojis'
  const [selectedId, setSelectedId] = useState(currentIcon || 'dumbbell');

  const categories = activeTab === 'icons' ? iconCategories : emojiCategories;

  const handleSelect = (item: any) => {
    // Premium check removed
    setSelectedId(item.id);

    // Pass back the selection
    if (onSelect) {
      onSelect({
        icon: item.name,
        type: item.type
      });
    }
    navigation.goBack();
  };

  const renderItem = (item: any) => {
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.itemGrid,
          isSelected && styles.selectedItem
        ]}
        onPress={() => handleSelect(item)}
      >
        {activeTab === 'icons' ? (
          <MaterialCommunityIcons
            name={item.name}
            size={28}
            color={isSelected ? colors.primaryGreen : colors.text}
          />
        ) : (
          <Text style={styles.emojiText}>{item.name}</Text>
        )}

      </TouchableOpacity>
    );
  };

  const renderCategory = (category: any) => (
    <View key={category.id} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleRow}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{category.count}</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {category.items.map(renderItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="cards-outline" size={24} color={colors.primaryGreen} style={{ marginRight: 10 }} />
          <Text style={styles.headerTitle}>Choose Icon Style</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'icons' && styles.activeTab]}
          onPress={() => setActiveTab('icons')}
        >
          <MaterialCommunityIcons
            name="cards-outline"
            size={20}
            color={activeTab === 'icons' ? colors.black : colors.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.tabText, activeTab === 'icons' && styles.activeTabText]}>Icons</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'emojis' && styles.activeTab]}
          onPress={() => setActiveTab('emojis')}
        >
          <Text style={{ marginRight: 8, fontSize: 16 }}>😊</Text>
          <Text style={[styles.tabText, activeTab === 'emojis' && styles.activeTabText]}>Emojis</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {categories.map(renderCategory)}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: colors.primaryGreen,
  },
  tabText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.black,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
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
  },
  countText: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: '600',
  },
  upgradeBadge: {
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upgradeText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  itemGrid: {
    width: '18%', // Keep as is or slightly adjust if needed, but 18% * 5 + gaps should be close to 100%
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: colors.primaryGreen,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderRadius: '50%', // Circle highlight
  },
  emojiText: {
    fontSize: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  lockBadge: {
    backgroundColor: colors.primaryGreen,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  }

});
