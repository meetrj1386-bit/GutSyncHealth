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

const medications = [
  { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', withFood: true },
  { id: '2', name: 'Levothyroxine', dosage: '50mcg', frequency: 'Once daily', emptyStomach: true },
];

const supplements = [
  { id: '1', name: 'Vitamin D3', dosage: '2000 IU', bestTime: 'Morning' },
  { id: '2', name: 'Magnesium', dosage: '400mg', bestTime: 'Evening' },
  { id: '3', name: 'Probiotics', dosage: '10B CFU', bestTime: 'Morning' },
  { id: '4', name: 'Fish Oil', dosage: '1000mg', bestTime: 'With meal' },
];

export default function CabinetScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'medications' | 'supplements'>('medications');

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
            color={activeTab === 'medications' ? '#4A7C59' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'medications' && styles.tabTextActive]}>
            Medications ({medications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'supplements' && styles.tabActive]}
          onPress={() => setActiveTab('supplements')}
        >
          <Ionicons
            name="leaf"
            size={18}
            color={activeTab === 'supplements' ? '#4A7C59' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'supplements' && styles.tabTextActive]}>
            Supplements ({supplements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {activeTab === 'medications' ? (
          <>
            {medications.map((med) => (
              <View key={med.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="medical" size={24} color="#7B1FA2" />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{med.name}</Text>
                  <Text style={styles.itemDetail}>{med.dosage} • {med.frequency}</Text>
                  <View style={styles.tags}>
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
                <TouchableOpacity style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-medication')}>
              <Ionicons name="add-circle" size={24} color="#4A7C59" />
              <Text style={styles.addButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {supplements.map((supp) => (
              <View key={supp.id} style={styles.itemCard}>
                <View style={[styles.itemIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="leaf" size={24} color="#4A7C59" />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{supp.name}</Text>
                  <Text style={styles.itemDetail}>{supp.dosage}</Text>
                  <View style={styles.tags}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>🕐 {supp.bestTime}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-supplement')}>
              <Ionicons name="add-circle" size={24} color="#4A7C59" />
              <Text style={styles.addButtonText}>Add Supplement</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Interaction Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#F39C12" />
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
    backgroundColor: '#F5F7F5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 14,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#4A7C59',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  itemDetail: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  tagWarning: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 11,
    color: '#2D3436',
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4A7C59',
    borderStyle: 'dashed',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A7C59',
    fontWeight: '700',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F39C12',
  },
  warningText: {
    fontSize: 13,
    color: '#2D3436',
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
});
