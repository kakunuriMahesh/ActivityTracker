import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void; // Fixed type
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    onLogin(email, password);
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});


// TODO: fix the error line and not loging in again
// import React, { useState } from 'react';
// import { View, TextInput, Button, StyleSheet } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface LoginFormProps {
//   onLogin: (message: string) => void;
//   onSuccess: () => void;
// }

// export default function LoginForm({ onLogin, onSuccess }: LoginFormProps) {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');

//   const handleLogin = async () => {
//     if (!email || !password) {
//       onLogin('Please enter email and password');
//       return;
//     }

//     try {
//       const storedUsers = await AsyncStorage.getItem('users');
//       const users = storedUsers ? JSON.parse(storedUsers) : [];
//       const user = users.find(
//         (u: { email: string; password: string }) => u.email === email && u.password === password
//       );

//       if (user) {
//         await AsyncStorage.setItem('currentUser', email);
//         onLogin(`Welcome back, ${email}`);
//         onSuccess();
//       } else {
//         onLogin('Invalid email or password');
//       }
//     } catch (error) {
//       onLogin('Error during login');
//     }
//   };

//   return (
//     <View style={styles.form}>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <Button title="Login" onPress={handleLogin} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   form: {
//     width: '100%',
//     maxWidth: 400,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
// });