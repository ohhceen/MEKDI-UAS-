import { Stack } from 'expo-router';
import { CartProvider } from '../contexts/CartContext'; // Sesuaikan path jika error

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Stack ini akan otomatis memuat:
           1. (tabs) -> Folder tabs Anda
           2. payment -> File payment.tsx Anda
        */}
      </Stack>
    </CartProvider>
  );
}