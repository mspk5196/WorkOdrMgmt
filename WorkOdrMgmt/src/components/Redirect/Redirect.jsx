import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../utils/AuthContext';

const Redirect = () => {
    const navigation = useNavigation();
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated && user) {
                // Navigate based on user role
                if (user.role === 'AGENT') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'AgentTabs' }],
                    });
                } else if (user.role === 'CONTRACTOR') {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ContractorTabs' }],
                    });
                } else {
                    // Default fallback
                    navigation.navigate('Login');
                }
            } else {
                navigation.navigate('Login');
            }
        }
    }, [isAuthenticated, user, isLoading, navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default Redirect;
