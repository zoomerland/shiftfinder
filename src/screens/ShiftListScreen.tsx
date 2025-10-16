/*
Подключение стора через useStores и observer.
Отрисовка FlatList с данными из sortedShifts, включение RefreshControl.
Добавление SortBar с кнопками переключения и вынесение его в отдельный блок под статус-баром.
Отображение состояния загрузки, пустого списка и баннера ошибок.
*/

import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShiftListItem } from '../components/ShiftListItem';
import { useStores } from '../stores/StoreContext';
import type { Shift } from '../types/shift';
import type { ShiftSortKey } from '../stores/ShiftStore';

const SORT_OPTIONS: Array<{ key: ShiftSortKey; label: string }> = [
  { key: 'date', label: 'По дате' },
  { key: 'street', label: 'По улице' },
  { key: 'payment', label: 'По оплате' },
  { key: 'workers', label: 'По работникам' },
  { key: 'company', label: 'По компании' },
];

export const ShiftListScreen = observer(() => {
  const { shiftStore } = useStores();
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }: { item: Shift }) => (
    <ShiftListItem shift={item} onPress={shiftStore.selectShift} />
  );

  const listEmptyComponent = () => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderTitle}>Смен рядом не найдено</Text>
      <Text style={styles.placeholderSubtitle}>
        Потяните список вниз, чтобы обновить данные, или проверьте подключение к
        сети.
      </Text>
    </View>
  );

  const errorBanner = shiftStore.error ? (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{shiftStore.error}</Text>
    </View>
  ) : null;

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.sortContainer}>
        <Text style={styles.sortTitle}>Сортировка</Text>
        <SortBar
          activeKey={shiftStore.sortKey}
          onSelect={shiftStore.setSortKey}
        />
      </View>
      {errorBanner}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={shiftStore.sortedShifts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={!shiftStore.loading ? listEmptyComponent : null}
        refreshControl={
          <RefreshControl
            refreshing={shiftStore.loading && shiftStore.initialized}
            onRefresh={shiftStore.refresh}
          />
        }
      />
      {shiftStore.loading && !shiftStore.initialized ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Загружаем смены поблизости…</Text>
        </View>
      ) : null}
    </View>
  );
});

function SortBar({
  activeKey,
  onSelect,
}: {
  activeKey: ShiftSortKey;
  onSelect: (key: ShiftSortKey) => void;
}) {
  return (
    <View style={styles.sortBar}>
      {SORT_OPTIONS.map(option => {
        const isActive = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onSelect(option.key)}
            style={({ pressed }) => [
              styles.sortButton,
              isActive && styles.sortButtonActive,
              pressed && styles.sortButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.sortButtonText,
                isActive && styles.sortButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D1D5DB',
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sortBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  sortButtonPressed: {
    opacity: 0.8,
  },
  sortButtonActive: {
    backgroundColor: '#2563EB',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,244,246,0.6)',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#1F2937',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
  },
});
