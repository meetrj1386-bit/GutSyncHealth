import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddMedicationScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('once_daily');
  const [withFood, setWithFood] = useState(false);
  const [emptyStomach, setEmptyStomach] = useState(false);
  const [loading, setLoading] = useState(false);

  const frequencies = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_daily', label: '3x daily' },
    { value: 'as_needed', label: 'As needed' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter medication name');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Added!', `${name} added to cabinet`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.label}>Medication Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Metformin"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Dosage</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 500mg"
          placeholderTextColor="#9CA3AF"
          value={dosage}
          onChangeText={setDosage}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.optionsRow}>
          {frequencies.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              style={[styles.optionButton, frequency === freq.value && styles.optionActive]}
              onPress={() => setFrequency(freq.value)}
            >
              <Text style={[styles.optionText, frequency === freq.value && styles.optionTextActive]}>
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Food Requirements</Text>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => { setWithFood(!withFood); if (!withFood) setEmptyStomach(false); }}
        >
          <View style={[styles.checkbox, withFood && styles.checkboxActive]}>
            {withFood && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkLabel}>Take with food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => { setEmptyStomach(!emptyStomach); if (!emptyStomach) setWithFood(false); }}
        >
          <View style={[styles.checkbox, emptyStomach && styles.checkboxActive]}>
            {emptyStomach && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkLabel}>Take on empty stomach</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveText}>Add Medication</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F5F7F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2D3436',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F7F5',
    borderRadius: 20,
    margin: 4,
  },
  optionActive: {
    backgroundColor: '#4A7C59',
  },
  optionText: {
    fontSize: 14,
    color: '#2D3436',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#4A7C59',
    borderColor: '#4A7C59',
  },
  checkLabel: {
    fontSize: 15,
    color: '#2D3436',
  },
  saveButton: {
    backgroundColor: '#4A7C59',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.7 },
  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  bottomPadding: { height: 40 },
});
