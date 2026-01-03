import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../utils/AuthContext';

const AuthLoader = () => {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, let Redirect handle role-based navigation
        navigation.reset({
          index: 0,
          routes: [{ name: 'Redirect' }],
        });
      } else {
        // User is not authenticated, go to Welcome
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    }
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#2842C4" />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

export default AuthLoader;
