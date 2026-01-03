import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthLoader from './AuthLoader';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../../pages/Auth/Welcome/Welcome';
import Login from '../../pages/Auth/Login/Login';
import SignUp from '../../pages/Auth/SignUp/SignUp';
import Redirect from '../Redirect/Redirect';
import AgentTabs from './AgentTabs';
import ContractorTabs from './ContractorTabs';
import AgentJobDetails from '../../pages/Agent/JobDetails/AgentJobDetails';
import CreateJobOrder from '../JobOrders/CreateJobOrder';
import ApplyToJob from '../WorkOrders/ApplyToJob';

const Stack = createNativeStackNavigator();

const Routes = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="AuthLoader" screenOptions={{ headerShown: false }}>
                {/* Auth Loader */}
                <Stack.Screen name="AuthLoader" component={AuthLoader} />
                <Stack.Screen name="Welcome" component={Welcome} />
                
                {/* Auth Screens */}
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="Redirect" component={Redirect} />

                {/* Role-specific Tab Navigators */}
                <Stack.Screen name="AgentTabs" component={AgentTabs} />
                <Stack.Screen name="ContractorTabs" component={ContractorTabs} />

                {/* Shared Detail Screens */}
                <Stack.Screen name="AgentJobDetails" component={AgentJobDetails} />
                <Stack.Screen name="CreateJobOrder" component={CreateJobOrder} />
                <Stack.Screen name="ApplyToJob" component={ApplyToJob} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;

