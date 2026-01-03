import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AgentDashboard from '../../pages/Agent/Dashboard/AgentDashboard';
import AgentJobDetails from '../../pages/Agent/JobDetails/AgentJobDetails';
import AgentAssignments from '../../pages/Agent/Assignments/AgentAssignments';
import Profile from '../../pages/Shared/Profile/Profile';
import Settings from '../../pages/Shared/Settings/Settings';

const Tab = createBottomTabNavigator();

const AgentTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
                    } else if (route.name === 'Assignments') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'account' : 'account-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'cog' : 'cog-outline';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={AgentDashboard}
                options={{ title: 'Jobs' }}
            />
            <Tab.Screen
                name="Assignments"
                component={AgentAssignments}
                options={{ title: 'Assignments' }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{ title: 'Profile' }}
            />
            <Tab.Screen
                name="Settings"
                component={Settings}
                options={{ title: 'Settings' }}
            />
        </Tab.Navigator>
    );
};

export default AgentTabs;
