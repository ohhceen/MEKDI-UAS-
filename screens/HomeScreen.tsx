import { View, FlatList, StyleSheet, Image, Text, TouchableOpacity, Dimensions, RefreshControl, Alert, Platform, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect, useRouter, Stack } from 'expo-router'; 
import { supabase } from '../services/supabase';
import ProductCard from '../components/ProductCard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons'; 

type Product = { id: string; name: string; price: number; image_url?: string; description?: string; };

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({}); 
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();
  
  // Layout Config
  const { width } = Dimensions.get('window');
  const numColumns = width > 600 ? 3 : 2; 
  const containerWidth = Math.min(width, 1000); 
  const CARD_WIDTH = (containerWidth / numColumns) - 20; 
  
  // ✅ FIX ERROR 1: Definisikan pointerStyle sebagai 'any' agar tidak merah
  const pointerStyle: any = Platform.OS === 'web' ? { cursor: 'pointer' } : {};

  // --- LOGIC CEK ADMIN ---
  useEffect(() => {
    const checkUser = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            const userEmail = data.session.user.email;
            // ⚠️ GANTI EMAIL ADMIN DI SINI ⚠️
            const ADMIN_EMAIL = 'test@mekdi.com'; 

            if (userEmail && userEmail.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    };
    checkUser();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
  };

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));
  const onRefresh = async () => { setRefreshing(true); await fetchProducts(); setRefreshing(false); };

  // --- LOGIC KERANJANG ---
  const handleAddItem = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  
  const handleRemoveItem = (id: string) => {
    setCart(prev => {
      const currentQty = prev[id] || 0;
      const newCart = { ...prev };
      if (currentQty > 1) newCart[id] = currentQty - 1;
      else delete newCart[id];
      return newCart;
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = products.reduce((sum, product) => sum + (product.price * (cart[product.id] || 0)), 0);

  // --- NAVIGASI PAYMENT ---
  const goToPayment = () => {
    if (totalItems === 0) {
        Alert.alert("Keranjang Kosong", "Silakan pilih menu terlebih dahulu.");
        return;
    }
    const selectedItems = products
        .filter(p => cart[p.id] > 0)
        .map(p => ({
            id: p.id, name: p.name, price: p.price, qty: cart[p.id], total: p.price * cart[p.id], image_url: p.image_url 
        }));

    router.push({
        pathname: '/payment',
        params: { items: JSON.stringify(selectedItems), grandTotal: totalPrice.toString() }
    });
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const performDelete = async () => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) { Alert.alert("Gagal", error.message); return; }
            if (Platform.OS === 'web') alert(`Menu "${name}" dihapus.`);
            else Alert.alert("Sukses", `Menu "${name}" dihapus.`);
            fetchProducts(); 
        } catch (err) { console.error(err); }
    };

    if (Platform.OS === 'web') {
        if (window.confirm(`Hapus menu "${name}"?`)) performDelete();
    } else {
        Alert.alert("Hapus Menu", `Yakin hapus "${name}"?`, [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive", onPress: performDelete }]);
    }
  };

  const handleLogout = () => {
    const logout = async () => { await supabase.auth.signOut(); setIsAdmin(false); router.replace('/Login'); };
    if (Platform.OS === 'web') { if(window.confirm("Keluar?")) logout(); }
    else { Alert.alert("Logout", "Keluar aplikasi?", [{text:"Batal"}, {text:"Ya", onPress: logout}]); }
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.bannerContainer}>
         <Image source={{ uri: 'https://mcdonalds.co.id/assets/img/home/hero-promo-mobile.png' }} style={styles.bannerImage} resizeMode="cover" />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isAdmin ? "Dashboard Admin" : "Menu Tersedia"}</Text>
        {isAdmin && <TouchableOpacity onPress={() => router.push('/additem')} style={pointerStyle}><Text style={styles.addButtonText}>+ Tambah Menu</Text></TouchableOpacity>}
      </View>
    </View>
  );

  return (
    <View style={styles.mainBackground}>
      {/* ✅ FIX 2: Sembunyikan Header Bawaan "Home" yang besar */}
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      <SafeAreaView style={{ flex: 1, alignItems: 'center', width: '100%' }} edges={['top']}>
        
        {/* CONTAINER KONTEN */}
        <View style={[styles.contentContainer, { width: containerWidth }]}>
            
            {/* HEADER CUSTOM */}
            <View style={styles.topBar}>
              <View style={styles.logoContainer}>
                  <Image 
                    // Gunakan URL PNG yang aman untuk Android
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/200px-McDonald%27s_Golden_Arches.svg.png' }} 
                    style={styles.logo} 
                    resizeMode="contain" 
                  />
              </View>
              <TouchableOpacity onPress={handleLogout} style={[styles.userBadge, pointerStyle]}>
                 <Ionicons name="person-circle" size={24} color="#333" />
                 <View style={{marginLeft: 5}}>
                     <Text style={styles.userLabel}>{isAdmin ? "Admin" : "User"}</Text>
                     <Text style={{fontSize: 10, color: '#DB0007'}}>Keluar</Text>
                 </View>
              </TouchableOpacity>
            </View>

            <FlatList
              data={products}
              extraData={[cart, isAdmin]} 
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={numColumns} 
              columnWrapperStyle={styles.row}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListHeaderComponent={ListHeader}
              contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }} 
              renderItem={({ item }) => (
                <View style={{ width: CARD_WIDTH, marginBottom: 12 }}>
                   <ProductCard
                      product={item}
                      quantity={cart[item.id] || 0}
                      onIncrement={() => handleAddItem(item.id)}
                      onDecrement={() => handleRemoveItem(item.id)}
                      isAdmin={isAdmin}
                      
                      onEdit={() => router.push({ pathname: '/edit-item', params: { id: item.id } })}
                      onDelete={() => handleDeleteProduct(item.id, item.name)}
                      onDetail={() => router.push({ pathname: '/detail', params: { id: item.id } })}
                   />
                </View>
              )}
            />
        </View>

        {/* OVERLAY USER */}
        {!isAdmin && (
            <>
                <TouchableOpacity 
                    style={[styles.fabCart, pointerStyle, totalItems > 0 ? { bottom: 90 } : { bottom: 30 }]} 
                    onPress={goToPayment}
                >
                    <Ionicons name="cart" size={26} color="white" />
                    {totalItems > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>}
                </TouchableOpacity>

                {totalItems > 0 && (
                    <View style={styles.bottomSummary}>
                        <View>
                            <Text style={styles.summaryLabel}>Total Harga</Text>
                            <Text style={styles.summaryPrice}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
                        </View>
                        <TouchableOpacity style={[styles.btnCheckout, pointerStyle]} onPress={goToPayment}>
                            <Text style={styles.btnCheckoutText}>Pesan Sekarang</Text>
                            <Ionicons name="arrow-forward" size={18} color="white" style={{marginLeft: 8}}/>
                        </TouchableOpacity>
                    </View>
                )}
            </>
        )}

      </SafeAreaView>
    </View>
  );
}

// ✅ FIX 3: Helper Style Shadow (Tipe 'any' agar VS Code tidak merah)
const getShadowStyle = (): any => {
    return Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
        android: { elevation: 10 },
        web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.3)' }
    });
};

// ✅ FIX 4: Helper Style Bottom Summary Shadow
const getBottomShadow = (): any => {
    return Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 3 },
        android: { elevation: 20 },
        web: { boxShadow: '0px -4px 10px rgba(0,0,0,0.1)' }
    });
};

const styles = StyleSheet.create({
  mainBackground: { 
    flex: 1, 
    backgroundColor: '#e5e5e5', 
    alignItems: 'center',
    // ✅ FIX 5: Gunakan 'as any' untuk 100vh di Web
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%' 
  },
  
  contentContainer: {
    flex: 1,
    backgroundColor: '#fcfcfc',
    height: '100%',
    width: '100%',
  },

  topBar: { 
    height: 80, 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    zIndex: 1,
    position: 'relative' 
  },
  
  logoContainer: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      elevation: 5,
      backgroundColor: 'transparent'
  },
  logo: { width: '100%', height: '100%' },
  
  userBadge: { 
      position: 'absolute', 
      right: 15,
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 5, 
      backgroundColor: '#f9f9f9', 
      borderRadius: 20, 
      paddingHorizontal: 10, 
      borderWidth: 1, 
      borderColor: '#eee',
      zIndex: 20, 
      elevation: 6
  },
  userLabel: { fontWeight: 'bold', color: '#333', fontSize: 12 },
  
  headerContainer: { marginBottom: 10 },
  bannerContainer: { width: '100%', height: 180, marginBottom: 15 },
  bannerImage: { width: '100%', height: '100%' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  addButtonText: { color: '#DB0007', fontWeight: 'bold' },
  row: { justifyContent: 'space-between', paddingHorizontal: 15 },

  fabCart: { 
    position: 'absolute', 
    right: 20, 
    width: 60, height: 60, borderRadius: 30, 
    backgroundColor: '#222', 
    justifyContent: 'center', alignItems: 'center', 
    zIndex: 9999, 
    ...getShadowStyle() // Gunakan helper function
  },
  
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#DB0007', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  badgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },

  bottomSummary: { 
    position: 'absolute', 
    bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', 
    padding: 16, paddingBottom: 24, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderTopWidth: 1, borderTopColor: '#f0f0f0', 
    zIndex: 9999, 
    ...getBottomShadow() // Gunakan helper function
  },
  
  summaryLabel: { fontSize: 12, color: '#666', marginBottom: 2 },
  summaryPrice: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  btnCheckout: { backgroundColor: '#DB0007', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  btnCheckoutText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});