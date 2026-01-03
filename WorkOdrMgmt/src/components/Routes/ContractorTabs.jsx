import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ContractorDashboard from '../../pages/Contractor/Dashboard/ContractorDashboard';
import ContractorWork from '../../pages/Contractor/Work/ContractorWork';
import ContractorInvoices from '../../pages/Contractor/Invoices/ContractorInvoices';
import Profile from '../../pages/Shared/Profile/Profile';
import Settings from '../../pages/Shared/Settings/Settings';

const Tab = createBottomTabNavigator();

const ContractorTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'briefcase-search' : 'briefcase-search-outline';
                    } else if (route.name === 'MyWork') {
                        iconName = focused ? 'hammer-wrench' : 'hammer-wrench-outline';
                    } else if (route.name === 'Invoices') {
                        iconName = focused ? 'file-document' : 'file-document-outline';
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
                component={ContractorDashboard}
                options={{ title: 'Find Jobs' }}
            />
            <Tab.Screen
                name="MyWork"
                component={ContractorWork}
                options={{ title: 'My Work' }}
            />
            <Tab.Screen
                name="Invoices"
                component={ContractorInvoices}
                options={{ title: 'Invoices' }}
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

export default ContractorTabs;
