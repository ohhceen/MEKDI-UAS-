import { View, FlatList, StyleSheet, Image, Text, TouchableOpacity, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router'; 
import { supabase } from '../services/supabase';
import ProductCard from '../components/ProductCard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 

type Product = { id: string; name: string; price: number; image_url?: string; description?: string; };

export default function UserHomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const { width } = Dimensions.get('window');
  const MAX_WIDTH = 600; 
  const containerWidth = Math.min(width, MAX_WIDTH);
  const CARD_WIDTH = (containerWidth / 2) - 20; 

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));
  const onRefresh = async () => { setRefreshing(true); await fetchProducts(); setRefreshing(false); };

  const handleLogout = async () => {
    Alert.alert("Halo Pelanggan!", "Ingin keluar aplikasi?", [
      { text: "Batal", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: async () => { await supabase.auth.signOut(); router.replace('/Login'); } }
    ]);
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.bannerContainer}>
         <Image source={{ uri: 'https://mcdonalds.co.id/assets/img/home/hero-promo-mobile.png' }} style={styles.bannerImage} resizeMode="cover" />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mau makan apa hari ini?</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#e5e5e5', alignItems: 'center' }}>
      <SafeAreaView style={[styles.container, { width: containerWidth }]} edges={['top']}>
        <StatusBar style="dark" />
        
        {/* HEADER USER (Avatar) */}
        <View style={styles.topBar}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' }} style={styles.logo} resizeMode="contain" />
          <View style={{flex: 1}} />
          <TouchableOpacity onPress={handleLogout} style={styles.userProfile}>
             <View style={styles.avatarCircle}>
                <Ionicons name="person" size={20} color="#000" />
             </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, marginBottom: 10 }}>
               {/* ✅ FIX: Hapus onEdit & onDelete. Cuma ada onDetail (untuk Pesan) */}
               <ProductCard
                  product={item}
                  onDetail={() => router.push({ pathname: '/detail', params: { id: item.id } })}
                />
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  topBar: { height: 70, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  logo: { width: 45, height: 45 },
  userProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFBC0D', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff', elevation: 2 },
  headerContainer: { marginBottom: 10 },
  bannerContainer: { width: '100%', height: 180 },
  bannerImage: { width: '100%', height: '100%' },
  sectionHeader: { paddingHorizontal: 15, marginTop: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  row: { justifyContent: 'space-between', paddingHorizontal: 15 },
});