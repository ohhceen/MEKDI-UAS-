import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const DEFAULT_IMAGE = 'https://mcdonalds.co.id/assets/img/products/big-mac.png';

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onDetail, 
  quantity = 0, 
  onIncrement, 
  onDecrement,
  isAdmin = false 
}: any) {
  
  const imageUrl = product.image_url || DEFAULT_IMAGE;
  const formatRupiah = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

  // Helper untuk style pointer di web
  const pointerStyle = Platform.OS === 'web' ? { cursor: 'pointer' } as any : {};

  return (
    <View style={styles.card}>
      {/* GAMBAR */}
      <TouchableOpacity 
        style={[styles.imageWrapper, pointerStyle]} 
        onPress={onDetail} 
        activeOpacity={0.9} 
      >
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
        {isAdmin && (
          <View style={styles.adminOverlay}>
            <TouchableOpacity style={[styles.editBtn, pointerStyle]} onPress={onEdit}>
              <Ionicons name="pencil" size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.deleteBtn, pointerStyle]} onPress={onDelete}>
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      
      {/* INFO */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>{formatRupiah(product.price)}</Text>

        {/* LOGIC USER (Sync HP & Laptop) */}
        {!isAdmin && (
          <View style={styles.actionArea}>
            {quantity > 0 ? (
              // COUNTER (Muncul saat quantity > 0)
              <View style={styles.counterContainer}>
                <TouchableOpacity onPress={onDecrement} style={[styles.counterBtn, pointerStyle]}>
                  <Ionicons name="remove" size={18} color="#DB0007" />
                </TouchableOpacity>
                <Text style={styles.counterText}>{quantity}</Text>
                <TouchableOpacity onPress={onIncrement} style={[styles.counterBtn, pointerStyle]}>
                  <Ionicons name="add" size={18} color="#DB0007" />
                </TouchableOpacity>
              </View>
            ) : (
              // TOMBOL PESAN AWAL
              <TouchableOpacity 
                style={[styles.addButton, pointerStyle]} 
                onPress={onIncrement} // Pastikan ini terpanggil
                activeOpacity={0.7}
              >
                <Text style={styles.addButtonText}>+ Pesan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 3, borderWidth: 1, borderColor: '#eee', height: 260, justifyContent: 'space-between' },
  imageWrapper: { width: '100%', height: 130, backgroundColor: '#f0f0f0', position: 'relative' },
  image: { width: '100%', height: '100%' },
  
  adminOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10 },
  editBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 5 },
  deleteBtn: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#DB0007', padding: 8, borderRadius: 20, elevation: 5 },

  infoContainer: { padding: 10, flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  price: { fontSize: 14, color: '#DB0007', fontWeight: 'bold' },
  
  actionArea: { marginTop: 5 },
  addButton: { backgroundColor: '#FFBC0D', padding: 8, borderRadius: 8, alignItems: 'center', width: '100%' },
  addButtonText: { fontWeight: 'bold', fontSize: 13 },
  counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 8, padding: 4 },
  counterBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' },
  counterText: { fontWeight: 'bold' }
});