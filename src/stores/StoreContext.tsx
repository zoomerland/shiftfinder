import React, { createContext, useContext } from 'react';

import { shiftStore, ShiftStore } from './ShiftStore';

export interface RootStore {
  shiftStore: ShiftStore;
}

const defaultValue: RootStore = {
  shiftStore,
};

const StoreContext = createContext<RootStore>(defaultValue);

interface StoreProviderProps {
  children: React.ReactNode;
  value?: RootStore;
}

export function StoreProvider({ children, value }: StoreProviderProps) {
  return (
    <StoreContext.Provider value={value ?? defaultValue}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStores(): RootStore {
  return useContext(StoreContext);
}
