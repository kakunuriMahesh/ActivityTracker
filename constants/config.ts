export const API_BASE_URL: string = 'https://activity-tracker-backend-paum.onrender.com';

export const ACTIVITY_TYPES: { name: string; minGoal: number }[] = [
  { name: 'Running', minGoal: 3 },
  { name: 'Walking', minGoal: 1 },
  { name: 'Cycling', minGoal: 5 },
  { name: 'Other', minGoal: 0 },
];