//Показ логотипа, названия компании, адреса, времени, оплаты, бонуса, прогресса набора.
//При нажатии передавать смену в стор (переход на детали).
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Shift } from '../types/shift';

interface ShiftListItemProps {
  shift: Shift;
  onPress(shift: Shift): void;
}

export function ShiftListItem({ shift, onPress }: ShiftListItemProps) {
  const workerInfo = `${shift.currentWorkers}/${shift.planWorkers}`;
  const workTypeName = shift.workTypes?.[0]?.name;

  return (
    <Pressable
      onPress={() => onPress(shift)}
      style={({ pressed }) => [
        styles.container,
        pressed ? styles.containerPressed : undefined,
      ]}
    >
      {shift.logo ? (
        <Image source={{ uri: shift.logo }} style={styles.logo} />
      ) : (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Text style={styles.logoPlaceholderText}>
            {shift.companyName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.company}>{shift.companyName}</Text>
        {workTypeName ? (
          <Text style={styles.workType}>{workTypeName}</Text>
        ) : null}
        <Text style={styles.address}>{shift.address}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {shift.dateStartByCity} | {shift.timeStartByCity}–
            {shift.timeEndByCity}
          </Text>
          <Text style={styles.metaText}>₽ {shift.priceWorker}</Text>
        </View>
        {typeof shift.bonusPriceWorker === 'number' ? (
          <Text style={styles.metaText}>Бонус: ₽ {shift.bonusPriceWorker}</Text>
        ) : null}
        <Text style={styles.metaText}>Набрано: {workerInfo}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },
  containerPressed: {
    opacity: 0.8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E8EC',
  },
  logoPlaceholderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  company: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  workType: {
    fontSize: 14,
    color: '#2563EB',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
