//Отображение информации о компании, месте, времени, оплате, рейтинге.
//Реализация кнопки «← Назад к списку» в safe area, чтобы возвращаться к списку без дополнительного запроса.

import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import type { Shift } from '../types/shift';

interface ShiftDetailScreenProps {
  shift: Shift;
  onBack(): void;
}

export function ShiftDetailScreen({ shift, onBack }: ShiftDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const workerInfo = `${shift.currentWorkers} из ${shift.planWorkers}`;
  const workType = shift.workTypes?.map(item => item.name).join(', ');

  const contentSpacing = {
    paddingTop: insets.top + 16,
    paddingBottom: insets.bottom + 40,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, contentSpacing]}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Назад к списку</Text>
        </Pressable>
        <View style={styles.header}>
          {shift.logo ? (
            <Image source={{ uri: shift.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <Text style={styles.logoPlaceholderText}>
                {shift.companyName.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.company}>{shift.companyName}</Text>
            {workType ? <Text style={styles.workType}>{workType}</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Когда и где</Text>
          <Text style={styles.cardLine}>{shift.address}</Text>
          <Text style={styles.cardLine}>
            {shift.dateStartByCity}, {shift.timeStartByCity}–
            {shift.timeEndByCity}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Оплата</Text>
          <Text style={styles.price}>₽ {shift.priceWorker}</Text>
          {typeof shift.bonusPriceWorker === 'number' ? (
            <Text style={styles.cardLine}>
              Бонус: ₽ {shift.bonusPriceWorker}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Состав смены</Text>
          <Text style={styles.cardLine}>Записано: {workerInfo}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Рейтинг работодателя</Text>
          <Text style={styles.rating}>
            {typeof shift.customerRating === 'number'
              ? shift.customerRating.toFixed(1)
              : '—'}{' '}
            / 5
          </Text>
          {shift.customerFeedbacksCount ? (
            <Text style={styles.cardLine}>
              Отзывов: {shift.customerFeedbacksCount}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: '#2563EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E8EC',
  },
  logoPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B5563',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  company: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workType: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardLine: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#047857',
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
  },
});
