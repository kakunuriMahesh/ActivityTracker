

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResult {
  promptAsync: () => Promise<void>;
  request: any;
  loading: boolean;
  error: string | null;
}

const useGoogleAuth = (): GoogleAuthResult => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com',
    androidClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com', // Temporary
    clientId: Platform.OS === 'web' ? '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com' : undefined,
    redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : undefined,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        setLoading(true);
        try {
          const { authentication } = response;
          if (!authentication?.accessToken) {
            setError('No access token received');
            return;
          }

          const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          });
          if (!userInfoResponse.ok) {
            throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
          }
          const userInfo = await userInfoResponse.json();

          if (!userInfo.email) {
            setError('Failed to retrieve user email');
            return;
          }

          // Try login first
          try {
            const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
              email: userInfo.email,
            });
            await AsyncStorage.setItem('currentUser', JSON.stringify(loginResponse.data));
            router.push('/');
          } catch (loginErr) {
            // If user doesn't exist, sign up
            const signupResponse = await axios.post('http://localhost:5000/api/users/signup', {
              email: userInfo.email,
              name: userInfo.name || 'Google User',
              authProvider: 'google',
              image: userInfo.picture,
            });
            await AsyncStorage.setItem('currentUser', JSON.stringify(signupResponse.data));
            router.push('/');
          }
        } catch (err: any) {
          setError(`Failed to authenticate with Google: ${err.message}`);
        } finally {
          setLoading(false);
        }
      } else if (response?.type === 'error') {
        setError(`Google authentication failed: ${response.error || 'Unknown error'}`);
      } else if (response?.type === 'dismiss') {
        setError('Google Sign-In was canceled or dismissed');
      }
    };

    handleGoogleAuth();
  }, [response]);

  return { promptAsync, request, loading, error };
};

export default useGoogleAuth;

// TODO: 

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { router } from 'expo-router';
// import { Platform } from 'react-native';

// WebBrowser.maybeCompleteAuthSession();

// interface GoogleAuthResult {
//   promptAsync: () => Promise<void>;
//   request: any;
//   loading: boolean;
//   error: string | null;
// }

// const useGoogleAuth = (): GoogleAuthResult => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com',
//     androidClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com', // Temporary
//     clientId: Platform.OS === 'web' ? '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com' : undefined,
//     redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : undefined,
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const handleGoogleAuth = async () => {
//       if (response?.type === 'success') {
//         setLoading(true);
//         try {
//           const { authentication } = response;
//           if (!authentication?.accessToken) {
//             setError('No access token received');
//             return;
//           }

//           const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           });
//           if (!userInfoResponse.ok) {
//             throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
//           }
//           const userInfo = await userInfoResponse.json();

//           if (!userInfo.email) {
//             setError('Failed to retrieve user email');
//             return;
//           }

//           // Try login first
//           try {
//             const loginResponse = await axios.post('http://localhost:5000/api/users/login', {
//               email: userInfo.email,
//             });
//             await AsyncStorage.setItem('currentUser', JSON.stringify(loginResponse.data));
//             router.push('/');
//           } catch (loginErr) {
//             // If user doesn't exist, sign up
//             const signupResponse = await axios.post('http://localhost:5000/api/users/signup', {
//               email: userInfo.email,
//               name: userInfo.name || 'Google User',
//               authProvider: 'google',
//               image: userInfo.picture,
//             });
//             await AsyncStorage.setItem('currentUser', JSON.stringify(signupResponse.data));
//             router.push('/');
//           }
//         } catch (err: any) {
//           setError(`Failed to authenticate with Google: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       } else if (response?.type === 'error') {
//         setError(`Google authentication failed: ${response.error || 'Unknown error'}`);
//       } else if (response?.type === 'dismiss') {
//         setError('Google Sign-In was canceled or dismissed');
//       }
//     };

//     handleGoogleAuth();
//   }, [response]);

//   return { promptAsync, request, loading, error };
// };

// export default useGoogleAuth;


// TODO: Ensure Google Sign-In uses the signup/login endpoints.

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import { router } from 'expo-router';
// import { Platform } from 'react-native';

// WebBrowser.maybeCompleteAuthSession();

// interface GoogleAuthResult {
//   promptAsync: () => Promise<void>;
//   request: any;
//   loading: boolean;
//   error: string | null;
// }

// const useGoogleAuth = (): GoogleAuthResult => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com',
//     androidClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com', // Temporary
//     clientId: Platform.OS === 'web' ? '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com' : undefined,
//     redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : undefined,
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const handleGoogleLogin = async () => {
//       console.log('Platform:', Platform.OS);
//       console.log('Google auth request:', request);
//       console.log('Google auth response:', response);

//       if (response?.type === 'success') {
//         setLoading(true);
//         try {
//           const { authentication } = response;
//           if (!authentication?.accessToken) {
//             setError('No access token received');
//             return;
//           }

//           const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           });
//           if (!userInfoResponse.ok) {
//             throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
//           }
//           const userInfo = await userInfoResponse.json();
//           console.log('Google user info:', userInfo);

//           if (!userInfo.email) {
//             setError('Failed to retrieve user email');
//             return;
//           }

//           // Save to backend
//           const backendResponse = await axios.post('http://localhost:5000/api/users', {
//             email: userInfo.email,
//             name: userInfo.name || 'Google User',
//             authProvider: 'google',
//             image: userInfo.picture,
//           });
//           await AsyncStorage.setItem('currentUser', JSON.stringify(backendResponse.data));
//           console.log('Current user set:', await AsyncStorage.getItem('currentUser'));
//           router.push('/');
//         } catch (err: any) {
//           console.error('Google auth error:', err);
//           setError(`Failed to authenticate with Google: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       } else if (response?.type === 'error') {
//         console.error('Google auth error response:', response);
//         setError(`Google authentication failed: ${response.error || 'Unknown error'}`);
//       } else if (response?.type === 'dismiss') {
//         console.error('Google auth dismissed:', response);
//         setError('Google Sign-In was canceled or dismissed');
//       }
//     };

//     handleGoogleLogin();
//   }, [response]);

//   return { promptAsync, request, loading, error };
// };

// export default useGoogleAuth;


// TODO: before DB

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User } from '../constants/schema';
// import { router } from 'expo-router';
// import { Platform } from 'react-native';

// WebBrowser.maybeCompleteAuthSession();

// interface GoogleAuthResult {
//   promptAsync: () => Promise<void>;
//   request: any;
//   loading: boolean;
//   error: string | null;
// }

// const useGoogleAuth = (): GoogleAuthResult => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com',
//     clientId: Platform.OS === 'web'
//       ? '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com'
//       : undefined,
//     redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : undefined,
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const handleGoogleLogin = async () => {
//       console.log('Platform:', Platform.OS);
//       console.log('Google auth request:', request);
//       console.log('Google auth response:', response);

//       if (response?.type === 'success') {
//         setLoading(true);
//         try {
//           const { authentication } = response;
//           console.log('Authentication:', authentication);
//           if (!authentication?.accessToken) {
//             setError('No access token received');
//             return;
//           }

//           // Fetch user info from Google
//           const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           });
//           if (!userInfoResponse.ok) {
//             throw new Error(`HTTP error! status: ${userInfoResponse.status}`);
//           }
//           const userInfo = await userInfoResponse.json();
//           console.log('Google user info:', userInfo);

//           if (!userInfo.email) {
//             setError('Failed to retrieve user email');
//             return;
//           }

//           // Load existing users
//           const storedUsers = await AsyncStorage.getItem('users');
//           let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
//           console.log('Stored users:', users);

//           const existingUser = users.find((u) => u.email === userInfo.email);
//           if (existingUser) {
//             if (existingUser.authProvider === 'manual') {
//               setError('This email is registered with a manual account. Please log in manually.');
//               return;
//             }
//             await AsyncStorage.setItem('currentUser', JSON.stringify(existingUser));
//           } else {
//             const newUser: User = {
//               userId: userInfo.id,
//               name: userInfo.name || 'Google User',
//               email: userInfo.email,
//               authProvider: 'google',
//               image: userInfo.picture,
//               createdAt: new Date().toISOString(),
//             };
//             users.push(newUser);
//             await AsyncStorage.setItem('users', JSON.stringify(users));
//             await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
//           }

//           console.log('Current user set:', await AsyncStorage.getItem('currentUser'));
//           router.push('/');
//         } catch (err: any) {
//           console.error('Google auth error:', err);
//           setError(`Failed to authenticate with Google: ${err.message}`);
//         } finally {
//           setLoading(false);
//         }
//       } else if (response?.type === 'error') {
//         console.error('Google auth error response:', response);
//         setError(`Google authentication failed: ${response.error || 'Unknown error'}`);
//       } else if (response?.type === 'dismiss') {
//         console.error('Google auth dismissed:', response);
//         setError('Google Sign-In was canceled or dismissed');
//       }
//     };

//     handleGoogleLogin();
//   }, [response]);

//   return { promptAsync, request, loading, error };
// };

// export default useGoogleAuth;

// TODO: in Phone getting error

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User } from '../constants/schema';
// import { router } from 'expo-router';
// import { Platform } from 'react-native';

// WebBrowser.maybeCompleteAuthSession();

// interface GoogleAuthResult {
//   promptAsync: () => Promise<void>;
//   request: any;
//   loading: boolean;
//   error: string | null;
// }

// const useGoogleAuth = (): GoogleAuthResult => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     clientId: Platform.OS === 'web'
//       ? '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com' // Web Client ID
//       : 'YOUR_MOBILE_CLIENT_ID', // Replace with iOS or Android Client ID for Expo Go
//     // For Expo Go, use expoClientId
//     expoClientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com',
//     // For standalone builds (optional):
//     // iosClientId: 'YOUR_IOS_CLIENT_ID',
//     // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
//     redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : 'activity-tracker://',
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const handleGoogleLogin = async () => {
//       console.log('Google auth response:', response);
//       if (response?.type === 'success') {
//         setLoading(true);
//         try {
//           const { authentication } = response;
//           if (!authentication?.accessToken) {
//             setError('No access token received');
//             return;
//           }

//           // Fetch user info from Google
//           const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           });
//           const userInfo = await userInfoResponse.json();
//           console.log('Google user info:', userInfo);

//           if (!userInfo.email) {
//             setError('Failed to retrieve user email');
//             return;
//           }

//           // Load existing users
//           const storedUsers = await AsyncStorage.getItem('users');
//           let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

//           const existingUser = users.find((u) => u.email === userInfo.email);
//           if (existingUser) {
//             // Check if account uses a different provider
//             if (existingUser.authProvider === 'manual') {
//               setError('This email is registered with a manual account. Please log in manually.');
//               return;
//             }
//             // Update current user
//             await AsyncStorage.setItem('currentUser', JSON.stringify(existingUser));
//           } else {
//             // Create new Google user
//             const newUser: User = {
//               userId: userInfo.id,
//               name: userInfo.name || 'Google User',
//               email: userInfo.email,
//               authProvider: 'google',
//               image: userInfo.picture,
//               createdAt: new Date().toISOString(),
//             };
//             users.push(newUser);
//             await AsyncStorage.setItem('users', JSON.stringify(users));
//             await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
//           }

//           // Redirect to dashboard
//           router.push('/');
//         } catch (err) {
//           console.error('Google auth error:', err);
//           setError('Failed to authenticate with Google');
//         } finally {
//           setLoading(false);
//         }
//       } else if (response?.type === 'error') {
//         console.error('Google auth error response:', response);
//         setError(`Google authentication failed: ${response.error || 'Unknown error'}`);
//       }
//     };

//     handleGoogleLogin();
//   }, [response]);

//   return { promptAsync, request, loading, error };
// };

// export default useGoogleAuth;

// FIXME: error when i open in mobile but working in web app

// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { useEffect, useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { User } from '../constants/schema';
// import { router } from 'expo-router';
// import { useNavigation } from '@react-navigation/native';

// WebBrowser.maybeCompleteAuthSession();

// interface GoogleAuthResult {
//   promptAsync: () => Promise<void>;
//   request: any; // expo-auth-session's request object
//   loading: boolean;
//   error: string | null;
// }

// const useGoogleAuth = (): GoogleAuthResult => {
//   const [request, response, promptAsync] = Google.useAuthRequest({
//     clientId: '782952927346-96hqv6n946tcpkd1v6m0ftgs7knk3gbs.apps.googleusercontent.com', // Replace with your Web Client ID
//     // For standalone builds (optional):
//     // iosClientId: 'YOUR_IOS_CLIENT_ID',
//     // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const handleGoogleLogin = async () => {
//       if (response?.type === 'success') {
//         setLoading(true);
//         try {
//           const { authentication } = response;
//           if (!authentication?.accessToken) {
//             setError('No access token received');
//             return;
//           }

//           // Fetch user info from Google
//           const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//             headers: { Authorization: `Bearer ${authentication.accessToken}` },
//           });
//           const userInfo = await userInfoResponse.json();

//           if (!userInfo.email) {
//             setError('Failed to retrieve user email');
//             return;
//           }

//           // Load existing users
//           const storedUsers = await AsyncStorage.getItem('users');
//           let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

//           const existingUser = users.find((u) => u.email === userInfo.email);
//           if (existingUser) {
//             // Check if account uses a different provider
//             if (existingUser.authProvider === 'manual') {
//               setError('This email is registered with a manual account. Please log in manually.');
//               return;
//             }
//             // Update current user
//             await AsyncStorage.setItem('currentUser', JSON.stringify(existingUser));
//           } else {
//             // Create new Google user
//             const newUser: User = {
//               userId: userInfo.id,
//               name: userInfo.name || 'Google User',
//               email: userInfo.email,
//               authProvider: 'google',
//               image: userInfo.picture,
//               createdAt: new Date().toISOString(),
//             };
//             users.push(newUser);
//             await AsyncStorage.setItem('users', JSON.stringify(users));
//             await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
//           }

//           // Redirect to dashboard
//           router.push('/');
//         // navigation.navigate('/activity-tracker/')
//         } catch (err) {
//           console.error('Google auth error:', err);
//           setError('Failed to authenticate with Google');
//         } finally {
//           setLoading(false);
//         }
//       } else if (response?.type === 'error') {
//         setError('Google authentication failed');
//       }
//     };

//     handleGoogleLogin();
//   }, [response]);

//   return { promptAsync, request, loading, error };
// };

// export default useGoogleAuth;
