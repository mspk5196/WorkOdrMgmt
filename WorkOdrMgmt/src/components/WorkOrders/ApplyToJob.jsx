import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import ApiService from '../../../utils/ApiService';
import JobOrderAPI from '../../../utils/JobOrderAPI';

const apiService = new ApiService();
const jobOrderAPI = new JobOrderAPI(apiService);

const ApplyToJob = ({ route, navigation }) => {
  const { jobOrderId } = route.params;
  const [proposal, setProposal] = useState('');
  const [proposedCost, setProposedCost] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!proposal.trim() || !proposedCost || !estimatedDays) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const cost = parseFloat(proposedCost);
    const days = parseInt(estimatedDays);

    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }

    if (isNaN(days) || days <= 0) {
      Alert.alert('Error', 'Please enter valid number of days');
      return;
    }

    try {
      setLoading(true);
      const response = await jobOrderAPI.createWorkOrder({
        jobOrderId,
        proposal: proposal.trim(),
        proposedCost: cost,
        estimatedDays: days
      });

      if (response.success) {
        Alert.alert('Success', 'Application submitted successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Apply to job error:', error);
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Submit Your Proposal</Text>

        <Text style={styles.label}>Your Proposal *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe how you'll complete this job..."
          value={proposal}
          onChangeText={setProposal}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Proposed Cost ($) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your cost estimate"
          value={proposedCost}
          onChangeText={setProposedCost}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Estimated Days *</Text>
        <TextInput
          style={styles.input}
          placeholder="How many days will it take?"
          value={estimatedDays}
          onChangeText={setEstimatedDays}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa'
  },
  form: {
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 15
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14
  },
  textArea: {
    height: 150
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30
  },
  disabledButton: {
    opacity: 0.6
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ApplyToJob;
