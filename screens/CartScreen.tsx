import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../contexts/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function CartScreen() {
  const { items, removeFromCart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    setPaying(true);
    setTimeout(() => {
        setPaying(false);
        clearCart(); // Kosongkan keranjang
        Alert.alert("🎉 Pesanan Diterima!", "Terima kasih sudah jajan di Mekdi.", [
            { text: "Kembali ke Home", onPress: () => router.replace('/user') }
        ]);
    }, 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.title}>Keranjang Saya</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* List Barang */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={{color:'#888', marginTop: 10}}>Keranjang masih kosong nih.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
               <Image source={{ uri: item.image_url }} style={styles.itemImage} />
               <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rp {item.price.toLocaleString('id-ID')} x {item.quantity}</Text>
                  <Text style={{fontWeight:'bold', marginTop: 4}}>Total: Rp {(item.price * item.quantity).toLocaleString('id-ID')}</Text>
               </View>
               <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Ionicons name="trash-outline" size={24} color="#DB0007" />
               </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Bottom Checkout */}
      {items.length > 0 && (
          <View style={styles.footer}>
             <View>
                <Text style={{color: '#666'}}>Total Tagihan:</Text>
                <Text style={styles.totalPrice}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
             </View>
             <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={paying}>
                {paying ? <ActivityIndicator color="black" /> : <Text style={{fontWeight:'bold'}}>Bayar Sekarang</Text>}
             </TouchableOpacity>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, alignItems: 'center', elevation: 1 },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  itemPrice: { color: '#666', marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 10, borderTopWidth: 1, borderColor: '#eee' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#DB0007' },
  checkoutBtn: { backgroundColor: '#FFBC0D', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 10 }
});