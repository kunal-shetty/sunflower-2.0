import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodos, type Category } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORY_CONFIG: Record<Category, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  personal: { label: 'Personal', icon: 'person-outline' },
  work: { label: 'Work', icon: 'briefcase-outline' },
  health: { label: 'Health', icon: 'heart-outline' },
  shopping: { label: 'Shopping', icon: 'cart-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal-outline' },
};

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
  // Simple circular progress visualization using View-based approach
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background circle */}
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
      {/* Foreground - we'll use a simpler approach with a filled arc */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: clampedPercentage > 25 ? color : 'transparent',
          borderBottomColor: clampedPercentage > 50 ? color : 'transparent',
          borderLeftColor: clampedPercentage > 75 ? color : 'transparent',
          position: 'absolute',
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <Text style={{ fontSize: size * 0.22, fontWeight: '700', color }}>
        {clampedPercentage}%
      </Text>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  color,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
      <View style={styles.statRowLeft}>
        <View style={[styles.statRowIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text style={[styles.statRowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Text style={[styles.statRowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function CategoryBar({
  category,
  count,
  total,
  colors,
}: {
  category: Category;
  count: number;
  total: number;
  colors: typeof Colors.light;
}) {
  const config = CATEGORY_CONFIG[category];
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryRowLeft}>
        <Ionicons name={config.icon} size={16} color={colors.accent} />
        <Text style={[styles.categoryLabel, { color: colors.text }]}>{config.label}</Text>
      </View>
      <View style={styles.categoryBarWrap}>
        <View style={[styles.categoryBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.categoryBarFill,
              { backgroundColor: colors.accent, width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={[styles.categoryCount, { color: colors.secondaryText }]}>{count}</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { stats, todos } = useTodos();

  const recentlyCompleted = todos
    .filter((t) => t.completed && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 3);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>

      {/* Completion Ring */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <View style={styles.ringRow}>
          <ProgressRing
            percentage={stats.completionRate}
            size={100}
            strokeWidth={8}
            color={colors.accent}
            bgColor={colors.border}
          />
          <View style={styles.ringStats}>
            <Text style={[styles.ringStatBig, { color: colors.text }]}>{stats.completed}</Text>
            <Text style={[styles.ringStatLabel, { color: colors.secondaryText }]}>
              of {stats.total} completed
            </Text>
            {stats.todayCompleted > 0 && (
              <Text style={[styles.todayBadge, { color: colors.accent }]}>
                +{stats.todayCompleted} today
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Priority Breakdown */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Active by Priority</Text>
        <StatRow
          icon="arrow-up-outline"
          label="High Priority"
          value={stats.byPriority.high}
          color={colors.priorityHigh}
          colors={colors}
        />
        <StatRow
          icon="remove-outline"
          label="Medium Priority"
          value={stats.byPriority.medium}
          color={colors.priorityMedium}
          colors={colors}
        />
        <StatRow
          icon="arrow-down-outline"
          label="Low Priority"
          value={stats.byPriority.low}
          color={colors.priorityLow}
          colors={colors}
        />
      </View>

      {/* Category Distribution */}
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>By Category</Text>
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
          <CategoryBar
            key={cat}
            category={cat}
            count={stats.byCategory[cat]}
            total={stats.total}
            colors={colors}
          />
        ))}
      </View>

      {/* Recently Completed */}
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
          recentlyCompleted.map((todo) => (
            <View key={todo.id} style={[styles.completedItem, { borderBottomColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
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
            </View>
          ))
        )}
      </View>

      {/* Summary Numbers */}
      {stats.total > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.accent + '14' }]}>
            <Ionicons name="trending-up-outline" size={20} color={colors.accent} />
            <Text style={[styles.summaryValue, { color: colors.accent }]}>{stats.completionRate}%</Text>
            <Text style={[styles.summaryLabel, { color: colors.accent }]}>Completion</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.warning + '14' }]}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{stats.active}</Text>
            <Text style={[styles.summaryLabel, { color: colors.warning }]}>Pending</Text>
          </View>
          {stats.overdue > 0 && (
            <View style={[styles.summaryCard, { backgroundColor: colors.priorityHigh + '14' }]}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.priorityHigh} />
              <Text style={[styles.summaryValue, { color: colors.priorityHigh }]}>{stats.overdue}</Text>
              <Text style={[styles.summaryLabel, { color: colors.priorityHigh }]}>Overdue</Text>
            </View>
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
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
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  ringStats: {
    flex: 1,
  },
  ringStatBig: {
    fontSize: 36,
    fontWeight: '800',
  },
  ringStatLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  todayBadge: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statRowLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statRowValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 100,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryBarWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  categoryBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyRecentText: {
    fontSize: 14,
    marginTop: 8,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  completedContent: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  completedDate: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
