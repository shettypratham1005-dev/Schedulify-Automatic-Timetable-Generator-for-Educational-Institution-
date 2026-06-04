import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSize } from '../theme/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TimetableScreen from '../screens/TimetableScreen';
import FacultyScreen from '../screens/FacultyScreen';
import SubjectScreen from '../screens/SubjectScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Dashboard: 'view-dashboard',
  Timetable: 'calendar-clock',
  Faculty: 'account-group',
  Subjects: 'book-open-variant',
  Settings: 'cog',
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={tabIcons[route.name]} size={24} color={color} />
      ),
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.tabInactive,
      tabBarStyle: {
        backgroundColor: Colors.bgCard,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Timetable" component={TimetableScreen} />
    <Tab.Screen name="Faculty" component={FacultyScreen} />
    <Tab.Screen name="Subjects" component={SubjectScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Starting Schedulify..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
