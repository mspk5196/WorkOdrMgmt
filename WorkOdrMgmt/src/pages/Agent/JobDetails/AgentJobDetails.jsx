import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const AgentJobDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    const loadJobDetails = async () => {
        try {
            const [jobResponse, appsResponse] = await Promise.all([
                JobOrderAPI.getJobOrderById(jobId),
                JobOrderAPI.getApplicationsForJob(jobId)
            ]);

            if (jobResponse.success) {
                setJob(jobResponse.data);
            }

            if (appsResponse.success) {
                setApplications(appsResponse.data);
            }
        } catch (error) {
            console.error('Load job details error:', error);
            Alert.alert('Error', 'Failed to load job details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleApprove = async (applicationId) => {
        Alert.alert(
            'Approve Application',
            'Are you sure you want to approve this contractor?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            const response = await JobOrderAPI.approveApplication(applicationId);
                            if (response.success) {
                                Alert.alert('Success', 'Contractor approved successfully!');
                                loadJobDetails();
                            } else {
                                Alert.alert('Error', response.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve application');
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (applicationId) => {
        Alert.alert(
            'Reject Application',
            'Are you sure you want to reject this application?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await JobOrderAPI.rejectApplication(applicationId);
                            if (response.success) {
                                Alert.alert('Success', 'Application rejected');
                                loadJobDetails();
                            } else {
                                Alert.alert('Error', response.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject application');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return '#007AFF';
            case 'PENDING': return '#FF9500';
            case 'IN_PROGRESS': return '#34C759';
            case 'COMPLETED': return '#5856D6';
            case 'CANCELLED': return '#FF3B30';
            default: return '#8E8E93';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!job) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Job not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadJobDetails} />
                }
            >
                {/* Job Info */}
                <View style={styles.card}>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(job.status) }]} />
                        <Text style={styles.statusText}>{job.status}</Text>
                    </View>

                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobDescription}>{job.description}</Text>

                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                            <Text style={styles.detailText}>{job.location}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="cash" size={20} color="#666" />
                            <Text style={styles.detailText}>${job.budget}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                            <Text style={styles.detailText}>
                                {new Date(job.start_date).toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="calendar-check" size={20} color="#666" />
                            <Text style={styles.detailText}>
                                {new Date(job.end_date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>

                    {job.requirements && (
                        <View style={styles.requirementsSection}>
                            <Text style={styles.sectionTitle}>Requirements</Text>
                            <Text style={styles.requirementsText}>{job.requirements}</Text>
                        </View>
                    )}
                </View>

                {/* Applications */}
                <View style={styles.applicationsSection}>
                    <Text style={styles.sectionTitle}>
                        Applications ({applications.length})
                    </Text>

                    {applications.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="inbox" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No applications yet</Text>
                        </View>
                    ) : (
                        applications.map((app) => (
                            <View key={app.id} style={styles.applicationCard}>
                                <View style={styles.applicationHeader}>
                                    <View>
                                        <Text style={styles.contractorName}>{app.contractor_name}</Text>
                                        <Text style={styles.contractorEmail}>{app.contractor_email}</Text>
                                    </View>
                                    <View style={[styles.appStatusBadge, { backgroundColor: getStatusColor(app.status) }]}>
                                        <Text style={styles.appStatusText}>{app.status}</Text>
                                    </View>
                                </View>

                                {app.cover_letter && (
                                    <Text style={styles.coverLetter}>{app.cover_letter}</Text>
                                )}

                                <View style={styles.appDetails}>
                                    <Text style={styles.appDetailText}>
                                        Proposed Price: ${app.proposed_price}
                                    </Text>
                                    <Text style={styles.appDetailText}>
                                        Duration: {app.estimated_duration} days
                                    </Text>
                                    <Text style={styles.appDetailText}>
                                        Applied: {new Date(app.applied_at).toLocaleDateString()}
                                    </Text>
                                </View>

                                {app.status === 'PENDING' && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.rejectButton}
                                            onPress={() => handleReject(app.id)}
                                        >
                                            <Text style={styles.rejectButtonText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.approveButton}
                                            onPress={() => handleApprove(app.id)}
                                        >
                                            <Text style={styles.approveButtonText}>Approve</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    jobTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    jobDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    requirementsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    requirementsText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    applicationsSection: {
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
    applicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    applicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    contractorName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    contractorEmail: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    appStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    appStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    coverLetter: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    appDetails: {
        marginBottom: 12,
    },
    appDetailText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 10,
        marginRight: 8,
        borderRadius: 8,
        backgroundColor: '#FF3B30',
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    approveButton: {
        flex: 1,
        paddingVertical: 10,
        marginLeft: 8,
        borderRadius: 8,
        backgroundColor: '#34C759',
        alignItems: 'center',
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 40,
    },
});

export default AgentJobDetails;
