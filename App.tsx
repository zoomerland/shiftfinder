/*
Обернуть приложение в SafeAreaProvider и StoreProvider.
В useEffect вызвать shiftStore.initialize().
Показывать либо список, либо детали в зависимости от selectedShift.
Настроить StatusBar.
*/
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';

import { StoreProvider, useStores } from './src/stores/StoreContext';
import { ShiftDetailScreen } from './src/screens/ShiftDetailScreen';
import { ShiftListScreen } from './src/screens/ShiftListScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <StoreProvider>
        <RootContent />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const RootContent = observer(() => {
  const { shiftStore } = useStores();

  useEffect(() => {
    shiftStore.initialize();
  }, [shiftStore]);

  if (shiftStore.selectedShift) {
    return (
      <ShiftDetailScreen
        shift={shiftStore.selectedShift}
        onBack={shiftStore.resetSelection}
      />
    );
  }

  return <ShiftListScreen />;
});

export default App;
