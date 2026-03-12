export type UnitSystem = 'metric' | 'imperial';

export const kgToLbs = (kg: number) => +(kg * 2.20462).toFixed(1);
export const lbsToKg = (lbs: number) => +(lbs / 2.20462).toFixed(1);
export const cmToIn = (cm: number) => +(cm * 0.393701).toFixed(1);
export const inToCm = (inches: number) => Math.round(inches / 0.393701);

export function displayWeight(kg: number, us: UnitSystem) {
  return us === 'imperial'
    ? { value: kgToLbs(kg), unit: 'lbs' }
    : { value: kg, unit: 'kg' };
}

export function displayLength(cm: number, us: UnitSystem) {
  return us === 'imperial'
    ? { value: cmToIn(cm), unit: 'in' }
    : { value: cm, unit: 'cm' };
}

export function inputToKg(val: number, us: UnitSystem) {
  return us === 'imperial' ? lbsToKg(val) : val;
}

export function inputToCm(val: number, us: UnitSystem) {
  return us === 'imperial' ? inToCm(val) : val;
}

import { useAppStore } from '@/store/useAppStore';

export function useUnits() {
  const unitSystem = useAppStore((s) => s.unitSystem);
  return {
    unitSystem,
    displayWeight: (kg: number) => displayWeight(kg, unitSystem),
    displayLength: (cm: number) => displayLength(cm, unitSystem),
    inputToKg: (val: number) => inputToKg(val, unitSystem),
    inputToCm: (val: number) => inputToCm(val, unitSystem),
    weightUnit: unitSystem === 'imperial' ? 'lbs' : 'kg',
    lengthUnit: unitSystem === 'imperial' ? 'in' : 'cm',
  };
}
