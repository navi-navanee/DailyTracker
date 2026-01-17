export interface Habit {
  id: string;
  name: string;
  icon: string;
  iconType: string;
  color: string;
  streak?: number;
  type?: string;
  hasTarget?: boolean;
  progress?: Record<string, number>;
  completedDates: string[];
  createdAt?: string;
  reminders?: { id: string, time: string, isEnabled: boolean, days: string, notificationId?: string }[];
  categories?: string[];
  targetType?: 'daily' | 'weekly';
  targetCount?: number;
}

export type RootStackParamList = {
  Home: undefined;
  AddHabit: { habit?: Habit } | undefined;
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
