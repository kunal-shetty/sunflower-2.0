import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTodos, type Todo } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function QuickStatCard({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
    </View>
  );
}

function RecentTaskItem({
  todo,
  colors,
  onToggle,
}: {
  todo: Todo;
  colors: typeof Colors.light;
  onToggle: () => void;
}) {
  const priorityColors = {
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
  };

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.taskItem, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
    >
      <View style={[styles.priorityDot, { backgroundColor: priorityColors[todo.priority] }]} />
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            { color: colors.text },
            todo.completed && { textDecorationLine: 'line-through', color: colors.secondaryText },
          ]}
          numberOfLines={1}
        >
          {todo.title}
        </Text>
        <Text style={[styles.taskCategory, { color: colors.secondaryText }]}>
          {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
        </Text>
      </View>
      <Ionicons
        name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={todo.completed ? colors.accent : colors.border}
      />
    </Pressable>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todos, stats, toggleTodo } = useTodos();

  const recentTodos = todos.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.secondaryText }]}>{getGreeting()}</Text>
          <Text style={[styles.title, { color: colors.text }]}>Your Tasks</Text>
        </View>
        <Pressable
          onPress={() => router.push('/add')}
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <QuickStatCard label="Total" value={stats.total} icon="documents-outline" color={colors.accent} colors={colors} />
        <QuickStatCard label="Active" value={stats.active} icon="time-outline" color={colors.warning} colors={colors} />
        <QuickStatCard label="Done" value={stats.completed} icon="checkmark-done-outline" color={colors.priorityLow} colors={colors} />
      </View>

      {/* Progress */}
      {stats.total > 0 && (
        <View style={[styles.progressCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Today&apos;s Progress</Text>
            <Text style={[styles.progressPercent, { color: colors.accent }]}>{stats.completionRate}%</Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.accent, width: `${stats.completionRate}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressSubtext, { color: colors.secondaryText }]}>
            {stats.completed} of {stats.total} tasks completed
          </Text>
        </View>
      )}

      {/* Overdue Warning */}
      {stats.overdue > 0 && (
        <View style={[styles.overdueCard, { backgroundColor: colors.priorityHigh + '14' }]}>
          <Ionicons name="alert-circle" size={20} color={colors.priorityHigh} />
          <Text style={[styles.overdueText, { color: colors.priorityHigh }]}>
            {stats.overdue} overdue {stats.overdue === 1 ? 'task' : 'tasks'}
          </Text>
        </View>
      )}

      {/* Recent Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Tasks</Text>
        {todos.length > 5 && (
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
          </Pressable>
        )}
      </View>

      {recentTodos.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <Ionicons name="clipboard-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
            Tap the + button to add your first task
          </Text>
        </View>
      ) : (
        recentTodos.map((todo) => (
          <RecentTaskItem key={todo.id} todo={todo} colors={colors} onToggle={() => toggleTodo(todo.id)} />
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 13,
    marginTop: 8,
  },
  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  overdueText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    gap: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
