import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../services/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

export default function EditItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Ambil ID produk yang mau diedit
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue } = useForm();

  // Ambil data lama dari Supabase
  useEffect(() => {
    const fetchItem = async () => {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
            setValue('name', data.name);
            setValue('price', data.price.toString());
            setValue('description', data.description);
            setValue('image_url', data.image_url);
        }
        setLoading(false);
    };
    if (id) fetchItem();
  }, [id]);

  const onUpdate = async (data: any) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('products').update({
      name: data.name,
      price: parseInt(data.price),
      description: data.description,
      image_url: data.image_url
    }).eq('id', id);

    setIsSubmitting(false);
    if (error) Alert.alert("Gagal", error.message);
    else router.back();
  };

  if (loading) return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large" color="#FFBC0D"/></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Edit Menu</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Menu</Text>
        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={onChange} value={value} />
        )} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Harga</Text>
        <Controller control={control} name="price" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={onChange} value={value} keyboardType="numeric" />
        )} />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi</Text>
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
            <TextInput style={[styles.input, { height: 80, textAlignVertical:'top', paddingTop:10 }]} multiline={true} onChangeText={onChange} value={value} />
        )} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>URL Gambar</Text>
        <Controller control={control} name="image_url" render={({ field: { onChange, value } }) => (
            <TextInput style={styles.input} onChangeText={onChange} value={value} />
        )} />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onUpdate)} disabled={isSubmitting}>
        {isSubmitting ? <ActivityIndicator color="#000" /> : <Text style={styles.saveButtonText}>Update Menu</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, backgroundColor: '#f9f9f9', height: 50 },
  saveButton: { backgroundColor: '#2ecc71', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 }, // Hijau untuk Edit
  saveButtonText: { fontSize: 18, fontWeight: 'bold', color: 'white' }
});