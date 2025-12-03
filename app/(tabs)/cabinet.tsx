import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupplements, useMedications } from '../../lib/data';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../lib/theme';

type TabType = 'supplements' | 'medications';

// Supplement knowledge base
const SUPPLEMENT_INFO: Record<string, { emoji: string; benefits: string[]; tip: string; bestTime: string; gutImpact: string }> = {
  'vitamin d': { emoji: '☀️', benefits: ['Mood', 'Immunity', 'Bones'], tip: 'Take with fat for better absorption', bestTime: 'Morning', gutImpact: 'Supports gut lining' },
  'magnesium': { emoji: '🌙', benefits: ['Sleep', 'Relaxation', 'Muscles'], tip: 'Best taken before bed', bestTime: 'Evening', gutImpact: 'Relaxes gut muscles' },
  'probiotic': { emoji: '🦠', benefits: ['Gut health', 'Digestion', 'Immunity'], tip: 'Take on empty stomach', bestTime: 'Morning (empty)', gutImpact: 'Adds good bacteria' },
  'omega': { emoji: '🐟', benefits: ['Brain', 'Heart', 'Inflammation'], tip: 'Take with meals', bestTime: 'With food', gutImpact: 'Reduces inflammation' },
  'zinc': { emoji: '🛡️', benefits: ['Immunity', 'Skin', 'Healing'], tip: 'Take with food', bestTime: 'With meals', gutImpact: 'Supports gut healing' },
  'b12': { emoji: '⚡', benefits: ['Energy', 'Nerves'], tip: 'Take in the morning', bestTime: 'Morning', gutImpact: 'Helps nutrient absorption' },
  'iron': { emoji: '💪', benefits: ['Energy', 'Blood'], tip: 'Avoid with coffee/calcium', bestTime: 'Empty stomach', gutImpact: '⚠️ May cause constipation' },
  'multivitamin': { emoji: '💊', benefits: ['Overall wellness'], tip: 'Take with breakfast', bestTime: 'Morning', gutImpact: 'General support' },
  'collagen': { emoji: '✨', benefits: ['Skin', 'Joints', 'Gut'], tip: 'Take on empty stomach', bestTime: 'Morning', gutImpact: 'Heals gut lining' },
  'turmeric': { emoji: '🧡', benefits: ['Inflammation', 'Joints'], tip: 'Take with black pepper', bestTime: 'With meals', gutImpact: 'Anti-inflammatory' },
  'glutamine': { emoji: '🔧', benefits: ['Gut repair', 'Muscle'], tip: 'Empty stomach or with protein', bestTime: 'Morning', gutImpact: 'Repairs intestinal lining' },
  'digestive enzyme': { emoji: '🧬', benefits: ['Digestion', 'Bloating relief'], tip: 'Take before meals', bestTime: 'Before eating', gutImpact: 'Improves digestion' },
};

// Medication knowledge base
const MEDICATION_INFO: Record<string, { emoji: string; purpose: string; sideEffects: string[]; gutImpact: string; tip: string; bestTime: string }> = {
  'metformin': { emoji: '💊', purpose: 'Blood sugar control', sideEffects: ['Nausea', 'Diarrhea'], gutImpact: '⚠️ May cause GI upset initially', tip: 'Take with food to reduce stomach issues', bestTime: 'With meals' },
  'insulin': { emoji: '💉', purpose: 'Blood sugar control', sideEffects: ['Low blood sugar'], gutImpact: 'Minimal direct gut impact', tip: 'Rotate injection sites', bestTime: 'Before meals / As prescribed' },
  'omeprazole': { emoji: '🛡️', purpose: 'Acid reflux', sideEffects: ['B12 deficiency long-term'], gutImpact: '⚠️ Long-term use affects gut bacteria', tip: 'Take 30 min before breakfast', bestTime: 'Morning, empty stomach' },
  'pantoprazole': { emoji: '🛡️', purpose: 'Acid reflux', sideEffects: ['B12/Mg deficiency'], gutImpact: '⚠️ May reduce good bacteria', tip: 'Short courses better than long-term', bestTime: 'Morning before food' },
  'antibiotic': { emoji: '💣', purpose: 'Infection treatment', sideEffects: ['Diarrhea', 'Gut disruption'], gutImpact: '⚠️ Kills good bacteria too - take probiotics after', tip: 'Complete the full course', bestTime: 'As prescribed' },
  'ibuprofen': { emoji: '💊', purpose: 'Pain/inflammation', sideEffects: ['Stomach irritation'], gutImpact: '⚠️ Can damage gut lining - limit use', tip: 'Always take with food', bestTime: 'With meals' },
  'aspirin': { emoji: '💊', purpose: 'Pain/heart health', sideEffects: ['Stomach bleeding'], gutImpact: '⚠️ Can irritate stomach lining', tip: 'Take coated version with food', bestTime: 'With meals' },
  'statin': { emoji: '❤️', purpose: 'Cholesterol', sideEffects: ['Muscle pain'], gutImpact: 'Minimal gut impact', tip: 'Take at same time daily', bestTime: 'Evening usually' },
  'thyroid': { emoji: '🦋', purpose: 'Thyroid hormone', sideEffects: ['Heart racing if dose too high'], gutImpact: 'Minimal direct gut impact', tip: 'Take on empty stomach, 1hr before food', bestTime: 'Morning, empty' },
  'antidepressant': { emoji: '🧠', purpose: 'Mental health', sideEffects: ['Nausea initially', 'Weight changes'], gutImpact: 'Gut-brain connection - affects serotonin', tip: 'Take consistently at same time', bestTime: 'Morning or as prescribed' },
  'birth control': { emoji: '💊', purpose: 'Contraception', sideEffects: ['Nausea', 'Mood changes'], gutImpact: 'May affect gut bacteria balance', tip: 'Take at same time daily', bestTime: 'Consistent time' },
  'blood pressure': { emoji: '❤️', purpose: 'BP control', sideEffects: ['Dizziness'], gutImpact: 'Minimal gut impact', tip: 'Take consistently', bestTime: 'Morning usually' },
};

const getSupplementInfo = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(SUPPLEMENT_INFO)) {
    if (lowerName.includes(key)) return { ...value, type: 'supplement' };
  }
  return { emoji: '💊', benefits: ['Wellness'], tip: 'Follow label directions', bestTime: 'As directed', gutImpact: 'Track to see effects', type: 'supplement' };
};

const getMedicationInfo = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(MEDICATION_INFO)) {
    if (lowerName.includes(key)) return { ...value, type: 'medication' };
  }
  return { emoji: '💊', purpose: 'As prescribed', sideEffects: [], gutImpact: 'Track effects on gut', tip: 'Follow doctor\'s instructions', bestTime: 'As prescribed', type: 'medication' };
};

export default function CabinetScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('supplements');
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');

  const { supplements, isLoading: suppLoading, refetch: refetchSupp, addSupplement, deleteSupplement } = useSupplements();
  const { medications, isLoading: medLoading, refetch: refetchMed, addMedication, deleteMedication } = useMedications();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSupp(), refetchMed()]);
    setRefreshing(false);
  }, []);

  const resetForm = () => {
    setName('');
    setDosage('');
    setNotes('');
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name');
      return;
    }

    let error;
    
    if (activeTab === 'supplements') {
      const result = await addSupplement({
        name: name.trim(),
        dosage: dosage.trim() || null,
        notes: notes.trim() || null,
        active: true,
      });
      error = result.error;
    } else {
      const result = await addMedication({
        name: name.trim(),
        dosage: dosage.trim() || null,
        notes: notes.trim() || null,
        active: true,
      });
      error = result.error;
    }

    if (error) {
      console.error('Add error:', error);
      Alert.alert('Error', 'Could not add. Please make sure you ran the database setup SQL in Supabase.');
      return;
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (id: string, itemName: string) => {
    Alert.alert('Remove', `Remove "${itemName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (activeTab === 'supplements') deleteSupplement(id);
          else deleteMedication(id);
        },
      },
    ]);
  };

  const items = activeTab === 'supplements' ? supplements : medications;
  const isLoading = activeTab === 'supplements' ? suppLoading : medLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Medicine Cabinet</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'supplements' && styles.tabActive]}
          onPress={() => setActiveTab('supplements')}
        >
          <Text style={[styles.tabText, activeTab === 'supplements' && styles.tabTextActive]}>
            Supplements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'medications' && styles.tabActive]}
          onPress={() => setActiveTab('medications')}
        >
          <Text style={[styles.tabText, activeTab === 'medications' && styles.tabTextActive]}>
            Medications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          💡 Add what you take daily. We'll analyze how they affect your gut health.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{activeTab === 'supplements' ? '💊' : '💉'}</Text>
            <Text style={styles.emptyTitle}>No {activeTab} yet</Text>
            <Text style={styles.emptyText}>
              Add your {activeTab} so we can track how they affect your gut health.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.emptyButtonText}>Add {activeTab === 'supplements' ? 'Supplement' : 'Medication'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => {
            const info = activeTab === 'supplements' 
              ? getSupplementInfo(item.name) 
              : getMedicationInfo(item.name);
            
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.itemCard}
                onLongPress={() => handleDelete(item.id, item.name)}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemEmoji}>{info.emoji}</Text>
                </View>
                <View style={styles.itemCenter}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.dosage && <Text style={styles.itemDosage}>{item.dosage}</Text>}
                  
                  {/* Supplement-specific info */}
                  {activeTab === 'supplements' && 'benefits' in info && info.benefits.length > 0 && (
                    <Text style={styles.itemBenefits}>✨ {info.benefits.join(' • ')}</Text>
                  )}
                  
                  {/* Medication-specific info */}
                  {activeTab === 'medications' && 'purpose' in info && (
                    <Text style={styles.itemPurpose}>📋 {info.purpose}</Text>
                  )}
                  {activeTab === 'medications' && 'sideEffects' in info && info.sideEffects.length > 0 && (
                    <Text style={styles.itemSideEffects}>⚠️ Watch for: {info.sideEffects.join(', ')}</Text>
                  )}
                  
                  {/* Common info */}
                  {'gutImpact' in info && info.gutImpact && (
                    <Text style={[styles.itemGutImpact, info.gutImpact.includes('⚠️') ? styles.gutWarning : styles.gutGood]}>
                      🦠 Gut: {info.gutImpact}
                    </Text>
                  )}
                  {'bestTime' in info && info.bestTime && (
                    <Text style={styles.itemTime}>⏰ Best time: {info.bestTime}</Text>
                  )}
                  {info.tip && (
                    <Text style={styles.itemTip}>💡 {info.tip}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {items.length > 0 && (
          <Text style={styles.hint}>Long press to remove</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowAddModal(false); resetForm(); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Add {activeTab === 'supplements' ? 'Supplement' : 'Medication'}
            </Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Vitamin D, Probiotic, Magnesium"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
                underlineColorAndroid="transparent"
              />
              {name.length > 2 && activeTab === 'supplements' && (
                <View style={styles.detectCard}>
                  <Text style={styles.detectTitle}>🔍 Detected:</Text>
                  <Text style={styles.detectText}>
                    {getSupplementInfo(name).emoji} {getSupplementInfo(name).benefits.join(' • ')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Dosage (optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., 1000 IU, 400mg, 1 capsule"
                placeholderTextColor={Colors.textMuted}
                value={dosage}
                onChangeText={setDosage}
                underlineColorAndroid="transparent"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Any notes about this supplement..."
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                underlineColorAndroid="transparent"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text },
  addButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  addButtonText: { color: Colors.textInverse, fontSize: FontSizes.sm, fontWeight: '600' },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSizes.md, color: Colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '600' },
  
  infoBanner: { backgroundColor: Colors.infoLight, marginHorizontal: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  infoText: { fontSize: FontSizes.sm, color: Colors.text },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },
  
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '600' },
  
  itemCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  itemLeft: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryFaded, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  itemEmoji: { fontSize: 24 },
  itemCenter: { flex: 1 },
  itemName: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  itemDosage: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  itemBenefits: { fontSize: FontSizes.xs, color: Colors.primary, marginBottom: 2 },
  itemPurpose: { fontSize: FontSizes.xs, color: Colors.primary, marginBottom: 2 },
  itemSideEffects: { fontSize: FontSizes.xs, color: Colors.warning, marginBottom: 2 },
  itemGutImpact: { fontSize: FontSizes.xs, marginBottom: 2, fontWeight: '500' },
  gutWarning: { color: Colors.warning },
  gutGood: { color: Colors.success },
  itemTime: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 2 },
  itemTip: { fontSize: FontSizes.xs, color: Colors.textMuted, fontStyle: 'italic' },
  
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
  
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalCancel: { fontSize: FontSizes.md, color: Colors.textSecondary },
  modalTitle: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text },
  modalSave: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  modalContent: { flex: 1, padding: Spacing.lg },
  formGroup: { marginBottom: Spacing.lg },
  formLabel: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  formInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.md, color: Colors.text },
  formTextArea: { minHeight: 80, textAlignVertical: 'top' },
  detectCard: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.md, padding: Spacing.sm, marginTop: Spacing.sm },
  detectTitle: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600' },
  detectText: { fontSize: FontSizes.sm, color: Colors.text, marginTop: 2 },
});
