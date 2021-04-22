import React from 'react';
import { UseStore, StateSelector } from 'zustand';
import { createGridStore, GridState } from '../store';

const context = React.createContext<UseStore<GridState>>(createGridStore());

const useGridStore = (selector?: StateSelector<GridState, any>): GridState => {
  const currContext = React.useContext(context);
  // @ts-ignore
  return currContext(selector);
};

interface StoreProps {
  children: React.ReactNode;
}
function StoreWrapper({ children }: StoreProps) {
  const [useStore] = React.useState(createGridStore);
  return <context.Provider value={useStore}>{children}</context.Provider>;
}

export { StoreWrapper, useGridStore };
