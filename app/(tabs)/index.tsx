import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useTodos, type Todo } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function AnimatedProgressBar({ percentage, color, bgColor }: { percentage: number; color: string; bgColor: string }) {
  const widthAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.spring(widthAnim, {
      toValue: percentage,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  return (
    <View style={[styles.progressBar, { backgroundColor: bgColor }]}>
      <RNAnimated.View
        style={[
          styles.progressFill,
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

function QuickStatCard({
  label,
  value,
  icon,
  color,
  bgColor,
  index,
  colors,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  index: number;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 80).springify()} style={styles.statCardWrap}>
      <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <View style={[styles.statIconWrap, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.secondaryText }]}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function ReminderBanner({
  count,
  onPress,
  colors,
}: {
  count: number;
  onPress: () => void;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Animated.View entering={FadeInDown.delay(50).springify()}>
      <Pressable
        onPress={onPress}
        style={[styles.reminderBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning + '40' }]}
      >
        <View style={[styles.reminderIconWrap, { backgroundColor: colors.warning + '30' }]}>
          <Ionicons name="notifications" size={18} color={colors.warning} />
        </View>
        <View style={styles.reminderContent}>
          <Text style={[styles.reminderTitle, { color: colors.text }]}>
            {count} Reminder{count > 1 ? 's' : ''}
          </Text>
          <Text style={[styles.reminderSubtext, { color: colors.secondaryText }]}>
            You have pending reminders
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.warning} />
      </Pressable>
    </Animated.View>
  );
}

function TaskItem({
  todo,
  colors,
  index,
  onToggle,
  onFavorite,
}: {
  todo: Todo;
  colors: (typeof Colors)['light'];
  index: number;
  onToggle: () => void;
  onFavorite: () => void;
}) {
  const priorityColors: Record<string, string> = {
    urgent: colors.priorityUrgent,
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
    none: colors.priorityNone,
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';
  const pColor = priorityColors[todo.priority] || colors.secondaryText;

  return (
    <Animated.View entering={SlideInRight.delay(200 + index * 60).springify()}>
      <Pressable
        onPress={onToggle}
        style={[styles.taskCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
      >
        {/* Priority indicator bar */}
        <View style={[styles.taskPriorityBar, { backgroundColor: pColor }]} />

        <View style={styles.taskBody}>
          <Pressable onPress={onToggle} hitSlop={8} style={styles.checkbox}>
            <Ionicons
              name={todo.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={todo.status === 'completed' ? colors.success : colors.border}
            />
          </Pressable>
          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                { color: colors.text },
                todo.status === 'completed' && styles.taskTitleDone,
                todo.status === 'completed' && { color: colors.secondaryText },
              ]}
              numberOfLines={1}
            >
              {todo.title}
            </Text>
            <View style={styles.taskMetaRow}>
              <View style={[styles.taskCategoryChip, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.taskCategoryText, { color: colors.accent }]}>{todo.category}</Text>
              </View>
              {todo.dueDate && (
                <View style={styles.taskDueWrap}>
                  <Ionicons
                    name="time-outline"
                    size={11}
                    color={isOverdue ? colors.destructive : colors.secondaryText}
                  />
                  <Text style={[styles.taskDueText, { color: isOverdue ? colors.destructive : colors.secondaryText }]}>
                    {new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              )}
              {todo.subtasks.length > 0 && (
                <View style={styles.taskDueWrap}>
                  <Ionicons name="list-outline" size={11} color={colors.secondaryText} />
                  <Text style={[styles.taskDueText, { color: colors.secondaryText }]}>
                    {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Pressable onPress={onFavorite} hitSlop={8}>
            <Ionicons
              name={todo.favorite ? 'star' : 'star-outline'}
              size={20}
              color={todo.favorite ? colors.favorite : colors.border}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todos, stats, toggleComplete, toggleFavorite, pendingReminders, dismissReminder } = useTodos();

  const activeTodos = todos
    .filter((t) => t.status !== 'archived' && t.status !== 'completed')
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const handleReminderPress = () => {
    if (pendingReminders.length > 0) {
      const r = pendingReminders[0];
      Alert.alert(
        'Reminder',
        `${r.title}\n${r.description || ''}`,
        [
          { text: 'Dismiss', onPress: () => dismissReminder(r.id) },
          { text: 'View Tasks', onPress: () => router.push('/(tabs)/tasks') },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.secondaryText }]}>{getGreeting()}</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Your Tasks</Text>
        </View>
        <Pressable
          onPress={() => router.push('/add')}
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
      </Animated.View>

      {/* Reminders */}
      {pendingReminders.length > 0 && (
        <ReminderBanner count={pendingReminders.length} onPress={handleReminderPress} colors={colors} />
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <QuickStatCard
          label="Total"
          value={stats.total}
          icon="layers-outline"
          color={colors.accent}
          bgColor={colors.accentLight}
          index={0}
          colors={colors}
        />
        <QuickStatCard
          label="Active"
          value={stats.active}
          icon="flash-outline"
          color={colors.warning}
          bgColor={colors.warningLight}
          index={1}
          colors={colors}
        />
        <QuickStatCard
          label="Done"
          value={stats.completed}
          icon="checkmark-done-outline"
          color={colors.success}
          bgColor={colors.successLight}
          index={2}
          colors={colors}
        />
      </View>

      {/* Progress Card */}
      {stats.total > 0 && (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={[styles.progressCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressTitle, { color: colors.text }]}>Progress</Text>
                <Text style={[styles.progressSubtext, { color: colors.secondaryText }]}>
                  {stats.completed} of {stats.total} tasks completed
                </Text>
              </View>
              <View style={[styles.percentBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.percentText, { color: colors.accent }]}>{stats.completionRate}%</Text>
              </View>
            </View>
            <AnimatedProgressBar percentage={stats.completionRate} color={colors.accent} bgColor={colors.border} />

            {/* Mini row: overdue + due today + favorites */}
            <View style={styles.miniStatsRow}>
              {stats.overdue > 0 && (
                <View style={[styles.miniStat, { backgroundColor: colors.destructiveLight }]}>
                  <Ionicons name="alert-circle" size={13} color={colors.destructive} />
                  <Text style={[styles.miniStatText, { color: colors.destructive }]}>
                    {stats.overdue} overdue
                  </Text>
                </View>
              )}
              {stats.dueToday > 0 && (
                <View style={[styles.miniStat, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="today" size={13} color={colors.warning} />
                  <Text style={[styles.miniStatText, { color: colors.warning }]}>
                    {stats.dueToday} due today
                  </Text>
                </View>
              )}
              {stats.favorites > 0 && (
                <View style={[styles.miniStat, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="star" size={13} color={colors.favorite} />
                  <Text style={[styles.miniStatText, { color: colors.accent }]}>
                    {stats.favorites} starred
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      )}

      {/* Recent / Starred Tasks */}
      <Animated.View entering={FadeInRight.delay(400)}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Up Next</Text>
          {todos.length > 5 && (
            <Pressable onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      {activeTodos.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={[styles.emptyState, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="clipboard-outline" size={36} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All clear!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              No pending tasks. Tap + to create one.
            </Text>
          </View>
        </Animated.View>
      ) : (
        activeTodos.map((todo, idx) => (
          <TaskItem
            key={todo.id}
            todo={todo}
            colors={colors}
            index={idx}
            onToggle={() => toggleComplete(todo.id)}
            onFavorite={() => toggleFavorite(todo.id)}
          />
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 14, fontWeight: '500', letterSpacing: 0.3, marginBottom: 4 },
  heroTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8820C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 14, fontWeight: '700' },
  reminderSubtext: { fontSize: 12, marginTop: 1 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCardWrap: { flex: 1 },
  statCard: {
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  progressCard: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: { fontSize: 17, fontWeight: '700' },
  progressSubtext: { fontSize: 13, marginTop: 3 },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  percentText: { fontSize: 16, fontWeight: '800' },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  miniStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  miniStatText: { fontSize: 12, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  taskCard: {
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  taskPriorityBar: { height: 3, width: '100%' },
  taskBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  checkbox: {},
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  taskTitleDone: { textDecorationLine: 'line-through' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  taskCategoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskCategoryText: { fontSize: 11, fontWeight: '600' },
  taskDueWrap: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  taskDueText: { fontSize: 11, fontWeight: '500' },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptySubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
