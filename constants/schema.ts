export interface User {
  userId: string;
  name: string;
  email: string;
  password?: string; // Optional for Google Sign-In users
  authProvider: 'manual' | 'google'; // New field
  image?: string; // Optional for Google profile picture
  createdAt: string;
}

export interface SelfTask {
  taskId: string;
  userId: string;
  activity: string;
  distance: number;
  duration: 'Day' | 'Week' | 'Month' | 'Year';
  createdAt: string;
  completed: boolean;
  stop?: boolean;
  startDate: string;
  endDate: string;
}

export interface Challenge {
  challengeId: string;
  creatorId: string;
  assigneeIds: string[];
  taskId: string;
  title: string;
  rules: string[];
  exceptions: string[];
  reward: number;
  status: 'Pending' | 'Active' | 'Completed' | 'Rejected';
  rejectionNote?: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  duration: 'Day' | 'Week' | 'Month' | 'Year';
}

export interface ChallengeProgress {
  progressId: string;
  challengeId: string;
  userId: string;
  distance: number;
  lastUpdated: string;
}

export interface FinishedTask {
  finishedTaskId: string;
  taskId: string;
  userId: string;
  activity: string;
  distance: number;
  completedAt: string;
}

export interface Reward {
  rewardId: string;
  userId: string;
  type: 'Streak' | 'Rank' | 'Badge' | 'GiftCard';
  value: number | string;
  earnedAt: string;
}

export interface GraphData {
  userId: string;
  activity: string;
  distance: number;
  date: string;
}

// TODO: adding google Account

// export interface User {
//   userId: string;
//   name: string;
//   email: string;
//   password: string;
//   createdAt: string;
// }

// export interface SelfTask {
//   taskId: string;
//   userId: string;
//   activity: string;
//   distance: number;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   createdAt: string;
//   completed: boolean;
//   stop?: boolean;
//   startDate: string;
//   endDate: string;
// }

// export interface Challenge {
//   challengeId: string;
//   creatorId: string;
//   assigneeIds: string[];
//   taskId: string;
//   title: string;
//   rules: string[];
//   exceptions: string[];
//   reward: number;
//   status: 'Pending' | 'Active' | 'Completed' | 'Rejected';
//   rejectionNote?: string;
//   createdAt: string;
//   startDate: string;
//   endDate: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year'; // Added
// }

// export interface ChallengeProgress {
//   progressId: string;
//   challengeId: string;
//   userId: string;
//   distance: number;
//   lastUpdated: string;
// }

// export interface FinishedTask {
//   finishedTaskId: string;
//   taskId: string;
//   userId: string;
//   activity: string;
//   distance: number;
//   completedAt: string;
// }

// export interface Reward {
//   rewardId: string;
//   userId: string;
//   type: 'Streak' | 'Rank' | 'Badge' | 'GiftCard';
//   value: number | string;
//   earnedAt: string;
// }

// export interface GraphData {
//   userId: string;
//   activity: string;
//   distance: number;
//   date: string;
// }

// TODO: adding new challange fields

// export interface User {
//     userId: string;
//     name: string;
//     email: string;
//     password: string;
//     createdAt: string;
//   }
  
//   export interface SelfTask {
//     taskId: string;
//     userId: string;
//     activity: string;
//     distance: number;
//     duration: 'Day' | 'Week' | 'Month' | 'Year';
//     createdAt: string;
//     completed: boolean;
//     stop?: boolean;
//     startDate: string;
//     endDate: string;
//   }
  
//   export interface Challenge {
//     challengeId: string;
//     creatorId: string;
//     assigneeId: string;
//     taskId: string;
//     status: 'Pending' | 'Accepted' | 'Rejected';
//     rejectionNote?: string;
//     createdAt: string;
//   }
  
//   export interface FinishedTask {
//     finishedTaskId: string;
//     taskId: string;
//     userId: string;
//     activity: string;
//     distance: number;
//     completedAt: string;
//   }
  
//   export interface Reward {
//     rewardId: string;
//     userId: string;
//     type: 'Streak' | 'Rank' | 'Badge';
//     value: number | string;
//     earnedAt: string;
//   }
  
//   export interface GraphData {
//     userId: string;
//     activity: string;
//     distance: number;
//     date: string;
//   }