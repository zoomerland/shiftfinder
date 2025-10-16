//Описание типов полей из задания,а также вспомогательные типы (ShiftWorkType, Coordinates).

export interface ShiftWorkType {
  id: number;
  name: string;
  nameGt5?: string;
  nameLt5?: string;
  nameOne?: string;
}

//этот интерфейс на данный момент дублирует Coordinates, но в будущем апи может измениться, соответственно это должны быть два разных типа, пусть и идентичные на данный момент.
export interface ShiftCoordinates {
  latitude: number;
  longitude: number;
}

export interface Shift {
  id: string;
  logo?: string | null;
  coordinates: ShiftCoordinates;
  address: string;
  companyName: string;
  dateStartByCity: string;
  timeStartByCity: string;
  timeEndByCity: string;
  currentWorkers: number;
  planWorkers: number;
  workTypes: ShiftWorkType[];
  priceWorker: number;
  bonusPriceWorker?: number;
  customerFeedbacksCount?: string | number;
  customerRating?: number;
  isPromotionEnabled?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
