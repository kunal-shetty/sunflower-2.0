import { Colors } from '@/constants/theme';
import { useTodos } from '@/context/todo-context';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SettingsItem({
  icon,
  label,
  value,
  onPress,
  destructive,
  colors,
  rightElement,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  colors: (typeof Colors)['light'];
  rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsItem, { borderBottomColor: colors.borderLight }]}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.settingsItemLeft}>
        <View
          style={[
            styles.settingsIcon,
            { backgroundColor: destructive ? colors.destructiveLight : colors.accentLight },
          ]}
        >
          <Ionicons
            name={icon}
            size={16}
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
        {rightElement || (
          <>
            {value && <Text style={[styles.settingsValue, { color: colors.secondaryText }]}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />}
          </>
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  // FORCE LIGHT MODE
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { stats, todos, clearCompleted, clearAll, getFilteredTodos } = useTodos();

  const archivedCount = getFilteredTodos('archived').length;
  const favoritesCount = getFilteredTodos('favorites').length;

  const handleClearCompleted = () => {
    if (stats.completed === 0) {
      Alert.alert('No Completed Tasks', 'There are no completed tasks to clear.');
      return;
    }
    Alert.alert(
      'Clear Completed',
      `Remove ${stats.completed} completed task${stats.completed === 1 ? '' : 's'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCompleted },
      ]
    );
  };

  const handleClearAll = () => {
    if (todos.length === 0) {
      Alert.alert('No Tasks', 'There are no tasks to clear.');
      return;
    }
    Alert.alert(
      'Delete All Tasks',
      'This will permanently delete ALL tasks including archived ones. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete All', style: 'destructive', onPress: clearAll },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </Animated.View>

      {/* Profile Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={[styles.avatar, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="person" size={30} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.text }]}>My Tasks</Text>
            <Text style={[styles.profileSubtext, { color: colors.secondaryText }]}>
              {stats.total} total / {stats.completionRate}% completion rate
            </Text>
          </View>
          <View style={[styles.profileBadge, { backgroundColor: colors.accentLight }]}>
            <Ionicons name="trophy" size={16} color={colors.accent} />
            <Text style={[styles.profileBadgeText, { color: colors.accent }]}>{stats.todayCompleted}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Stats */}
      <Animated.View entering={FadeInDown.delay(180).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <SettingsItem icon="layers-outline" label="Total Tasks" value={stats.total.toString()} colors={colors} />
          <SettingsItem icon="flash-outline" label="Active" value={stats.active.toString()} colors={colors} />
          <SettingsItem icon="checkmark-done-outline" label="Completed" value={stats.completed.toString()} colors={colors} />
          <SettingsItem icon="archive-outline" label="Archived" value={archivedCount.toString()} colors={colors} />
          <SettingsItem icon="heart-outline" label="Favorites" value={favoritesCount.toString()} colors={colors} />
          <SettingsItem icon="flame-outline" label="Completed Today" value={stats.todayCompleted.toString()} colors={colors} />
          {stats.overdue > 0 && (
            <SettingsItem icon="alert-circle-outline" label="Overdue" value={stats.overdue.toString()} colors={colors} />
          )}
        </View>
      </Animated.View>

      {/* Task Insights */}
      <Animated.View entering={FadeInDown.delay(260).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Task Insights</Text>

          {/* Top Categories */}
          {stats.total > 0 && (
            <>
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([cat, count]) => (
                  <View key={cat} style={[styles.insightRow, { borderBottomColor: colors.borderLight }]}>
                    <View style={styles.insightLeft}>
                      <View style={[styles.insightDot, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.insightLabel, { color: colors.text }]}>{cat}</Text>
                    </View>
                    <View style={styles.insightBarWrap}>
                      <View style={[styles.insightBarBg, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.insightBarFill,
                            {
                              backgroundColor: colors.accent,
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.insightCount, { color: colors.secondaryText }]}>{count}</Text>
                    </View>
                  </View>
                ))}
            </>
          )}
          {stats.total === 0 && (
            <Text style={[styles.noDataText, { color: colors.secondaryText }]}>
              Add tasks to see insights
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Features */}
      <Animated.View entering={FadeInDown.delay(420).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features</Text>
          <View style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.featureLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="star-outline" size={16} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Favorites</Text>
                <Text style={[styles.featureDesc, { color: colors.secondaryText }]}>
                  Star tasks to find them quickly
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.featureLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="archive-outline" size={16} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Archive</Text>
                <Text style={[styles.featureDesc, { color: colors.secondaryText }]}>
                  Swipe right on a task to archive it
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.featureItem, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.featureLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="notifications-outline" size={16} color={colors.warning} />
              </View>
              <View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>Reminders</Text>
                <Text style={[styles.featureDesc, { color: colors.secondaryText }]}>
                  Auto-reminds 30 min before due time
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

       {/* App Info */}
      <Animated.View entering={FadeInDown.delay(340).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
          <SettingsItem icon="information-circle-outline" label="Version" value="1.0.0" colors={colors} />
        </View>
      </Animated.View>



      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileSubtext: { fontSize: 13, marginTop: 2 },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  profileBadgeText: { fontSize: 14, fontWeight: '700' },
  card: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
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
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: { fontSize: 15, fontWeight: '500' },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsValue: { fontSize: 14, fontWeight: '600' },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightLabel: { fontSize: 13, fontWeight: '500' },
  insightBarWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  insightBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  insightBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightCount: { fontSize: 12, fontWeight: '600', width: 24, textAlign: 'right' },
  noDataText: { fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  featureTitle: { fontSize: 15, fontWeight: '600' },
  featureDesc: { fontSize: 12, marginTop: 1 },
});
