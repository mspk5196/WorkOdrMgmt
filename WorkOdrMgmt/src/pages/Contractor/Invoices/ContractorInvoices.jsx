import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const ContractorInvoices = () => {
    const navigation = useNavigation();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, paid

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const response = await JobOrderAPI.getMyInvoices();
            if (response.success) {
                setInvoices(response.data);
            }
        } catch (error) {
            console.error('Load invoices error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getFilteredInvoices = () => {
        if (filter === 'all') return invoices;
        return invoices.filter(inv => {
            if (filter === 'pending') return inv.payment_status === 'PENDING';
            if (filter === 'paid') return inv.payment_status === 'PAID';
            return true;
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#FF9500';
            case 'PAID': return '#34C759';
            case 'OVERDUE': return '#FF3B30';
            case 'CANCELLED': return '#8E8E93';
            default: return '#007AFF';
        }
    };

    const getTotalEarnings = () => {
        return invoices
            .filter(inv => inv.payment_status === 'PAID')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
            .toFixed(2);
    };

    const getPendingAmount = () => {
        return invoices
            .filter(inv => inv.payment_status === 'PENDING')
            .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
            .toFixed(2);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const filteredInvoices = getFilteredInvoices();

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Invoices</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, { backgroundColor: '#34C759' }]}>
                    <MaterialCommunityIcons name="cash-check" size={24} color="#fff" />
                    <Text style={styles.summaryAmount}>${getTotalEarnings()}</Text>
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#FF9500' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" />
                    <Text style={styles.summaryAmount}>${getPendingAmount()}</Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                        All ({invoices.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'pending' && styles.activeFilterTab]}
                    onPress={() => setFilter('pending')}
                >
                    <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
                        Pending
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'paid' && styles.activeFilterTab]}
                    onPress={() => setFilter('paid')}
                >
                    <Text style={[styles.filterText, filter === 'paid' && styles.activeFilterText]}>
                        Paid
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadInvoices} />
                }
            >
                {filteredInvoices.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No invoices found</Text>
                        <Text style={styles.emptySubtext}>
                            Your invoices will appear here
                        </Text>
                    </View>
                ) : (
                    filteredInvoices.map((invoice) => (
                        <TouchableOpacity
                            key={invoice.id}
                            style={styles.invoiceCard}
                            onPress={() => navigation.navigate('InvoiceDetails', { invoiceId: invoice.id })}
                        >
                            <View style={styles.invoiceHeader}>
                                <View>
                                    <Text style={styles.invoiceNumber}>Invoice #{invoice.invoice_number}</Text>
                                    <Text style={styles.jobTitle}>{invoice.job_title}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.payment_status) }]}>
                                    <Text style={styles.statusText}>{invoice.payment_status}</Text>
                                </View>
                            </View>

                            <View style={styles.invoiceDetails}>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                                    <Text style={styles.detailLabel}>Issue Date:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(invoice.issue_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="calendar-check" size={16} color="#666" />
                                    <Text style={styles.detailLabel}>Due Date:</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(invoice.due_date).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.amountRow}>
                                    <Text style={styles.amountLabel}>Amount</Text>
                                    <Text style={styles.amountValue}>${invoice.amount}</Text>
                                </View>
                            </View>

                            {invoice.payment_date && (
                                <View style={styles.paymentInfo}>
                                    <MaterialCommunityIcons name="check-circle" size={16} color="#34C759" />
                                    <Text style={styles.paymentText}>
                                        Paid on {new Date(invoice.payment_date).toLocaleDateString()}
                                    </Text>
                                </View>
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
    summaryContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#fff',
        marginTop: 4,
        opacity: 0.9,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeFilterTab: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        paddingTop: 0,
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
    invoiceCard: {
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
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    invoiceNumber: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    invoiceDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        marginLeft: 8,
        marginRight: 8,
    },
    detailValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    amountLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    amountValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
    },
    paymentText: {
        fontSize: 13,
        color: '#2E7D32',
        marginLeft: 8,
        fontWeight: '500',
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

export default ContractorInvoices;
