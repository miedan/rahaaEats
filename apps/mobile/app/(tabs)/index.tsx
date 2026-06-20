import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home — coming in Phase 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
