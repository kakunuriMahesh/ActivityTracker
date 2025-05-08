
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGoogleAuth from '../utils/googleAuth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { promptAsync, loading, error: googleError } = useGoogleAuth();

  const handleManualSignup = async () => {
    try {
      const response = await axios.post('https://activity-tracker-backend-paum.onrender.com/api/users/signup', {
        email,
        name,
        authProvider: 'manual',
      });
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
      router.push('/');
    } catch (err) {
      setError('Signup failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGoogleSignup = async () => {
    await promptAsync();
    // Google auth handled in useGoogleAuth.ts
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {googleError && <Text style={styles.error}>{googleError}</Text>}
      <Button title="Sign Up (Manual)" onPress={handleManualSignup} disabled={loading} />
      <Button title="Sign Up with Google" onPress={handleGoogleSignup} disabled={loading} />
      <Button title="Go to Login" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', marginBottom: 10 },
});

//  TODO: POST /api/users/signup

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import useGoogleAuth from '../utils/googleAuth';

// export default function SignupScreen() {
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const { promptAsync, loading, error: googleError } = useGoogleAuth();

//   const handleManualSignup = async () => {
//     try {
//       const response = await axios.post('https://activity-tracker-backend-paum.onrender.com/api/users/signup', {
//         email,
//         name,
//         authProvider: 'manual',
//       });
//       await AsyncStorage.setItem('currentUser', JSON.stringify(response.data));
//       router.push('/');
//     } catch (err) {
//       setError('Signup failed: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   const handleGoogleSignup = async () => {
//     await promptAsync();
//     // Google auth handled in useGoogleAuth.ts
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign Up</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />
//       {error && <Text style={styles.error}>{error}</Text>}
//       {googleError && <Text style={styles.error}>{googleError}</Text>}
//       <Button title="Sign Up (Manual)" onPress={handleManualSignup} disabled={loading} />
//       <Button title="Sign Up with Google" onPress={handleGoogleSignup} disabled={loading} />
//       <Button title="Go to Login" onPress={() => router.push('/login')} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
// });

//  TODO: Ensure the signup screen uses POST /api/users/signup.

// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
// import axios from 'axios';
// import { router } from 'expo-router';
// import useGoogleAuth from '../utils/googleAuth';

// export default function SignupScreen() {
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const { promptAsync, loading, error: googleError } = useGoogleAuth();

//   const handleManualSignup = async () => {
//     try {
//       const response = await axios.post('https://activity-tracker-backend-paum.onrender.com/api/users', {
//         email,
//         name,
//         authProvider: 'manual',
//       });
//       // Store userId in AsyncStorage or state for testing
//       router.push('/login');
//     } catch (err) {
//       setError('Signup failed: ' + err.response?.data?.error || err.message);
//     }
//   };

//   const handleGoogleSignup = async () => {
//     await promptAsync();
//     // Google auth handled in useGoogleAuth.ts
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Sign Up</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Name"
//         value={name}
//         onChangeText={setName}
//       />
//       {error && <Text style={styles.error}>{error}</Text>}
//       {googleError && <Text style={styles.error}>{googleError}</Text>}
//       <Button title="Sign Up (Manual)" onPress={handleManualSignup} disabled={loading} />
//       <Button title="Sign Up with Google" onPress={handleGoogleSignup} disabled={loading} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
//   input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
//   error: { color: 'red', marginBottom: 10 },
// });

// TODO: connecting to DB

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import SignupForm from '../components/SignupForm';
// import useGoogleAuth from '../utils/googleAuth';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import uuid from 'react-native-uuid';

// export default function SignupScreen() {
//   const [message, setMessage] = useState<string>('');
//   const { promptAsync, request, loading, error } = useGoogleAuth();

//   const handleSignup = async (name: string, email: string, password: string) => {
//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       let users = storedUsers ? JSON.parse(storedUsers) : [];
//       if (users.find((u: { email: string }) => u.email === email)) {
//         setMessage('Email already registered');
//         return;
//       }

//       const userId = uuid.v4().toString();
//       const newUser = {
//         userId,
//         name,
//         email,
//         password,
//         authProvider: 'manual',
//         createdAt: new Date().toISOString(),
//       };
//       users.push(newUser);
//       await AsyncStorage.setItem('users', JSON.stringify(users));
//       await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
//       setMessage(`Account created for ${email}`);
//       router.push('/');
//     } catch (error) {
//       console.error('Error during signup:', error);
//       setMessage('Error during signup');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Signup</Text>
//       <SignupForm onSignup={handleSignup} />
//       <Button
//         title={loading ? 'Loading...' : 'Sign Up with Google'}
//         disabled={!request || loading}
//         onPress={() => promptAsync()}
//       />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       {error ? <Text style={styles.error}>{error}</Text> : null}
//       <Button title="Go to Login" onPress={() => router.push('/login')} />
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


// TODO: adding Google SignUp

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import SignupForm from '../components/SignupForm';
// import uuid from 'react-native-uuid';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function SignupScreen() {
//   const [message, setMessage] = useState<string>('');

//   const handleSignup = async (name: string, email: string, password: string) => {
//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       let users = storedUsers ? JSON.parse(storedUsers) : [];
//       if (users.find((u: { email: string }) => u.email === email)) {
//         setMessage('Email already registered');
//         return;
//       }

//       const userId = uuid.v4().toString();
//       const newUser = {
//         userId,
//         name,
//         email,
//         password,
//         createdAt: new Date().toISOString(),
//       };
//       users.push(newUser);
//       await AsyncStorage.setItem('users', JSON.stringify(users));
//       await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
//       setMessage(`Account created for ${email}`);
//       router.push('/');
//     } catch (error) {
//       setMessage('Error during signup');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Signup</Text>
//       <SignupForm onSignup={handleSignup} />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       <Button title="Go to Login" onPress={() => router.push('/login')} />
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


// TODO: adding mock data

// import React, { useState } from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { router } from 'expo-router';
// import SignupForm from '../components/SignupForm';

// export default function SignupScreen() {
//   const [message, setMessage] = useState<string>('');

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Activity Tracker - Signup</Text>
//       <SignupForm
//         onSignup={(msg: string) => setMessage(msg)}
//         onSuccess={() => router.push('/')}
//       />
//       {message ? <Text style={styles.message}>{message}</Text> : null}
//       <Button title="Go to Login" onPress={() => router.push('/login')} />
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