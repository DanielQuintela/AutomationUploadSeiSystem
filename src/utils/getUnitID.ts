import { unitMAP } from '../config/unitMap';

export function getUnitID(unitName: string): number | undefined {
  return unitMAP[unitName];
}
