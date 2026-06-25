import { TERRITORIES } from './map/territories.data';

export const CONTINENT_MAJORITY = [
  { id: 'north_america', bonus: 5 },
  { id: 'south_america', bonus: 2 },
  { id: 'europe',        bonus: 5 },
  { id: 'africa',        bonus: 3 },
  { id: 'asia',          bonus: 7 },
  { id: 'oceania',       bonus: 2 },
] as const;

export const CONTINENT_BONUSES = [
  { id: 'north_america', bonus: 7 },
  { id: 'south_america', bonus: 3 },
  { id: 'europe',        bonus: 7 },
  { id: 'africa',        bonus: 4 },
  { id: 'asia',          bonus: 10 },
  { id: 'oceania',       bonus: 3 },
] as const;

export const CONTINENT_TERRITORIES: Record<string, string[]> = (() => {
  const ids = (cid: string) => TERRITORIES.filter(t => t.continent === cid).map(t => t.id);
  return {
    north_america: ids('north_america'),
    south_america: ids('south_america'),
    europe:        ids('europe'),
    africa:        ids('africa'),
    asia:          ids('asia'),
    oceania:       ids('oceania'),
  };
})();

export const CONTINENT_NAMES: Record<string, string> = {
  north_america: 'Norteamérica',
  south_america: 'Sudamérica',
  europe:        'Europa',
  africa:        'África',
  asia:          'Asia',
  oceania:       'Oceanía',
};

export const CONTINENT_TABLA = CONTINENT_BONUSES.map(cb => {
  const maj = CONTINENT_MAJORITY.find(m => m.id === cb.id)!;
  return { id: cb.id, nombre: CONTINENT_NAMES[cb.id], mayoria: maj.bonus, totalidad: cb.bonus };
});
