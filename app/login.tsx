
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useGoogleAuth from '../utils/googleAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { promptAsync, loading, error: googleError } = useGoogleAuth();

  const handleManualLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email });
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
      router.push('/');
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGoogleLogin = async () => {
    await promptAsync();
    // Google auth handled in useGoogleAuth.ts
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {googleError && <Text style={styles.error}>{googleError}</Text>}
      <Button title="Login (Manual)" onPress={handleManualLogin} disabled={loading} />
      <Button title="Login with Google" onPress={handleGoogleLogin} disabled={loading} />
      <Button title="Go to Signup" onPress={() => router.push('/signup')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10 },
});

// TODO: new POST /api/users/login

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import useGoogleAuth from '../utils/googleAuth';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [error, setError] = useState('');
//   const { promptAsync, loading, error: googleError } = useGoogleAuth();

//   const handleManualLogin = async () => {
//     try {
//       const response = await axios.post('http://localhost:5000/api/users/login', { email });
//       await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
//       router.push('/');
//     } catch (err) {
//       setError('Login failed: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleGoogleLogin = async () => {
//     await promptAsync();
//     // Google auth handled in useGoogleAuth.ts
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       {error && <Text style={styles.error}>{error}</Text>}
//       {googleError && <Text style={styles.error}>{googleError}</Text>}
//       <Button title="Login (Manual)" onPress={handleManualLogin} disabled={loading} />
//       <Button title="Login with Google" onPress={handleGoogleLogin} disabled={loading} />
//       <Button title="Go to Signup" onPress={() => router.push('/signup')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
// });

// TODO: Update the login screen to use the new POST /api/users/login endpoint.

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import LoginForm from '../components/LoginForm';
// import useGoogleAuth from '../utils/googleAuth';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function LoginScreen() {
//   const [message, setMessage] = useState<string>('');
//   const { promptAsync, request, loading, error } = useGoogleAuth();

//   const handleLogin = async (email: string, password: string) => {
//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       if (!storedUsers) {
//         setMessage('No users registered');
//         return;
//       }
//       const users = JSON.parse(storedUsers);
//       const user = users.find(
//         (u: { email: string; password: string; authProvider: string }) =>
//           u.email === email && u.password === password && u.authProvider === 'manual'
//       );

//       if (user) {
//         await AsyncStorage.setItem('currentUser', JSON.stringify(user));
//         setMessage(`Welcome back, ${email}`);
//         router.push('/');
//       } else {
//         setMessage('Invalid email or password');
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       setMessage('Error during login');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Login</Text>
//       <LoginForm onLogin={handleLogin} />
//       <Button
//         title={loading ? 'Loading...' : 'Login with Google'}
//         disabled={!request || loading}
//         onPress={() => promptAsync()}
//       />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       {error ? <Text style={styles.error}>{error}</Text> : null}
//       <Button title="Go to Signup" onPress={() => router.push('/signup')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   message: {
//     marginTop: 20,
//     color: 'blue',
//   },
//   error: {
//     marginTop: 20,
//     color: 'red',
//   },
// });

// TODO: Adding google Login

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import LoginForm from '../components/LoginForm';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function LoginScreen() {
//   const [message, setMessage] = useState<string>('');

//   const handleLogin = async (email: string, password: string) => {
//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       if (!storedUsers) {
//         setMessage('No users registered');
//         return;
//       }
//       const users = JSON.parse(storedUsers);
//       const user = users.find(
//         (u: { email: string; password: string }) => u.email === email && u.password === password
//       );

//       if (user) {
//         await AsyncStorage.setItem('currentUser', JSON.stringify(user));
//         setMessage(`Welcome back, ${email}`);
//         router.push('/');
//       } else {
//         setMessage('Invalid email or password');
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       setMessage('Error during login');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Login</Text>
//       <LoginForm onLogin={handleLogin} />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       <Button title="Go to Signup" onPress={() => router.push('/signup')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   message: {
//     marginTop: 20,
//     color: 'blue',
//   },
// });

// TODO: not logging in again with same details

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import LoginForm from '../components/LoginForm';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function LoginScreen() {
//   const [message, setMessage] = useState<string>('');

//   const handleLogin = async (email: string, password: string) => {
//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       if (!storedUsers) {
//         setMessage('No users registered');
//         return;
//       }
//       const users = JSON.parse(storedUsers);
//       const user = users.find(
//         (u: { email: string; password: string }) => u.email === email && u.password === password
//       );

//       if (user) {
//         await AsyncStorage.setItem('currentUser', JSON.stringify(user));
//         setMessage(`Welcome back, ${email}`);
//         router.push('/');
//       } else {
//         setMessage('Invalid email or password');
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       setMessage('Error during login');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Login</Text>
//       <LoginForm onLogin={handleLogin} />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       <Button title="Go to Signup" onPress={() => router.push('/signup')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   message: {
//     marginTop: 20,
//     color: 'blue',
//   },
// });

// TODO: implement login functionality

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import LoginForm from '../components/LoginForm';

// export default function LoginScreen() {
//   const [message, setMessage] = useState<string>('');

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Login</Text>
//       <LoginForm
//         onLogin={(msg: string) => setMessage(msg)}
//         onSuccess={() => router.push('/')}
//       />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       <Button title="Go to Signup" onPress={() => router.push('/signup')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   message: {
//     marginTop: 20,
//     color: 'blue',
//   },
// });