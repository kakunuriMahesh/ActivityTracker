import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { GraphData } from '../constants/schema';
import { ACTIVITY_TYPES } from '../constants/config';

const screenWidth = Dimensions.get('window').width;

export default function ActivityChart() {
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [fromDate, setFromDate] = useState<string>('2025-04-01');
  const [toDate, setToDate] = useState<string>('2025-04-28');

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        const currentUser = await AsyncStorage.getItem('currentUser');
        if (currentUser) {
          const user = JSON.parse(currentUser);
          const storedGraphData = await AsyncStorage.getItem('graphData');
          if (storedGraphData) {
            const userGraphData: GraphData[] = JSON.parse(storedGraphData).filter(
              (data: GraphData) => data.userId === user.userId
            );
            setGraphData(userGraphData);
          }
        }
      } catch (error) {
        console.error('Error loading graph data:', error);
      }
    };
    loadGraphData();
  }, []);

  const getFilteredData = () => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return [
        {
          name: 'No Data',
          distance: 1,
          color: '#e0e0e0',
          legendFontColor: '#333',
          legendFontSize: 15,
        },
      ];
    }

    const filteredData = graphData.filter(
      (data) => new Date(data.date) >= from && new Date(data.date) <= to
    );

    const dataByActivity = ACTIVITY_TYPES.map((type, index) => {
      const totalDistance = filteredData
        .filter((data) => data.activity === type.name)
        .reduce((sum, data) => sum + data.distance, 0);
      return {
        name: type.name,
        distance: totalDistance,
        color: ['#ff4444', '#00C851', '#33b5e5', '#ffbb33'][index % 4],
        legendFontColor: '#333',
        legendFontSize: 15,
      };
    }).filter((data) => data.distance > 0);

    return dataByActivity.length > 0
      ? dataByActivity
      : [
          {
            name: 'No Data',
            distance: 1,
            color: '#e0e0e0',
            legendFontColor: '#333',
            legendFontSize: 15,
          },
        ];
  };

  const chartData = getFilteredData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Progress</Text>
      <TextInput
        style={styles.input}
        placeholder="From Date (YYYY-MM-DD)"
        value={fromDate}
        onChangeText={setFromDate}
      />
      <TextInput
        style={styles.input}
        placeholder="To Date (YYYY-MM-DD)"
        value={toDate}
        onChangeText={setToDate}
      />
      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#e0e0e0',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="distance"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});


// TODO: adding mockData

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Dimensions } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { LineChart } from 'react-native-chart-kit';
// import { ACTIVITY_TYPES } from '@/constants/config';

// interface Task {
//   id: string;
//   activity: string;
//   distance: number;
//   createdAt: string;
//   user: string;
//   duration: 'Day' | 'Week' | 'Month' | 'Year';
//   completed: boolean;
// }

// const screenWidth = Dimensions.get('window').width;

// export default function ActivityChart() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [filter, setFilter] = useState<'Day' | 'Month' | 'Year'>('Month');

//   useEffect(() => {
//     const loadTasks = async () => {
//       try {
//         const currentUser = await AsyncStorage.getItem('currentUser');
//         const storedTasks = await AsyncStorage.getItem('tasks');
//         if (storedTasks) {
//           const userTasks: Task[] = JSON.parse(storedTasks).filter(
//             (task: Task) => task.user === currentUser && task.completed
//           );
//           setTasks(userTasks);
//         }
//       } catch (error) {
//         console.error('Error loading tasks:', error);
//       }
//     };
//     loadTasks();
//   }, []);

//   const getFilteredData = () => {
//     const now = new Date();
//     let startDate: Date;
//     if (filter === 'Day') {
//       startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     } else if (filter === 'Month') {
//       startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//     } else {
//       startDate = new Date(now.getFullYear(), 0, 1);
//     }

//     const filteredTasks = tasks.filter(
//       (task) => new Date(task.createdAt) >= startDate
//     );

//     const dataByActivity: { [key: string]: number[] } = {};
//     ACTIVITY_TYPES.forEach((type) => {
//       dataByActivity[type.name] = [];
//     });

//     const labels: string[] = [];
//     if (filter === 'Day') {
//       labels.push('Today');
//       ACTIVITY_TYPES.forEach((type) => {
//         const distance = filteredTasks
//           .filter((task) => task.activity === type.name)
//           .reduce((sum, task) => sum + task.distance, 0);
//         dataByActivity[type.name].push(distance);
//       });
//     } else if (filter === 'Month') {
//       for (let i = 0; i < 4; i++) {
//         const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
//         labels.push(`Week ${i + 1}`);
//         ACTIVITY_TYPES.forEach((type) => {
//           const distance = filteredTasks
//             .filter(
//               (task) =>
//                 task.activity === type.name &&
//                 new Date(task.createdAt) >= weekStart &&
//                 new Date(task.createdAt) < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
//             )
//             .reduce((sum, task) => sum + task.distance, 0);
//           dataByActivity[type.name].push(distance);
//         });
//       }
//     } else {
//       for (let i = 0; i < 12; i++) {
//         const monthStart = new Date(now.getFullYear(), i, 1);
//         labels.push(monthStart.toLocaleString('default', { month: 'short' }));
//         ACTIVITY_TYPES.forEach((type) => {
//           const distance = filteredTasks
//             .filter(
//               (task) =>
//                 task.activity === type.name &&
//                 new Date(task.createdAt).getMonth() === i
//             )
//             .reduce((sum, task) => sum + task.distance, 0);
//           dataByActivity[type.name].push(distance);
//         });
//       }
//     }

//     return { labels, dataByActivity };
//   };

//   const { labels, dataByActivity } = getFilteredData();

//   const chartData = {
//     labels,
//     datasets: ACTIVITY_TYPES.map((type, index) => ({
//       data: dataByActivity[type.name],
//       color: () => ['#ff4444', '#00C851', '#33b5e5', '#ffbb33'][index], // Red, Green, Blue, Yellow
//       strokeWidth: 2,
//     })),
//     legend: ACTIVITY_TYPES.map((type) => type.name),
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Progress</Text>
//       <Picker
//         selectedValue={filter}
//         onValueChange={(value) => setFilter(value)}
//         style={styles.picker}
//       >
//         <Picker.Item label="Day" value="Day" />
//         <Picker.Item label="Month" value="Month" />
//         <Picker.Item label="Year" value="Year" />
//       </Picker>
//       <LineChart
//         data={chartData}
//         width={screenWidth - 40}
//         height={220}
//         chartConfig={{
//           backgroundColor: '#e0e0e0',
//           backgroundGradientFrom: '#ffffff',
//           backgroundGradientTo: '#ffffff',
//           decimalPlaces: 0,
//           color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//           labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//           style: {
//             borderRadius: 16,
//           },
//           propsForDots: {
//             r: '6',
//             strokeWidth: '2',
//             stroke: '#ffa726',
//           },
//         }}
//         bezier
//         style={styles.chart}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 20,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   picker: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
// });