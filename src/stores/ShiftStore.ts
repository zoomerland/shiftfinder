/*
Хранение списка смен, выбранной смены, статуса загрузки, ошибком, координат.
Реализование initialize, refresh, selectShift, resetSelection.
Добавление ычисляемого свойства sortedShifts.
Добавление поддержки сортировок (date, street, payment, workers, company) и методы выбора.
Сохранение выбранной сортировки в AsyncStorage и восстанавление при старте.
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeObservable, observable, action, computed, runInAction } from 'mobx';

import { requestUserLocation, LocationPermissionError } from '../services/location';
import type { Coordinates, Shift } from '../types/shift';

const SHIFTS_ENDPOINT = 'https://mobile.handswork.pro/api/shifts/map-list-unauthorized';
const SORT_STORAGE_KEY = '@handswork/sortKey';

export type ShiftSortKey = 'date' | 'street' | 'payment' | 'workers' | 'company';

interface ShiftApiResponse {
  data: Shift[];
}

function isShiftSortKey(value: string | null): value is ShiftSortKey {
  return value === 'date' || value === 'street' || value === 'payment' || value === 'workers' || value === 'company';
}

export class ShiftStore {
  shifts: Shift[] = [];
  loading = false;
  error: string | null = null;
  selectedShift: Shift | null = null;
  location: Coordinates | null = null;
  initialized = false;
  sortKey: ShiftSortKey = 'date';

  constructor() {
    makeObservable(this, {
      shifts: observable.shallow,
      loading: observable,
      error: observable,
      selectedShift: observable,
      location: observable,
      initialized: observable,
      sortKey: observable,
      shiftCount: computed,
      sortedShifts: computed,
      isEmpty: computed,
      initialize: action.bound,
      refresh: action.bound,
      selectShift: action.bound,
      resetSelection: action.bound,
      setSortKey: action.bound,
    });

    this.loadSortPreference();
  }

  get shiftCount(): number {
    return this.shifts.length;
  }

  get sortedShifts(): Shift[] {
    const compare = this.getComparator(this.sortKey);
    return this.shifts.slice().sort(compare);
  }

  get isEmpty(): boolean {
    return this.initialized && this.shifts.length === 0 && !this.loading;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const coordinates = await requestUserLocation();
      await this.fetchShifts(coordinates);
    } catch (error) {
      const message =
        error instanceof LocationPermissionError
          ? 'Для работы приложения разрешите доступ к геолокации.'
          : error instanceof Error
          ? error.message
          : 'Не удалось загрузить список смен.';

      runInAction(() => {
        this.error = message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
        this.initialized = true;
      });
    }
  }

  async refresh(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const coordinates =
        this.location ??
        (await requestUserLocation().catch(error => {
          if (error instanceof LocationPermissionError) {
            throw error;
          }
          return null;
        }));

      if (!coordinates) {
        throw new Error('Не удалось определить координаты пользователя.');
      }

      await this.fetchShifts(coordinates);
    } catch (error) {
      const message =
        error instanceof LocationPermissionError
          ? 'Для обновления списка предоставьте доступ к геолокации.'
          : error instanceof Error
          ? error.message
          : 'Не удалось обновить список смен.';

      runInAction(() => {
        this.error = message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  selectShift(shift: Shift): void {
    this.selectedShift = shift;
  }

  resetSelection(): void {
    this.selectedShift = null;
  }

  setSortKey(nextKey: ShiftSortKey): void {
    if (this.sortKey === nextKey) {
      return;
    }

    this.sortKey = nextKey;
    this.persistSortPreference();
  }

  private loadSortPreference(): void {
    AsyncStorage.getItem(SORT_STORAGE_KEY)
      .then(stored => {
        if (isShiftSortKey(stored)) {
          runInAction(() => {
            this.sortKey = stored;
          });
        }
      })
      .catch(() => {
        // Ignore storage errors; fall back to default sort.
      });
  }

  private persistSortPreference(): void {
    AsyncStorage.setItem(SORT_STORAGE_KEY, this.sortKey).catch(() => {
      // Ignore storage errors.
    });
  }

  private async fetchShifts(coordinates: Coordinates): Promise<void> {
    const query = `latitude=${coordinates.latitude}&longitude=${coordinates.longitude}`;
    const response = await fetch(`${SHIFTS_ENDPOINT}?${query}`);

    if (!response.ok) {
      throw new Error('Сервер вернул ошибку при загрузке смен.');
    }

    const payload: ShiftApiResponse = await response.json();

    runInAction(() => {
      this.location = coordinates;
      this.shifts = payload.data.slice();
    });
  }

  private getComparator(key: ShiftSortKey) {
    switch (key) {
      case 'street': {
        return (left: Shift, right: Shift) =>
          (left.address ?? '').localeCompare(right.address ?? '', 'ru');
      }
      case 'payment': {
        return (left: Shift, right: Shift) => right.priceWorker - left.priceWorker;
      }
      case 'workers': {
        return (left: Shift, right: Shift) => right.currentWorkers - left.currentWorkers;
      }
      case 'company': {
        return (left: Shift, right: Shift) =>
          (left.companyName ?? '').localeCompare(right.companyName ?? '', 'ru');
      }
      case 'date':
      default: {
        return (left: Shift, right: Shift) =>
          this.getShiftTimestamp(left) - this.getShiftTimestamp(right);
      }
    }
  }

  private getShiftTimestamp(shift: Shift): number {
    const [day = '01', month = '01', year = '1970'] = shift.dateStartByCity.split('.');
    const [hours = '00', minutes = '00'] = shift.timeStartByCity.split(':');
    const isoLike = `${year}-${month}-${day}T${hours}:${minutes}:00`;
    const time = Date.parse(isoLike);
    return Number.isNaN(time) ? 0 : time;
  }
}

export const shiftStore = new ShiftStore();
