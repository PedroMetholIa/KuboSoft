export type Continent = 'north_america' | 'south_america' | 'europe' | 'africa' | 'asia' | 'oceania';

export interface Territory {
  id: string;
  name: string;
  continent: Continent;
  baseFill: string;
  textureFilter: string;
  svgPath: string;
  labelPosition: { x: number; y: number };
  owner: string | null;
  troops: number;
  neighbors: string[];
  isSelected: boolean;
  isHighlighted: boolean;
}
