import { useContext } from 'react';
import GlobalContext from '@src/contexts/global.context';

export interface UseLngInterface {
  lng: string;
  setLng: (lng: string) => void;
}

const fallOut = () => {
  return Error('No Function Set');
};

// Custom hook for dialog control
export const useLng = (): UseLngInterface => {
  const context = useContext(GlobalContext);
  return {
    lng: context?.lng ?? 'id',
    setLng: context?.setLng ?? fallOut,
  };
};
