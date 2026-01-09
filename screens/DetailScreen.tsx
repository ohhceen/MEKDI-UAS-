import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart(); // 👈 Pakai fungsi add
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1); // 👈 State Kuantitas

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  // Fungsi Tambah/Kurang
  const handleQty = (type: 'plus' | 'minus') => {
    if (type === 'plus') setQty(qty + 1);
    if (type === 'minus' && qty > 1) setQty(qty - 1);
  };

  // Fungsi Masuk Keranjang
  const handleAddToCart = () => {
    addToCart(product, qty);
    Alert.alert("Sukses", "Menu berhasil masuk keranjang!", [
      { text: "Lanjut Belanja", onPress: () => router.back() },
      { text: "Lihat Keranjang", onPress: () => router.push('/cart') }
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FFBC0D"/></View>;
  if (!product) return <View style={styles.center}><Text>Produk tidak ditemukan</Text></View>;

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 150}}> 
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
           <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Image source={{ uri: product.image_url || 'https://mcdonalds.co.id/assets/img/products/big-mac.png' }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
           <Text style={styles.name}>{product.name}</Text>
           <Text style={styles.price}>Rp {product.price.toLocaleString('id-ID')}</Text>
           <View style={styles.divider} />
           <Text style={styles.sectionTitle}>Deskripsi</Text>
           <Text style={styles.desc}>{product.description || "Tidak ada deskripsi."}</Text>
        </View>
      </ScrollView>

      {/* --- BOTTOM BAR QUANTITY & CART --- */}
      <View style={styles.bottomBar}>
         {/* KONTROL KUANTITAS */}
         <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => handleQty('minus')} style={styles.qtyBtn}><Ionicons name="remove" size={20} color="#333" /></TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity onPress={() => handleQty('plus')} style={styles.qtyBtn}><Ionicons name="add" size={20} color="#333" /></TouchableOpacity>
         </View>
         
         {/* TOMBOL ADD TO CART */}
         <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>+ Keranjang - Rp {(product.price * qty).toLocaleString('id-ID')}</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 5 },
  image: { width: '100%', height: 300 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 20, color: '#DB0007', fontWeight: 'bold', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  desc: { fontSize: 14, color: '#666', lineHeight: 22 },
  
  // Style Baru Bottom Bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#eee', elevation: 10
  },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 25, padding: 5 },
  qtyBtn: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: 'bold' },
  
  addToCartBtn: { backgroundColor: '#FFBC0D', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, elevation: 2, flex: 1, marginLeft: 15, alignItems: 'center' },
  addToCartText: { fontWeight: 'bold', fontSize: 14, color: 'black' }
});