import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Alert 
} from 'react-native';
// Pastikan install icons: npx expo install @expo/vector-icons
import { Ionicons } from '@expo/vector-icons'; 

// 1. Tipe Data Produk
interface Product {
  id: number;
  name: string;
  price: number;
  image: string; // URL gambar
}

// Data Dummy
const PRODUCTS: Product[] = [
  { id: 1, name: 'Nasi Goreng Spesial', price: 25000, image: 'https://via.placeholder.com/100' },
  { id: 2, name: 'Ayam Bakar Madu', price: 30000, image: 'https://via.placeholder.com/100' },
  { id: 3, name: 'Es Teh Manis', price: 5000, image: 'https://via.placeholder.com/100' },
  { id: 4, name: 'Kopi Susu Gula Aren', price: 18000, image: 'https://via.placeholder.com/100' },
];

export default function MenuScreen() {
  // 2. STATE KERANJANG
  // Format: { productId: quantity } -> Contoh: { 1: 2, 3: 1 }
  const [cart, setCart] = useState<Record<number, number>>({});

  // LOGIC: Tambah Item
  const handleAddItem = (id: number) => {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  // LOGIC: Kurang Item
  const handleRemoveItem = (id: number) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newCart = { ...prev };
      
      if (currentQty > 1) {
        newCart[id] = currentQty - 1;
      } else {
        delete newCart[id]; // Hapus dari object jika 0
      }
      return newCart;
    });
  };

  // LOGIC: Hitung Total
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = PRODUCTS.reduce((sum, product) => {
    const qty = cart[product.id] || 0;
    return sum + (product.price * qty);
  }, 0);

  // FORMAT RUPIAH
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // 3. COMPONENT: Product Card
  const renderItem = ({ item }: { item: Product }) => {
    const quantity = cart[item.id] || 0;

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{formatRupiah(item.price)}</Text>
          
          {/* LOGIKA BUTTON KUANTITAS (Poin 2 User) */}
          <View style={styles.counterContainer}>
            {quantity > 0 ? (
              <>
                <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.btnMinus}>
                  <Ionicons name="remove" size={20} color="#FF5722" />
                </TouchableOpacity>
                
                <Text style={styles.qtyText}>{quantity}</Text>
                
                <TouchableOpacity onPress={() => handleAddItem(item.id)} style={styles.btnPlus}>
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </>
            ) : (
              // Jika 0, tampilkan tombol "Tambah" pertama kali
              <TouchableOpacity onPress={() => handleAddItem(item.id)} style={styles.btnAddInitial}>
                <Text style={styles.btnAddText}>+ Tambah</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daftar Menu</Text>
      </View>

      <FlatList
        data={PRODUCTS}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // Supaya item terbawah tidak tertutup bar
      />

      {/* 4. COMPONENT: Floating Cart Icon (Poin 3 User) */}
      {/* Tombol ini untuk melihat detail keranjang/edit */}
      <TouchableOpacity 
        style={[styles.fabCart, totalItems > 0 ? { bottom: 90 } : { bottom: 30 }]} 
        onPress={() => Alert.alert("Navigasi", "Buka Halaman Detail Keranjang")}
      >
        <Ionicons name="cart" size={24} color="white" />
        {totalItems > 0 && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
        )}
      </TouchableOpacity>

      {/* 5. COMPONENT: Sticky Bottom Summary (Poin 2 User - Bagian Bawah) */}
      {totalItems > 0 && (
        <View style={styles.bottomSummary}>
          <View>
            <Text style={styles.summaryLabel}>Total Pesanan ({totalItems} item)</Text>
            <Text style={styles.summaryPrice}>{formatRupiah(totalPrice)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.btnCheckout}
            onPress={() => Alert.alert("Payment", "Masuk ke halaman pembayaran")}
          >
            <Text style={styles.btnCheckoutText}>Pesan Sekarang</Text>
            <Ionicons name="arrow-forward" size={16} color="white" style={{marginLeft: 5}}/>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// STYLING
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: 'white', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  
  // Card Style
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2, // Shadow android
  },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' },
  infoContainer: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  price: { fontSize: 14, color: '#666', marginBottom: 8 },
  
  // Counter Button Style
  counterContainer: { flexDirection: 'row', alignItems: 'center' },
  btnMinus: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: '#FF5722',
    justifyContent: 'center', alignItems: 'center'
  },
  btnPlus: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FF5722',
    justifyContent: 'center', alignItems: 'center'
  },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: 'bold' },
  btnAddInitial: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#FF5722', borderRadius: 8
  },
  btnAddText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  // Floating Action Button (Cart Icon)
  fabCart: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity:0.3
  },
  badge: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: 'red', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // Bottom Summary Bar
  bottomSummary: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#eee',
    elevation: 10
  },
  summaryLabel: { fontSize: 12, color: '#666' },
  summaryPrice: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  btnCheckout: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row', alignItems: 'center'
  },
  btnCheckoutText: { color: 'white', fontWeight: 'bold' }
});