import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, SelfTask, Challenge, ChallengeProgress, FinishedTask, Reward, GraphData } from './schema';

export const mockUsers: User[] = [
  {
    userId: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    authProvider: 'manual',
    createdAt: '2025-04-01T00:00:00Z',
  },
  {
    userId: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password456',
    authProvider: 'manual',
    createdAt: '2025-04-02T00:00:00Z',
  },
  {
    userId: 'google123',
    name: 'Google User',
    email: 'googleuser@example.com',
    authProvider: 'google',
    image: 'https://example.com/profile.jpg',
    createdAt: '2025-04-03T00:00:00Z',
  },
];

export const mockSelfTasks: SelfTask[] = [
  {
    taskId: 'task1',
    userId: 'user1',
    activity: 'Running',
    distance: 5,
    duration: 'Week',
    createdAt: '2025-04-28T00:00:00Z',
    completed: false,
    startDate: '2025-04-28T00:00:00Z',
    endDate: '2025-05-04T23:59:59Z',
  },
];

export const mockChallenges: Challenge[] = [
  {
    challengeId: 'challenge1',
    creatorId: 'user1',
    assigneeIds: ['user2', 'google123'],
    taskId: 'task1',
    title: 'Running Challenge',
    rules: ['Complete 12km in a week', 'Track via app'],
    exceptions: ['Injury allows withdrawal', 'Weather delays accepted'],
    reward: 50,
    status: 'Active',
    createdAt: '2025-04-28T00:00:00Z',
    startDate: '2025-04-28T00:00:00Z',
    endDate: '2025-05-04T23:59:59Z',
    duration: 'Week',
  },
];

export const mockChallengeProgress: ChallengeProgress[] = [
  {
    progressId: 'progress1',
    challengeId: 'challenge1',
    userId: 'user1',
    distance: 8,
    lastUpdated: '2025-04-29T00:00:00Z',
  },
  {
    progressId: 'progress2',
    challengeId: 'challenge1',
    userId: 'user2',
    distance: 6,
    lastUpdated: '2025-04-29T00:00:00Z',
  },
  {
    progressId: 'progress3',
    challengeId: 'challenge1',
    userId: 'google123',
    distance: 4,
    lastUpdated: '2025-04-29T00:00:00Z',
  },
];

export const mockFinishedTasks: FinishedTask[] = [
  {
    finishedTaskId: 'ft1',
    taskId: 'task1',
    userId: 'user1',
    activity: 'Running',
    distance: 5,
    completedAt: '2025-04-27T00:00:00Z',
  },
];

export const mockRewards: Reward[] = [
  {
    rewardId: 'reward1',
    userId: 'user1',
    type: 'Streak',
    value: 7,
    earnedAt: '2025-04-28T00:00:00Z',
  },
  {
    rewardId: 'reward2',
    userId: 'user1',
    type: 'Rank',
    value: 'Advanced',
    earnedAt: '2025-04-28T00:00:00Z',
  },
];

export const mockGraphData: GraphData[] = [
  {
    userId: 'user1',
    activity: 'Running',
    distance: 5,
    date: '2025-04-27T00:00:00Z',
  },
  {
    userId: 'user1',
    activity: 'Walking',
    distance: 2,
    date: '2025-04-26T00:00:00Z',
  },
];

export async function initializeMockData() {
  try {
    await AsyncStorage.setItem('users', JSON.stringify(mockUsers));
    await AsyncStorage.setItem('selfTasks', JSON.stringify(mockSelfTasks));
    await AsyncStorage.setItem('challenges', JSON.stringify(mockChallenges));
    await AsyncStorage.setItem('challengeProgress', JSON.stringify(mockChallengeProgress));
    await AsyncStorage.setItem('finishedTasks', JSON.stringify(mockFinishedTasks));
    await AsyncStorage.setItem('rewards', JSON.stringify(mockRewards));
    await AsyncStorage.setItem('graphData', JSON.stringify(mockGraphData));
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}

// TODO: adding google Account

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User, SelfTask, Challenge, ChallengeProgress, FinishedTask, Reward, GraphData } from './schema';

// export const mockUsers: User[] = [
//   {
//     userId: 'user1',
//     name: 'John Doe',
//     email: 'john@example.com',
//     password: 'password123',
//     createdAt: '2025-04-01T00:00:00Z',
//   },
//   {
//     userId: 'user2',
//     name: 'Jane Smith',
//     email: 'jane@example.com',
//     password: 'password456',
//     createdAt: '2025-04-02T00:00:00Z',
//   },
// ];

// export const mockSelfTasks: SelfTask[] = [
//   {
//     taskId: 'task1',
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     duration: 'Week',
//     createdAt: '2025-04-28T00:00:00Z',
//     completed: false,
//     startDate: '2025-04-28T00:00:00Z',
//     endDate: '2025-05-04T23:59:59Z',
//   },
// ];

// export const mockChallenges: Challenge[] = [
//   {
//     challengeId: 'challenge1',
//     creatorId: 'user1',
//     assigneeIds: ['user2'],
//     taskId: 'task1',
//     title: 'Running Challenge',
//     rules: ['Complete 12km in a week', 'Track via app'],
//     exceptions: ['Injury allows withdrawal', 'Weather delays accepted'],
//     reward: 50,
//     status: 'Active',
//     createdAt: '2025-04-28T00:00:00Z',
//     startDate: '2025-04-28T00:00:00Z',
//     endDate: '2025-05-04T23:59:59Z',
//   },
// ];

// export const mockChallengeProgress: ChallengeProgress[] = [
//   {
//     progressId: 'progress1',
//     challengeId: 'challenge1',
//     userId: 'user1',
//     distance: 8,
//     lastUpdated: '2025-04-29T00:00:00Z',
//   },
//   {
//     progressId: 'progress2',
//     challengeId: 'challenge1',
//     userId: 'user2',
//     distance: 6,
//     lastUpdated: '2025-04-29T00:00:00Z',
//   },
// ];

// export const mockFinishedTasks: FinishedTask[] = [
//   {
//     finishedTaskId: 'ft1',
//     taskId: 'task1',
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     completedAt: '2025-04-27T00:00:00Z',
//   },
// ];

// export const mockRewards: Reward[] = [
//   {
//     rewardId: 'reward1',
//     userId: 'user1',
//     type: 'Streak',
//     value: 7,
//     earnedAt: '2025-04-28T00:00:00Z',
//   },
//   {
//     rewardId: 'reward2',
//     userId: 'user1',
//     type: 'Rank',
//     value: 'Advanced',
//     earnedAt: '2025-04-28T00:00:00Z',
//   },
// ];

// export const mockGraphData: GraphData[] = [
//   {
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     date: '2025-04-27T00:00:00Z',
//   },
//   {
//     userId: 'user1',
//     activity: 'Walking',
//     distance: 2,
//     date: '2025-04-26T00:00:00Z',
//   },
// ];

// export async function initializeMockData() {
//   try {
//     await AsyncStorage.setItem('users', JSON.stringify(mockUsers));
//     await AsyncStorage.setItem('selfTasks', JSON.stringify(mockSelfTasks));
//     await AsyncStorage.setItem('challenges', JSON.stringify(mockChallenges));
//     await AsyncStorage.setItem('challengeProgress', JSON.stringify(mockChallengeProgress));
//     await AsyncStorage.setItem('finishedTasks', JSON.stringify(mockFinishedTasks));
//     await AsyncStorage.setItem('rewards', JSON.stringify(mockRewards));
//     await AsyncStorage.setItem('graphData', JSON.stringify(mockGraphData));
//   } catch (error) {
//     console.error('Error initializing mock data:', error);
//   }
// }

// TODO: adding new challange fields

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User, SelfTask, Challenge, FinishedTask, Reward, GraphData } from './schema';

// export const mockUsers: User[] = [
//   {
//     userId: 'user1',
//     name: 'John Doe',
//     email: 'john@example.com',
//     password: 'password123',
//     createdAt: '2025-04-01T00:00:00Z',
//   },
//   {
//     userId: 'user2',
//     name: 'Jane Smith',
//     email: 'jane@example.com',
//     password: 'password456',
//     createdAt: '2025-04-02T00:00:00Z',
//   },
// ];

// export const mockSelfTasks: SelfTask[] = [
//   {
//     taskId: 'task1',
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     duration: 'Week',
//     createdAt: '2025-04-28T00:00:00Z',
//     completed: false,
//     startDate: '2025-04-28T00:00:00Z',
//     endDate: '2025-05-04T23:59:59Z',
//   },
// ];

// export const mockChallenges: Challenge[] = [];

// export const mockFinishedTasks: FinishedTask[] = [
//   {
//     finishedTaskId: 'ft1',
//     taskId: 'task1',
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     completedAt: '2025-04-27T00:00:00Z',
//   },
// ];

// export const mockRewards: Reward[] = [
//   {
//     rewardId: 'reward1',
//     userId: 'user1',
//     type: 'Streak',
//     value: 7,
//     earnedAt: '2025-04-28T00:00:00Z',
//   },
//   {
//     rewardId: 'reward2',
//     userId: 'user1',
//     type: 'Rank',
//     value: 'Advanced',
//     earnedAt: '2025-04-28T00:00:00Z',
//   },
// ];

// export const mockGraphData: GraphData[] = [
//   {
//     userId: 'user1',
//     activity: 'Running',
//     distance: 5,
//     date: '2025-04-27T00:00:00Z',
//   },
//   {
//     userId: 'user1',
//     activity: 'Walking',
//     distance: 2,
//     date: '2025-04-26T00:00:00Z',
//   },
// ];

// export async function initializeMockData() {
//   try {
//     await AsyncStorage.setItem('users', JSON.stringify(mockUsers));
//     await AsyncStorage.setItem('selfTasks', JSON.stringify(mockSelfTasks));
//     await AsyncStorage.setItem('challenges', JSON.stringify(mockChallenges));
//     await AsyncStorage.setItem('finishedTasks', JSON.stringify(mockFinishedTasks));
//     await AsyncStorage.setItem('rewards', JSON.stringify(mockRewards));
//     await AsyncStorage.setItem('graphData', JSON.stringify(mockGraphData));
//   } catch (error) {
//     console.error('Error initializing mock data:', error);
//   }
// }