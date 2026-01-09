import { View, TextInput, StyleSheet, Alert, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert("Ups", "Email dan password harus diisi.");
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

if (error) {
  Alert.alert('Gagal Masuk', error.message);
} else {
  // 👇 LOGIKA PEMBEDA (PENTING!)
  if (email === 'test@mekdi.com') {
    console.log("Login sebagai Admin");
    router.replace('/home'); // Ke Halaman Admin
  } else {
    console.log("Login sebagai User");
    router.replace('/user'); // Ke Halaman User
  }
}
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* --- HEADER LOGO MEKDI --- */}
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' }} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* --- FORM LOGIN --- */}
      <View style={styles.form}>
        <Text style={styles.greeting}>Selamat Datang!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Kata Sandi"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />

        {/* --- TOMBOL CUSTOM (Gaya Mekdi) --- */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Style disesuaikan dengan warna Brand McDonald's
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  form: {
    paddingHorizontal: 30,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  loginButton: {
    backgroundColor: '#FFBC0D', // Warna Kuning Mekdi
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0a800'
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  }
});