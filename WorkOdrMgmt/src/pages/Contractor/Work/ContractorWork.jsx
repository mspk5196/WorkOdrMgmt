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

const ContractorWork = () => {
    const navigation = useNavigation();
    const [assignments, setAssignments] = useState([]);
    const [workPlans, setWorkPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState('assignments'); // assignments or workplans

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentsRes, workPlansRes] = await Promise.all([
                JobOrderAPI.getMyAssignments(),
                JobOrderAPI.getMyWorkPlans()
            ]);

            if (assignmentsRes.success) {
                setAssignments(assignmentsRes.data);
            }

            if (workPlansRes.success) {
                setWorkPlans(workPlansRes.data);
            }
        } catch (error) {
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ASSIGNED':
            case 'PENDING':
                return '#007AFF';
            case 'IN_PROGRESS':
            case 'APPROVED':
                return '#34C759';
            case 'COMPLETED':
                return '#5856D6';
            case 'CANCELLED':
            case 'REJECTED':
                return '#FF3B30';
            default:
                return '#8E8E93';
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
                <Text style={styles.headerTitle}>My Work</Text>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'assignments' && styles.activeTab]}
                    onPress={() => setSelectedTab('assignments')}
                >
                    <Text style={[styles.tabText, selectedTab === 'assignments' && styles.activeTabText]}>
                        Assignments ({assignments.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'workplans' && styles.activeTab]}
                    onPress={() => setSelectedTab('workplans')}
                >
                    <Text style={[styles.tabText, selectedTab === 'workplans' && styles.activeTabText]}>
                        Work Plans ({workPlans.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadData} />
                }
            >
                {selectedTab === 'assignments' ? (
                    // Assignments Tab
                    assignments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="briefcase-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No assignments yet</Text>
                            <Text style={styles.emptySubtext}>
                                Your approved applications will appear here
                            </Text>
                        </View>
                    ) : (
                        assignments.map((assignment) => (
                            <TouchableOpacity
                                key={assignment.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('WorkPlanDetails', { assignmentId: assignment.id })}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(assignment.status) }]} />
                                        <Text style={styles.statusText}>{assignment.status}</Text>
                                    </View>
                                </View>

                                <Text style={styles.jobTitle}>{assignment.job_title}</Text>
                                <Text style={styles.agentName}>Agent: {assignment.agent_name}</Text>

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

                                <View style={styles.cardFooter}>
                                    <Text style={styles.actionText}>
                                        {assignment.status === 'ASSIGNED' ? 'Create Work Plan →' : 'View Details →'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )
                ) : (
                    // Work Plans Tab
                    workPlans.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No work plans yet</Text>
                            <Text style={styles.emptySubtext}>
                                Create work plans for your assignments
                            </Text>
                        </View>
                    ) : (
                        workPlans.map((plan) => (
                            <TouchableOpacity
                                key={plan.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('WorkPlanDetails', { workPlanId: plan.id })}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.statusBadge}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(plan.status) }]} />
                                        <Text style={styles.statusText}>{plan.status}</Text>
                                    </View>
                                </View>

                                <Text style={styles.jobTitle}>{plan.job_title}</Text>
                                
                                <Text style={styles.description} numberOfLines={2}>
                                    {plan.description}
                                </Text>

                                <View style={styles.detailsRow}>
                                    <View style={styles.detailItem}>
                                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#666" />
                                        <Text style={styles.detailText}>
                                            {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${plan.progress || 0}%` }]} />
                                </View>
                                <Text style={styles.progressText}>{plan.progress || 0}% Complete</Text>

                                <View style={styles.cardFooter}>
                                    <Text style={styles.actionText}>View Details →</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#007AFF',
        fontWeight: '600',
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
    agentName: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#34C759',
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    cardFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    actionText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default ContractorWork;
