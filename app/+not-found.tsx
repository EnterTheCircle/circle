import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Circle</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  link: { marginTop: 16, paddingVertical: 12 },
  linkText: { fontSize: 15, color: Colors.accent, fontWeight: '600' },
});
