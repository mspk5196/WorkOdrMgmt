import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../../utils/AuthContext';
import ApiService from '../../../utils/ApiService';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const apiService = new ApiService();
const jobOrderAPI = new JobOrderAPI(apiService);

const AgentDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [jobOrders, setJobOrders] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, assignmentsResponse] = await Promise.all([
        jobOrderAPI.getMyJobOrders(),
        jobOrderAPI.getMyAssignments()
      ]);

      if (jobsResponse.success) {
        setJobOrders(jobsResponse.data);
      }

      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: '#3498db',
      ASSIGNED: '#f39c12',
      IN_PROGRESS: '#9b59b6',
      COMPLETED: '#27ae60',
      CANCELLED: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const renderJobOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AgentJobDetails', { jobId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.categoryText}>{item.category || 'No Category'}</Text>
        {item.pending_applications > 0 && (
          <Text style={styles.applicationsText}>
            {item.pending_applications} pending applications
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAssignment = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.job_title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.job_status) }]}>
          <Text style={styles.statusText}>{item.job_status}</Text>
        </View>
      </View>
      <Text style={styles.contractorName}>Contractor: {item.contractor_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.costText}>Cost: ${item.proposed_cost}</Text>
        <Text style={styles.daysText}>{item.estimated_days} days</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Agent Dashboard</Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateJobOrder')}
      >
        <Text style={styles.createButtonText}>+ Create New Job Order</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Job Orders ({jobOrders.length})</Text>
        <FlatList
          data={jobOrders}
          renderItem={renderJobOrder}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No job orders yet</Text>
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Assignments ({assignments.length})</Text>
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No active assignments</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  roleText: {
    fontSize: 16,
    color: '#ecf0f1',
    marginTop: 5
  },
  createButton: {
    backgroundColor: '#27ae60',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  section: {
    flex: 1,
    padding: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50'
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic'
  },
  applicationsText: {
    fontSize: 12,
    color: '#e67e22',
    fontWeight: 'bold'
  },
  contractorName: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10
  },
  costText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: 'bold'
  },
  daysText: {
    fontSize: 14,
    color: '#3498db'
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
    marginTop: 20
  }
});

export default AgentDashboard;
