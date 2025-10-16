//Запрашиваем разрешение (через PermissionsAndroid / Geolocation.requestAuthorization).
//Обрабатываем ошибки (LocationPermissionError, LocationUnavailableError).
//Возвращаем координаты пользователя через Geolocation.getCurrentPosition.

import Geolocation, { type GeolocationResponse } from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

import type { Coordinates } from '../types/shift';

export class LocationPermissionError extends Error {
  constructor(message = 'Доступ к геолокации отклонён') {
    super(message);
    this.name = 'LocationPermissionError';
  }
}

export class LocationUnavailableError extends Error {
  constructor(message = 'Не удалось определить координаты пользователя') {
    super(message);
    this.name = 'LocationUnavailableError';
  }
}

async function requestAndroidPermission(): Promise<boolean> {
  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Разрешение на геолокацию',
      message: 'Нам нужны точные координаты, чтобы показать смены рядом с вами.',
      buttonPositive: 'Разрешить',
      buttonNegative: 'Отмена',
    },
  );

  return status === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestIOSPermission(): Promise<boolean> {
  const status = await Geolocation.requestAuthorization('whenInUse');
  return status === 'granted';
}

export async function requestUserLocation(): Promise<Coordinates> {
  const permissionGranted = await (async () => {
    if (Platform.OS === 'android') {
      return requestAndroidPermission();
    }

    if (Platform.OS === 'ios') {
      return requestIOSPermission();
    }

    return true;
  })();

  if (!permissionGranted) {
    throw new LocationPermissionError();
  }

  const position = await new Promise<GeolocationResponse>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      resolve,
      error => {
        reject(new LocationUnavailableError(error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      },
    );
  });

  const { latitude, longitude } = position.coords;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new LocationUnavailableError();
  }

  return { latitude, longitude };
}
