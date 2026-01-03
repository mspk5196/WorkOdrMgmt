import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useAuth } from '../../../utils/AuthContext';
import ApiService from '../../../utils/ApiService';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const apiService = new ApiService();
const jobOrderAPI = new JobOrderAPI(apiService);

const ContractorDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [jobOrders, setJobOrders] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // browse, applications, assignments

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, applicationsResponse, assignmentsResponse] = await Promise.all([
        jobOrderAPI.getOpenJobOrders(),
        jobOrderAPI.getMyWorkOrders(),
        jobOrderAPI.getMyAssignments()
      ]);

      if (jobsResponse.success) {
        setJobOrders(jobsResponse.data);
      }

      if (applicationsResponse.success) {
        setMyApplications(applicationsResponse.data);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      const response = await jobOrderAPI.searchJobOrders(searchQuery);
      if (response.success) {
        setJobOrders(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: '#3498db',
      PENDING: '#f39c12',
      APPROVED: '#27ae60',
      REJECTED: '#e74c3c',
      IN_PROGRESS: '#9b59b6',
      COMPLETED: '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  const renderJobOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ApplyToJob', { jobId: item.id })}
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
        <Text style={styles.agentName}>Posted by: {item.agent_name}</Text>
        <Text style={styles.categoryText}>{item.category || 'No Category'}</Text>
      </View>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => navigation.navigate('ApplyToJob', { jobOrderId: item.id })}
      >
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderApplication = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ApplicationDetail', { workOrderId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.job_title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.agentName}>Agent: {item.agent_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.costText}>Your Proposal: ${item.proposed_cost}</Text>
        <Text style={styles.daysText}>{item.estimated_days} days</Text>
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
      <Text style={styles.agentName}>Agent: {item.agent_name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.costText}>Amount: ${item.proposed_cost}</Text>
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
        <Text style={styles.roleText}>Contractor Dashboard</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
          onPress={() => setActiveTab('browse')}
        >
          <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
            Browse Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            My Applications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            My Work
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'browse' && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={jobOrders}
            renderItem={renderJobOrder}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No jobs available</Text>
            }
          />
        </>
      )}

      {activeTab === 'applications' && (
        <FlatList
          data={myApplications}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No applications yet</Text>
          }
        />
      )}

      {activeTab === 'assignments' && (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No active assignments</Text>
          }
        />
      )}
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
    backgroundColor: '#9b59b6',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#9b59b6'
  },
  tabText: {
    fontSize: 14,
    color: '#95a5a6'
  },
  activeTabText: {
    color: '#9b59b6',
    fontWeight: 'bold'
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff'
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 10
  },
  searchButton: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  listContainer: {
    padding: 15
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
    alignItems: 'center',
    marginTop: 10
  },
  agentName: {
    fontSize: 13,
    color: '#34495e',
    marginBottom: 5
  },
  categoryText: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic'
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
  applyButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 14,
    marginTop: 40
  }
});

export default ContractorDashboard;
