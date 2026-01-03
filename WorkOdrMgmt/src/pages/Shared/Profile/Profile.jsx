import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../utils/AuthContext';
import ApiService from '../../../utils/ApiService';

const Profile = () => {
    const { user, checkAuthStatus } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zip_code: user.zip_code || ''
            });
        }
    }, [user]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await checkAuthStatus();
        setRefreshing(false);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const response = await ApiService.updateProfile(formData);

            if (response.success) {
                Alert.alert('Success', 'Profile updated successfully');
                setEditing(false);
                await checkAuthStatus();
            } else {
                Alert.alert('Error', response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={() => {
                        if (editing) {
                            setEditing(false);
                            // Reset form data
                            setFormData({
                                name: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                address: user.address || '',
                                city: user.city || '',
                                state: user.state || '',
                                zip_code: user.zip_code || ''
                            });
                        } else {
                            setEditing(true);
                        }
                    }}
                >
                    <MaterialCommunityIcons
                        name={editing ? 'close' : 'pencil'}
                        size={24}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Profile Picture */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <MaterialCommunityIcons name="account" size={64} color="#fff" />
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                </View>

                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <TextInput
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(text) => handleChange('name', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={!editing}
                        left={<TextInput.Icon icon="account" />}
                    />

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={!editing}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        left={<TextInput.Icon icon="email" />}
                    />

                    <TextInput
                        label="Phone"
                        value={formData.phone}
                        onChangeText={(text) => handleChange('phone', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={!editing}
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon="phone" />}
                    />
                </View>

                {/* Address Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>

                    <TextInput
                        label="Street Address"
                        value={formData.address}
                        onChangeText={(text) => handleChange('address', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={!editing}
                        left={<TextInput.Icon icon="home" />}
                    />

                    <TextInput
                        label="City"
                        value={formData.city}
                        onChangeText={(text) => handleChange('city', text)}
                        mode="outlined"
                        style={styles.input}
                        disabled={!editing}
                        left={<TextInput.Icon icon="city" />}
                    />

                    <View style={styles.row}>
                        <TextInput
                            label="State"
                            value={formData.state}
                            onChangeText={(text) => handleChange('state', text)}
                            mode="outlined"
                            style={[styles.input, styles.halfInput]}
                            disabled={!editing}
                            left={<TextInput.Icon icon="map-marker" />}
                        />

                        <TextInput
                            label="ZIP Code"
                            value={formData.zip_code}
                            onChangeText={(text) => handleChange('zip_code', text)}
                            mode="outlined"
                            style={[styles.input, styles.halfInput]}
                            disabled={!editing}
                            keyboardType="numeric"
                            left={<TextInput.Icon icon="mailbox" />}
                        />
                    </View>
                </View>

                {/* Account Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Member Since:</Text>
                        <Text style={styles.statValue}>
                            {new Date(user.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Account Status:</Text>
                        <Text style={[styles.statValue, { color: '#34C759' }]}>Active</Text>
                    </View>
                </View>

                {/* Update Button */}
                {editing && (
                    <TouchableOpacity
                        style={styles.updateButton}
                        onPress={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.updateButtonText}>Update Profile</Text>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    avatarContainer: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
        marginRight: 8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    updateButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default Profile;
