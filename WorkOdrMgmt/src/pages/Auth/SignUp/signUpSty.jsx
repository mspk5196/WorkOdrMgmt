import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 15,
    },
    radioContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
        marginRight: 10,
    },
    policyContainer: {
        marginVertical: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    policyText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    signUpButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
        color: '#666',
    },
    loginLink: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default styles;
