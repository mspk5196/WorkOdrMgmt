import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const AgentAssignments = () => {
    const navigation = useNavigation();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const response = await JobOrderAPI.getMyAssignments();
            if (response.success) {
                setAssignments(response.data);
            }
        } catch (error) {
            console.error('Load assignments error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ASSIGNED': return '#007AFF';
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

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Active Assignments</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadAssignments} />
                }
            >
                {assignments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="briefcase-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No active assignments</Text>
                        <Text style={styles.emptySubtext}>
                            Assignments will appear here when you approve contractors
                        </Text>
                    </View>
                ) : (
                    assignments.map((assignment) => (
                        <TouchableOpacity
                            key={assignment.id}
                            style={styles.card}
                            onPress={() => navigation.navigate('AssignmentDetails', { assignmentId: assignment.id })}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.statusBadge}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(assignment.status) }]} />
                                    <Text style={styles.statusText}>{assignment.status}</Text>
                                </View>
                            </View>

                            <Text style={styles.jobTitle}>{assignment.job_title}</Text>
                            <Text style={styles.contractorName}>
                                Contractor: {assignment.contractor_name}
                            </Text>

                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                                    <Text style={styles.detailText}>
                                        {new Date(assignment.assigned_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <MaterialCommunityIcons name="cash" size={16} color="#666" />
                                    <Text style={styles.detailText}>${assignment.agreed_price}</Text>
                                </View>
                            </View>

                            {assignment.notes && (
                                <Text style={styles.notes} numberOfLines={2}>{assignment.notes}</Text>
                            )}

                            <View style={styles.cardFooter}>
                                <Text style={styles.viewDetails}>View Details →</Text>
                            </View>
                        </TouchableOpacity>
                    ))
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    contractorName: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    notes: {
        fontSize: 13,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 8,
    },
    cardFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    viewDetails: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default AgentAssignments;
