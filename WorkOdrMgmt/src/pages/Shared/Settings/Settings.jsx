import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../utils/AuthContext';
import ApiService from '../../../utils/ApiService';

const Settings = () => {
    const navigation = useNavigation();
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Settings states
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordChange = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await ApiService.changePassword(currentPassword, newPassword);

            if (response.success) {
                Alert.alert('Success', 'Password changed successfully');
                setShowChangePassword(false);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                Alert.alert('Error', response.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            Alert.alert('Error', 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Notice', 'Please contact support to delete your account');
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={() => setShowChangePassword(!showChangePassword)}
                    >
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="lock-reset" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Change Password</Text>
                        </View>
                        <MaterialCommunityIcons
                            name={showChangePassword ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {showChangePassword && (
                        <View style={styles.passwordSection}>
                            <TextInput
                                label="Current Password"
                                value={passwordData.currentPassword}
                                onChangeText={(text) =>
                                    setPasswordData(prev => ({ ...prev, currentPassword: text }))
                                }
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showCurrentPassword}
                                right={
                                    <TextInput.Icon
                                        icon={showCurrentPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    />
                                }
                            />

                            <TextInput
                                label="New Password"
                                value={passwordData.newPassword}
                                onChangeText={(text) =>
                                    setPasswordData(prev => ({ ...prev, newPassword: text }))
                                }
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showNewPassword}
                                right={
                                    <TextInput.Icon
                                        icon={showNewPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    />
                                }
                            />

                            <TextInput
                                label="Confirm New Password"
                                value={passwordData.confirmPassword}
                                onChangeText={(text) =>
                                    setPasswordData(prev => ({ ...prev, confirmPassword: text }))
                                }
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showConfirmPassword}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />

                            <TouchableOpacity
                                style={styles.changePasswordButton}
                                onPress={handlePasswordChange}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.changePasswordButtonText}>Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="bell" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#ccc', true: '#007AFF' }}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="email" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Email Alerts</Text>
                        </View>
                        <Switch
                            value={emailAlerts}
                            onValueChange={setEmailAlerts}
                            trackColor={{ false: '#ccc', true: '#007AFF' }}
                        />
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>App Version</Text>
                        </View>
                        <Text style={styles.versionText}>1.0.0</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="file-document" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Terms & Conditions</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Privacy Policy</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="help-circle" size={24} color="#007AFF" />
                            <Text style={styles.settingText}>Help & Support</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>Danger Zone</Text>

                    <TouchableOpacity
                        style={styles.settingItem}
                        onPress={handleDeleteAccount}
                    >
                        <View style={styles.settingLeft}>
                            <MaterialCommunityIcons name="delete-forever" size={24} color="#FF3B30" />
                            <Text style={[styles.settingText, { color: '#FF3B30' }]}>
                                Delete Account
                            </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={24} color="#fff" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
    },
    versionText: {
        fontSize: 14,
        color: '#666',
    },
    passwordSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    changePasswordButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    changePasswordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default Settings;
