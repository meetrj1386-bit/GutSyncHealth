import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const theme = {
  primary: '#4A7C59',
  secondary: '#8FB996',
  accent: '#F4A261',
  background: '#FAFDF6',
  card: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

// Sample data
const sampleMedications = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', withFood: true },
  { id: '2', name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', emptyStomach: true },
];

const sampleSupplements = [
  { id: '1', name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Once daily', bestTime: 'Morning' },
  { id: '2', name: 'Magnesium', dosage: '400mg', frequency: 'Once daily', bestTime: 'Evening' },
  { id: '3', name: 'Probiotics', dosage: '10B CFU', frequency: 'Once daily', bestTime: 'Morning' },
  { id: '4', name: 'Fish Oil', dosage: '1000mg', frequency: 'Once daily', withFood: true },
];

export default function CabinetScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'medications' | 'supplements'>('medications');

  const handleDelete = (id: string, type: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to remove this ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete', id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medications' && styles.tabActive]}
          onPress={() => setActiveTab('medications')}
        >
          <Ionicons
            name="medical"
            size={18}
            color={activeTab === 'medications' ? theme.primary : theme.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'medications' && styles.tabTextActive]}>
            Medications ({sampleMedications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'supplements' && styles.tabActive]}
          onPress={() => setActiveTab('supplements')}
        >
          <Ionicons
            name="leaf"
            size={18}
            color={activeTab === 'supplements' ? theme.primary : theme.textLight}
          />
          <Text style={[styles.tabText, activeTab === 'supplements' && styles.tabTextActive]}>
            Supplements ({sampleSupplements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.listContainer}>
        {activeTab === 'medications' ? (
          <>
            {sampleMedications.map((med) => (
              <View key={med.id} style={styles.itemCard}>
                <View style={styles.itemIcon}>
                  <Ionicons name="medical" size={24} color={theme.primary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{med.name}</Text>
                  <Text style={styles.itemDosage}>{med.dosage} • {med.frequency}</Text>
                  <View style={styles.itemTags}>
                    {med.withFood && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>🍽️ With food</Text>
                      </View>
                    )}
                    {med.emptyStomach && (
                      <View style={[styles.tag, styles.tagWarning]}>
                        <Text style={styles.tagText}>⏰ Empty stomach</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(med.id, 'medication')}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-medication')}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={styles.addButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {sampleSupplements.map((supp) => (
              <View key={supp.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="leaf" size={24} color={theme.secondary} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{supp.name}</Text>
                  <Text style={styles.itemDosage}>{supp.dosage} • {supp.frequency}</Text>
                  <View style={styles.itemTags}>
                    {supp.bestTime && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>🕐 {supp.bestTime}</Text>
                      </View>
                    )}
                    {supp.withFood && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>🍽️ With food</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(supp.id, 'supplement')}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.error} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-supplement')}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={styles.addButtonText}>Add Supplement</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Interactions Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color={theme.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Interaction Found</Text>
            <Text style={styles.warningText}>
              Levothyroxine + Calcium: Take 4 hours apart
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 13,
    color: theme.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.primary,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  itemDosage: {
    fontSize: 13,
    color: theme.textLight,
    marginTop: 2,
  },
  itemTags: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  tagWarning: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 11,
    color: theme.text,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.warning,
  },
  warningText: {
    fontSize: 13,
    color: theme.text,
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
});
