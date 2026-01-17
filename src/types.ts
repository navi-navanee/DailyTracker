export interface Habit {
  id: string;
  name: string;
  icon: string;
  iconType: string;
  color: string;
  streak?: number;
  type?: string;
  hasTarget?: boolean;
  completedDates: string[];
  createdAt?: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddHabit: undefined;
  ChooseIcon: {
    currentIcon: string;
    currentType: string;
    onSelect: (selection: { icon: string; type: string }) => void;
  };
  ChooseColor: {
    currentColor: string;
    onSelect: (color: string) => void;
  };
};
