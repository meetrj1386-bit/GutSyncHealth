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

const commonSupplements = [
  'Vitamin D3', 'Magnesium', 'Probiotics', 'Fish Oil', 'Vitamin B12', 'Iron', 'Zinc', 'Vitamin C'
];

export default function AddSupplementScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [bestTime, setBestTime] = useState('morning');
  const [loading, setLoading] = useState(false);

  const times = [
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '☀️ Afternoon' },
    { value: 'evening', label: '🌙 Evening' },
    { value: 'with_meal', label: '🍽️ With meal' },
  ];

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter supplement name');
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
        <Text style={styles.label}>Quick Add</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.quickAddRow}>
            {commonSupplements.map((supp, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAddPill}
                onPress={() => setName(supp)}
              >
                <Text style={styles.quickAddText}>{supp}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Supplement Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Vitamin D3"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Dosage</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2000 IU"
          placeholderTextColor="#9CA3AF"
          value={dosage}
          onChangeText={setDosage}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Best Time to Take</Text>
        <View style={styles.optionsRow}>
          {times.map((time) => (
            <TouchableOpacity
              key={time.value}
              style={[styles.optionButton, bestTime === time.value && styles.optionActive]}
              onPress={() => setBestTime(time.value)}
            >
              <Text style={[styles.optionText, bestTime === time.value && styles.optionTextActive]}>
                {time.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveText}>Add Supplement</Text>
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
  quickAddRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  quickAddPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  quickAddText: {
    fontSize: 13,
    color: '#4A7C59',
    fontWeight: '600',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F7F5',
    borderRadius: 20,
    margin: 4,
  },
  optionActive: {
    backgroundColor: '#4A7C59',
  },
  optionText: {
    fontSize: 13,
    color: '#2D3436',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
