// ... (Import sama)
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function AddItemScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', price: '', image_url: '', description: '' } // Tambah default description
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const priceNumber = parseInt(data.price);
    const { error } = await supabase.from('products').insert({
      name: data.name,
      price: priceNumber,
      image_url: data.image_url || 'https://mcdonalds.co.id/assets/img/products/big-mac.png',
      description: data.description, // Kirim deskripsi ke DB
    });
    setIsSubmitting(false);
    if (error) Alert.alert("Gagal", error.message);
    else router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Tambah Menu Baru</Text>

      {/* Input Nama & Harga (Sama seperti sebelumnya...) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Menu <Text style={styles.red}>*</Text></Text>
        <Controller control={control} name="name" rules={{ required: 'Wajib diisi' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Nama Menu" />
          )} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Harga <Text style={styles.red}>*</Text></Text>
        <Controller control={control} name="price" rules={{ required: 'Wajib diisi', pattern: { value: /^[0-9]+$/, message: 'Angka saja' } }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" placeholder="Harga" />
          )} />
      </View>

      {/* --- INPUT DESKRIPSI (BARU) --- */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi Singkat</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} // Multiline style
              placeholder="Jelaskan rasanya..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline={true}
              numberOfLines={3}
            />
          )}
        />
      </View>

      {/* Input Gambar */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>URL Gambar</Text>
        <Controller control={control} name="image_url"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={styles.input} onBlur={onBlur} onChangeText={onChange} value={value} placeholder="https://..." />
          )} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Simpan Menu</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles sama seperti sebelumnya...
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  red: { color: 'red' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#f9f9f9', height: 50 },
  saveButton: { backgroundColor: '#FFBC0D', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  saveButtonText: { fontSize: 18, fontWeight: 'bold' }
});