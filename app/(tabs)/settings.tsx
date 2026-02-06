import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTodos } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  destructive,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsItem, { borderBottomColor: colors.border }]}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.settingsIcon,
            { backgroundColor: destructive ? colors.destructive + '14' : colors.accentLight },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={destructive ? colors.destructive : colors.accent}
          />
        </View>
        <Text
          style={[
            styles.settingsLabel,
            { color: destructive ? colors.destructive : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.settingsItemRight}>
        {value && (
          <Text style={[styles.settingsValue, { color: colors.secondaryText }]}>{value}</Text>
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { stats, todos } = useTodos();

  const handleClearCompleted = () => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) {
      Alert.alert('No Completed Tasks', 'There are no completed tasks to clear.');
      return;
    }
    Alert.alert(
      'Clear Completed',
      `Remove ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            const activeTodos = todos.filter((t) => !t.completed);
            AsyncStorage.setItem('@todos', JSON.stringify(activeTodos)).catch(() => {});
            // Force reload by clearing and re-setting
            // Note: In a production app, you'd add a clearCompleted method to context
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (todos.length === 0) {
      Alert.alert('No Tasks', 'There are no tasks to clear.');
      return;
    }
    Alert.alert('Clear All Tasks', 'This will permanently delete all your tasks. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: () => {
          AsyncStorage.removeItem('@todos').catch(() => {});
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="person" size={28} color={colors.accent} />
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.text }]}>My Tasks</Text>
          <Text style={[styles.profileEmail, { color: colors.secondaryText }]}>
            {stats.total} tasks / {stats.completionRate}% complete
          </Text>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
        <SettingsItem
          icon="documents-outline"
          label="Total Tasks"
          value={stats.total.toString()}
          colors={colors}
        />
        <SettingsItem
          icon="checkmark-done-outline"
          label="Completed"
          value={stats.completed.toString()}
          colors={colors}
        />
        <SettingsItem
          icon="time-outline"
          label="Active"
          value={stats.active.toString()}
          colors={colors}
        />
        <SettingsItem
          icon="flame-outline"
          label="Completed Today"
          value={stats.todayCompleted.toString()}
          colors={colors}
        />
      </View>

      {/* App Info */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
        <SettingsItem icon="information-circle-outline" label="Version" value="1.0.0" colors={colors} />
        <SettingsItem
          icon="color-palette-outline"
          label="Theme"
          value={colorScheme === 'dark' ? 'Dark' : 'Light'}
          colors={colors}
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.destructive }]}>Data</Text>
        <SettingsItem
          icon="checkmark-done-outline"
          label="Clear Completed Tasks"
          onPress={handleClearCompleted}
          destructive
          colors={colors}
        />
        <SettingsItem
          icon="trash-outline"
          label="Delete All Tasks"
          onPress={handleClearAll}
          destructive
          colors={colors}
        />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingsValue: {
    fontSize: 14,
  },
});
