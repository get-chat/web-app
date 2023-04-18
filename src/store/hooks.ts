// Use throughout your app instead of plain `useDispatch` and `useSelector`
import { AppDispatch, RootState } from '@src/store/index';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

type DispatchFunc = () => AppDispatch;
export const useAppDispatch: DispatchFunc = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
