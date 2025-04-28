import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email: string, password: string) => {
  const storedUsers = await AsyncStorage.getItem('users');
  const users = storedUsers ? JSON.parse(storedUsers) : [];
  const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);
  if (user) {
    await AsyncStorage.setItem('currentUser', email);
    return user;
  }
  throw new Error('Invalid credentials');
};

export const signup = async (email: string, password: string) => {
  const storedUsers = await AsyncStorage.getItem('users');
  let users = storedUsers ? JSON.parse(storedUsers) : [];
  if (users.find((u: { email: string }) => u.email === email)) {
    throw new Error('Email already registered');
  }
  users.push({ email, password });
  await AsyncStorage.setItem('users', JSON.stringify(users));
  await AsyncStorage.setItem('currentUser', email);
  return { email };
};

export const logout = async () => {
  await AsyncStorage.removeItem('currentUser');
};