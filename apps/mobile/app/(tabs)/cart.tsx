import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cart — coming in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  text: { color: COLORS.textSecondary, fontSize: 16 },
});
