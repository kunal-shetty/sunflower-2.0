import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useTodos, type Category, type Priority, CATEGORIES, PRIORITIES } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Personal: 'person-outline',
  Work: 'briefcase-outline',
  Health: 'heart-outline',
  Shopping: 'cart-outline',
  Finance: 'cash-outline',
  Education: 'school-outline',
  Other: 'ellipsis-horizontal-outline',
};

const PRIORITY_ICONS: Record<Priority, keyof typeof Ionicons.glyphMap> = {
  urgent: 'flame-outline',
  high: 'arrow-up-outline',
  medium: 'remove-outline',
  low: 'arrow-down-outline',
  none: 'ellipse-outline',
};

function AnimatedNumber({ value, color, size = 36 }: { value: number; color: string; size?: number }) {
  const animVal = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(animVal, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <RNAnimated.Text
      style={{
        fontSize: size,
        fontWeight: '800',
        color,
        transform: [
          {
            scale: animVal.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 1.1, 1],
            }),
          },
        ],
      }}
    >
      {value}
    </RNAnimated.Text>
  );
}

function AnimatedBar({
  percentage,
  color,
  bgColor,
  delay = 0,
}: {
  percentage: number;
  color: string;
  bgColor: string;
  delay?: number;
}) {
  const widthAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      RNAnimated.spring(widthAnim, {
        toValue: percentage,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [percentage, delay]);

  return (
    <View style={[styles.barBg, { backgroundColor: bgColor }]}>
      <RNAnimated.View
        style={[
          styles.barFill,
          {
            backgroundColor: color,
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </View>
  );
}

function ProgressRing({
  percentage,
  size,
  strokeWidth,
  color,
  bgColor,
}: {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
  bgColor: string;
}) {
  const clamp = Math.min(100, Math.max(0, percentage));
  const scaleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <RNAnimated.View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale: scaleAnim }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: clamp > 25 ? color : 'transparent',
          borderBottomColor: clamp > 50 ? color : 'transparent',
          borderLeftColor: clamp > 75 ? color : 'transparent',
          position: 'absolute',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <Text style={{ fontSize: size * 0.22, fontWeight: '800', color }}>{clamp}%</Text>
    </RNAnimated.View>
  );
}

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { stats, todos } = useTodos();

  const recentlyCompleted = todos
    .filter((t) => t.status === 'completed' && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  const priorityColors: Record<Priority, string> = {
    urgent: colors.priorityUrgent,
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
    none: colors.priorityNone,
  };

  const maxCategoryCount = Math.max(
    ...CATEGORIES.map((c) => stats.byCategory[c] || 0),
    1
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
      </Animated.View>

      {/* Big Ring + Headline stats */}
      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={[styles.heroCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={styles.heroRow}>
            <ProgressRing
              percentage={stats.completionRate}
              size={110}
              strokeWidth={10}
              color={colors.accent}
              bgColor={colors.border}
            />
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <AnimatedNumber value={stats.completed} color={colors.success} size={32} />
                <Text style={[styles.heroStatLabel, { color: colors.secondaryText }]}>Completed</Text>
              </View>
              <View style={styles.heroStatItem}>
                <AnimatedNumber value={stats.active} color={colors.warning} size={32} />
                <Text style={[styles.heroStatLabel, { color: colors.secondaryText }]}>Active</Text>
              </View>
            </View>
          </View>
          {stats.todayCompleted > 0 && (
            <View style={[styles.todayStrip, { backgroundColor: colors.successLight }]}>
              <Ionicons name="trending-up" size={16} color={colors.success} />
              <Text style={[styles.todayStripText, { color: colors.success }]}>
                +{stats.todayCompleted} completed today
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Quick metrics row */}
      <View style={styles.metricsRow}>
        {[
          { label: 'Total', value: stats.total, icon: 'layers-outline' as keyof typeof Ionicons.glyphMap, color: colors.accent, bg: colors.accentLight },
          { label: 'Overdue', value: stats.overdue, icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap, color: colors.destructive, bg: colors.destructiveLight },
          { label: 'Due Today', value: stats.dueToday, icon: 'today-outline' as keyof typeof Ionicons.glyphMap, color: colors.warning, bg: colors.warningLight },
          { label: 'Starred', value: stats.favorites, icon: 'star-outline' as keyof typeof Ionicons.glyphMap, color: colors.favorite, bg: colors.accentLight },
        ].map((m, i) => (
          <Animated.View key={m.label} entering={FadeInDown.delay(200 + i * 60).springify()} style={styles.metricCardWrap}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
              <View style={[styles.metricIcon, { backgroundColor: m.bg }]}>
                <Ionicons name={m.icon} size={16} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>{m.label}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Priority Breakdown */}
      <Animated.View entering={FadeInRight.delay(350).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Active by Priority</Text>
          {PRIORITIES.map((p, i) => {
            const count = stats.byPriority[p] || 0;
            const maxP = Math.max(...Object.values(stats.byPriority), 1);
            return (
              <View key={p} style={[styles.priorityRow, { borderBottomColor: colors.borderLight }]}>
                <View style={styles.priorityRowLeft}>
                  <View style={[styles.priorityIcon, { backgroundColor: priorityColors[p] + '18' }]}>
                    <Ionicons name={PRIORITY_ICONS[p]} size={14} color={priorityColors[p]} />
                  </View>
                  <Text style={[styles.priorityLabel, { color: colors.text }]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </View>
                <View style={styles.priorityBarWrap}>
                  <AnimatedBar
                    percentage={(count / maxP) * 100}
                    color={priorityColors[p]}
                    bgColor={colors.border}
                    delay={400 + i * 80}
                  />
                  <Text style={[styles.priorityCount, { color: colors.text }]}>{count}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Category Distribution */}
      <Animated.View entering={FadeInRight.delay(500).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>By Category</Text>
          {CATEGORIES.map((cat, i) => {
            const count = stats.byCategory[cat] || 0;
            return (
              <View key={cat} style={styles.categoryRow}>
                <View style={styles.categoryRowLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name={CATEGORY_ICONS[cat]} size={14} color={colors.accent} />
                  </View>
                  <Text style={[styles.categoryLabel, { color: colors.text }]}>{cat}</Text>
                </View>
                <View style={styles.categoryBarWrap}>
                  <AnimatedBar
                    percentage={(count / maxCategoryCount) * 100}
                    color={colors.accent}
                    bgColor={colors.border}
                    delay={600 + i * 60}
                  />
                  <Text style={[styles.categoryCount, { color: colors.secondaryText }]}>{count}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Recently Completed */}
      <Animated.View entering={FadeInDown.delay(700).springify()}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recently Completed</Text>
          {recentlyCompleted.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Ionicons name="checkmark-done-outline" size={32} color={colors.border} />
              <Text style={[styles.emptyRecentText, { color: colors.secondaryText }]}>
                No completed tasks yet
              </Text>
            </View>
          ) : (
            recentlyCompleted.map((todo, i) => (
              <Animated.View key={todo.id} entering={FadeInDown.delay(750 + i * 50)}>
                <View style={[styles.completedItem, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.completedCheckIcon, { backgroundColor: colors.successLight }]}>
                    <Ionicons name="checkmark" size={14} color={colors.success} />
                  </View>
                  <View style={styles.completedContent}>
                    <Text style={[styles.completedTitle, { color: colors.text }]} numberOfLines={1}>
                      {todo.title}
                    </Text>
                    <Text style={[styles.completedDate, { color: colors.secondaryText }]}>
                      {todo.completedAt
                        ? new Date(todo.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                  <View style={[styles.completedCategoryChip, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.completedCategoryText, { color: colors.accent }]}>{todo.category}</Text>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </Animated.View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  heroStats: { flex: 1, gap: 12 },
  heroStatItem: {},
  heroStatLabel: { fontSize: 13, fontWeight: '500', marginTop: 1 },
  todayStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  todayStripText: { fontSize: 13, fontWeight: '600' },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCardWrap: { width: '48%', flexGrow: 1 },
  metricCard: {
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: { fontSize: 22, fontWeight: '800' },
  metricLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  card: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  priorityRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 110 },
  priorityIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityLabel: { fontSize: 14, fontWeight: '500' },
  priorityBarWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  priorityCount: { fontSize: 16, fontWeight: '700', width: 28, textAlign: 'right' },
  barBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 120 },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: { fontSize: 13, fontWeight: '500' },
  categoryBarWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryCount: { fontSize: 13, fontWeight: '600', width: 24, textAlign: 'right' },
  emptyRecent: { alignItems: 'center', paddingVertical: 24 },
  emptyRecentText: { fontSize: 14, marginTop: 8 },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  completedCheckIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContent: { flex: 1 },
  completedTitle: { fontSize: 14, fontWeight: '600' },
  completedDate: { fontSize: 12, marginTop: 2 },
  completedCategoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedCategoryText: { fontSize: 11, fontWeight: '600' },
});
