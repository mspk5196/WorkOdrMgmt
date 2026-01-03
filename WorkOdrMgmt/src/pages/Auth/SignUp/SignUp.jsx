import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import { TextInput, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../utils/ApiService';
import styles from './signUpSty';

const SignUp = () => {
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'CONTRACTOR', // Default role
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedPolicy, setAcceptedPolicy] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const { name, email, phone, password, confirmPassword, role, address, city, state, zipCode } = formData;

        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name');
            return false;
        }

        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Validation Error', 'Please enter a valid email');
            return false;
        }

        if (!phone.trim() || phone.length < 10) {
            Alert.alert('Validation Error', 'Please enter a valid phone number (10+ digits)');
            return false;
        }

        if (!password || password.length < 6) {
            Alert.alert('Validation Error', 'Password must be at least 6 characters');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Validation Error', 'Passwords do not match');
            return false;
        }

        if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
            Alert.alert('Validation Error', 'Please fill in all address fields');
            return false;
        }

        if (!acceptedPolicy) {
            Alert.alert('Validation Error', 'Please accept the Privacy Policy');
            return false;
        }

        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await ApiService.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode
            });

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Account created successfully! Please login.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', response.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('SignUp error:', error);
            Alert.alert('Registration Failed', error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Creating your account...</Text>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Create Account</Text>
                        </View>

                        {/* Role Selection */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>I want to:</Text>
                            <RadioButton.Group
                                onValueChange={(value) => handleChange('role', value)}
                                value={formData.role}
                            >
                                <View style={styles.radioContainer}>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="CONTRACTOR" color="#007AFF" />
                                        <Text style={styles.radioLabel}>Find Work (Contractor)</Text>
                                    </View>
                                    <View style={styles.radioItem}>
                                        <RadioButton value="AGENT" color="#007AFF" />
                                        <Text style={styles.radioLabel}>Post Jobs (Agent)</Text>
                                    </View>
                                </View>
                            </RadioButton.Group>
                        </View>

                        {/* Personal Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Personal Information</Text>

                            <TextInput
                                label="Full Name *"
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="account" />}
                            />

                            <TextInput
                                label="Email *"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                left={<TextInput.Icon icon="email" />}
                            />

                            <TextInput
                                label="Phone Number *"
                                value={formData.phone}
                                onChangeText={(text) => handleChange('phone', text)}
                                mode="outlined"
                                style={styles.input}
                                keyboardType="phone-pad"
                                left={<TextInput.Icon icon="phone" />}
                            />
                        </View>

                        {/* Address Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Address</Text>

                            <TextInput
                                label="Street Address *"
                                value={formData.address}
                                onChangeText={(text) => handleChange('address', text)}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="home" />}
                            />

                            <TextInput
                                label="City *"
                                value={formData.city}
                                onChangeText={(text) => handleChange('city', text)}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="city" />}
                            />

                            <View style={styles.row}>
                                <TextInput
                                    label="State *"
                                    value={formData.state}
                                    onChangeText={(text) => handleChange('state', text)}
                                    mode="outlined"
                                    style={[styles.input, styles.halfInput]}
                                    left={<TextInput.Icon icon="map-marker" />}
                                />

                                <TextInput
                                    label="ZIP Code *"
                                    value={formData.zipCode}
                                    onChangeText={(text) => handleChange('zipCode', text)}
                                    mode="outlined"
                                    style={[styles.input, styles.halfInput]}
                                    keyboardType="numeric"
                                    left={<TextInput.Icon icon="mailbox" />}
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Security</Text>

                            <TextInput
                                label="Password *"
                                value={formData.password}
                                onChangeText={(text) => handleChange('password', text)}
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showPassword}
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={showPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowPassword(!showPassword)}
                                    />
                                }
                            />

                            <TextInput
                                label="Confirm Password *"
                                value={formData.confirmPassword}
                                onChangeText={(text) => handleChange('confirmPassword', text)}
                                mode="outlined"
                                style={styles.input}
                                secureTextEntry={!showConfirmPassword}
                                left={<TextInput.Icon icon="lock-check" />}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />
                        </View>

                        {/* Privacy Policy */}
                        <View style={styles.policyContainer}>
                            <TouchableOpacity
                                onPress={() => setAcceptedPolicy(!acceptedPolicy)}
                                style={styles.checkboxContainer}
                            >
                                <MaterialCommunityIcons
                                    name={acceptedPolicy ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={24}
                                    color={acceptedPolicy ? '#007AFF' : '#999'}
                                />
                                <Text style={styles.policyText}>
                                    I accept the Privacy Policy and Terms of Service
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Button */}
                        <TouchableOpacity
                            style={styles.signUpButton}
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            <Text style={styles.signUpButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default SignUp;
