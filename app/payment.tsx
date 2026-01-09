import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

// 1. CONFIG DATA (Agar kode lebih pendek & mudah diatur)
const METHODS = [
  { id: 'tunai', label: 'Tunai (Cash)', icon: 'cash-outline', balance: null }, // Null artinya unlimited
  { id: 'ovo',   label: 'OVO',          icon: 'wallet-outline', balance: 25000 },
  { id: 'gopay', label: 'GoPay',        icon: 'card-outline',   balance: 500000 },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Data Pesanan
  const items = params.items ? JSON.parse(params.items as string) : [];
  const grandTotal = params.grandTotal ? parseInt(params.grandTotal as string) : 0;

  // State
  const [selectedId, setSelectedId] = useState('tunai');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [failMsg, setFailMsg] = useState('');
  const [orderId, setOrderId] = useState('');

  const pointer = Platform.OS === 'web' ? { cursor: 'pointer' } as any : {};

  // 2. LOGIKA PEMBAYARAN (Disederhanakan)
  const handlePay = () => {
    setStatus('loading');
    setTimeout(() => {
      const method = METHODS.find(m => m.id === selectedId);
      
      // Cek Saldo (Jika balance tidak null DAN kurang dari total)
      if (method?.balance !== null && grandTotal > method!.balance) {
        setFailMsg(`Saldo ${method?.label} Kurang.\n(Sisa: Rp ${method?.balance?.toLocaleString('id-ID')})`);
        setStatus('failed');
      } else {
        setOrderId(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
        setStatus('success');
      }
    }, 2000);
  };

  const finish = () => { setStatus('idle'); setTimeout(() => router.replace('/home'), 300); };

  // 3. REUSABLE COMPONENTS (Agar JSX tidak panjang)
  const ReceiptRow = ({ label, val, isTotal = false }: any) => (
    <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:4}}>
        <Text style={{fontSize:12, color: isTotal?'#333':'#666', fontWeight: isTotal?'bold':'normal'}}>{label}</Text>
        <Text style={{fontSize: isTotal?16:12, fontWeight:'bold', color: isTotal?'#DB0007':'#333'}}>{val}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* --- MODALS --- */}
      <Modal transparent visible={status === 'loading'} animationType="fade">
        <View style={styles.center}><View style={styles.box}><ActivityIndicator size="large" color="#DB0007"/><Text style={{marginTop:10, fontWeight:'bold'}}>Memproses...</Text></View></View>
      </Modal>

      <Modal transparent visible={status === 'success'} animationType="slide" onRequestClose={finish}>
        <View style={styles.center}><View style={styles.card}>
            <Ionicons name="checkmark-circle" size={60} color="#27ae60"/>
            <Text style={styles.titleRes}>Pembayaran Berhasil!</Text>
            <View style={styles.receipt}>
                <ReceiptRow label="Order ID" val={orderId} />
                <ReceiptRow label="Metode" val={METHODS.find(m => m.id === selectedId)?.label} />
                <View style={styles.dash} />
                <ReceiptRow label="TOTAL" val={`Rp ${grandTotal.toLocaleString('id-ID')}`} isTotal />
            </View>
            <TouchableOpacity style={[styles.btn, {backgroundColor:'#27ae60'}, pointer]} onPress={finish}><Text style={styles.btnTxt}>Selesai</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal transparent visible={status === 'failed'} animationType="fade">
        <View style={styles.center}><View style={styles.card}>
            <Ionicons name="close-circle" size={60} color="#c0392b"/>
            <Text style={[styles.titleRes, {color:'#c0392b'}]}>Pembayaran Gagal</Text>
            <Text style={{textAlign:'center', marginBottom:20, color:'#555'}}>{failMsg}</Text>
            <TouchableOpacity style={[styles.btn, {backgroundColor:'#c0392b', marginBottom:10}, pointer]} onPress={() => setStatus('idle')}><Text style={styles.btnTxt}>Coba Lagi</Text></TouchableOpacity>
            <TouchableOpacity style={pointer} onPress={() => { setStatus('idle'); setSelectedId('tunai'); }}><Text style={{textDecorationLine:'underline', color:'#666'}}>Ganti ke Tunai</Text></TouchableOpacity>
        </View></View>
      </Modal>

      {/* --- MAIN UI --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={pointer}><Ionicons name="arrow-back" size={24}/></TouchableOpacity>
        <Text style={{fontSize:18, fontWeight:'bold'}}>Checkout</Text><View style={{width:24}}/>
      </View>

      <ScrollView contentContainerStyle={{padding:20}}>
        {/* LIST ITEM */}
        <View style={styles.section}>
            {items.map((item: any, i: number) => (
                <View key={i} style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
                    <Text style={{fontWeight:'bold'}}>{item.qty}x {item.name}</Text>
                    <Text>Rp {item.total.toLocaleString('id-ID')}</Text>
                </View>
            ))}
            <View style={styles.dash} />
            <ReceiptRow label="Total Tagihan" val={`Rp ${grandTotal.toLocaleString('id-ID')}`} isTotal />
        </View>

        {/* METODE PEMBAYARAN (Looping dari Array Config) */}
        <Text style={{marginVertical:10, fontWeight:'bold', color:'#666'}}>METODE PEMBAYARAN</Text>
        {METHODS.map((m) => (
            <TouchableOpacity key={m.id} onPress={() => setSelectedId(m.id)} style={[styles.method, selectedId === m.id && styles.selected, pointer]}>
                <Ionicons name={m.icon as any} size={24} color={selectedId === m.id ? '#DB0007' : '#666'} />
                <View style={{marginLeft:10, flex:1}}>
                    <Text style={{fontWeight: selectedId === m.id?'bold':'normal'}}>{m.label}</Text>
                    {m.balance !== null && <Text style={{fontSize:11, color:'#666'}}>Saldo: Rp {m.balance.toLocaleString('id-ID')}</Text>}
                </View>
                {selectedId === m.id && <Ionicons name="checkmark-circle" size={20} color="#DB0007"/>}
            </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
         <View><Text style={{fontSize:12, color:'#666'}}>Total Bayar</Text><Text style={{fontSize:18, fontWeight:'bold'}}>Rp {grandTotal.toLocaleString('id-ID')}</Text></View>
         <TouchableOpacity style={[styles.btn, {backgroundColor:'#DB0007', paddingHorizontal:30}, pointer]} onPress={handlePay}><Text style={styles.btnTxt}>Bayar Sekarang</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: 'white', elevation: 2 },
  section: { backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 1, marginBottom: 10 },
  dash: { height: 1, backgroundColor: '#ddd', marginVertical: 10, borderStyle: 'dashed', borderWidth: 0.5 },
  
  // Method Styles
  method: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
  selected: { borderColor: '#DB0007', backgroundColor: '#FFF5F5' },
  
  // Modal Styles
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  box: { padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  card: { width: '85%', padding: 25, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' },
  titleRes: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: '#27ae60' },
  receipt: { width: '100%', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 },
  
  // Button & Footer
  btn: { paddingVertical: 12, borderRadius: 25, width: '100%', alignItems: 'center' },
  btnTxt: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 16, flexDirection: 'row', justifyContent: 'space-between', elevation: 10 }
});