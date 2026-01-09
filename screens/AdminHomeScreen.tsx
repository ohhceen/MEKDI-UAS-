import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Icon bawaan Expo

type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
};

export default function AdminHomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // --- 1. FETCH DATA ---
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setProducts(data || []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. DELETE FUNCTION ---
  const handleDelete = (id: string, name: string) => {
    Alert.alert("Hapus Menu", `Yakin hapus ${name}?`, [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) Alert.alert("Gagal", error.message);
          else {
            fetchProducts(); // Refresh list otomatis
          }
        }
      }
    ]);
  };

  // --- 3. KOMPONEN HEADER DASHBOARD ---
  const DashboardHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.welcomeText}>Halo, Admin 👋</Text>
      <Text style={styles.subText}>Kelola restoranmu dari sini</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statLabel}>Total Menu</Text>
            <Text style={[styles.statValue, { color: '#1565C0' }]}>{products.length}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statLabel}>Perlu Update</Text>
            <Text style={[styles.statValue, { color: '#EF6C00' }]}>2</Text>
        </View>
      </View>

      {/* Tombol Tambah Besar */}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/additem')}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Tambah Menu Baru</Text>
      </TouchableOpacity>
    </View>
  );

  // --- 4. TAMPILAN PER BARIS (LIST ITEM) ---
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.listItem}>
        {/* Gambar Kecil */}
        <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} 
            style={styles.listImage} 
        />
        
        {/* Info Text */}
        <View style={styles.listInfo}>
            <Text style={styles.listTitle}>{item.name}</Text>
            <Text style={styles.listPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
            <TouchableOpacity 
                style={[styles.iconBtn, styles.editBtn]} 
                onPress={() => router.push({ pathname: '/edit-item', params: { id: item.id } })}
            >
                <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.iconBtn, styles.deleteBtn]} 
                onPress={() => handleDelete(item.id, item.name)}
            >
                <Ionicons name="trash" size={18} color="white" />
            </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={DashboardHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' }, // Background agak abu profesional
  
  // Header Styles
  headerContainer: { padding: 20, backgroundColor: 'white', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50' },
  subText: { color: '#7F8C8D', marginBottom: 20 },
  
  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', padding: 15, borderRadius: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#555', marginBottom: 5 },
  statValue: { fontSize: 28, fontWeight: 'bold' },

  // Big Add Button
  addButton: {
    backgroundColor: '#27AE60', // Hijau Admin
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },

  // List Item Styles
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    // Shadow tipis
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  listImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' },
  listInfo: { flex: 1, marginLeft: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  listPrice: { color: '#666', fontSize: 14 },
  
  // Actions
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 35, height: 35, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#F39C12' }, // Orange Edit
  deleteBtn: { backgroundColor: '#C0392B' }, // Merah Hapus
});