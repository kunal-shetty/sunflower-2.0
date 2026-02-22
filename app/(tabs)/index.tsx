import { Colors } from '@/constants/theme';
import { useTodos, type Todo } from '@/context/todo-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Motivational Quotes ──────────────────────────────────
const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'Small steps every day lead to big results.', author: 'Unknown' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: 'Chinese Proverb' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: "Believe you can and you're halfway there.", author: 'Theodore Roosevelt' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: "You miss 100% of the shots you don't take.", author: 'Wayne Gretzky' },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: 'C.S. Lewis' },
  { text: 'Dream big, start small, act now.', author: 'Robin Sharma' },
  { text: 'Progress, not perfection.', author: 'Unknown' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getQuoteOfDay() {
  // Use the day of year as seed for consistent daily quote
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function AnimatedProgressRing({
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
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={[styles.ringBg, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: bgColor }]}>
        <RNAnimated.View
          style={[
            styles.ringProgress,
            {
              width: size - strokeWidth * 2,
              height: size - strokeWidth * 2,
              borderRadius: (size - strokeWidth * 2) / 2,
            },
          ]}
        />
      </View>
      <Text style={[styles.ringText, { color, fontSize: size * 0.28, fontWeight: '800' }]}>
        {percentage}%
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  // FORCE LIGHT MODE
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todos, stats, toggleComplete, toggleFavorite } = useTodos();
  const [userName, setUserName] = useState('');

  // Load username
  useEffect(() => {
    AsyncStorage.getItem('@user_name').then((name) => {
      if (name) setUserName(name);
    });
  }, []);

  const quote = getQuoteOfDay();
  const today = new Date();

  // Get next upcoming deadline
  const nextDeadline = todos
    .filter((t) => {
      if (t.status === 'completed' || t.status === 'archived' || !t.dueDate) return false;
      return new Date(t.dueDate) >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0] || null;

  const getDeadlineLabel = (todo: Todo) => {
    const due = new Date(todo.dueDate!);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── Greeting ─────────────────────────────── */}
      <Animated.View entering={FadeInUp.duration(500)} style={styles.headerSection}>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting()}{userName ? ',' : ''}
            </Text>
            {userName ? (
              <Text style={[styles.userName, { color: colors.accent }]}>{userName}</Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push('/add')}
            style={[styles.addButton, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={[styles.dateText, { color: colors.secondaryText }]}>
          {formatDate(today)}
        </Text>
      </Animated.View>

      {/* ─── Quote of the Day ──────────────────────── */}
      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <View style={[styles.quoteCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
          <View style={[styles.quoteAccent, { backgroundColor: colors.accent }]} />
          <View style={styles.quoteContent}>
            <Text style={[styles.quoteText, { color: colors.text }]}>
              "{quote.text}"
            </Text>
            <Text style={[styles.quoteAuthor, { color: colors.secondaryText }]}>
              — {quote.author}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ─── Stats Cards ───────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(250).springify()}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
        <View style={styles.statsRow}>
          {/* Active Tasks */}
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="flash" size={20} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Active Tasks</Text>
          </View>

          {/* Completed Tasks */}
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-done" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Completed Tasks</Text>
          </View>
        </View>
      </Animated.View>

      {/* ─── Next Deadline ─────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(350).springify()}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Deadline</Text>
        {nextDeadline ? (
          <Pressable
            onPress={() => router.push('/(tabs)/tasks')}
            style={[styles.deadlineCard, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}
          >
            <View style={styles.deadlineTop}>
              <View style={[styles.deadlineBadge, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="alarm-outline" size={16} color={colors.accent} />
                <Text style={[styles.deadlineBadgeText, { color: colors.accent }]}>
                  {getDeadlineLabel(nextDeadline)}
                </Text>
              </View>
              <View style={[styles.priorityDot, {
                backgroundColor:
                  nextDeadline.priority === 'urgent' ? colors.priorityUrgent :
                    nextDeadline.priority === 'high' ? colors.priorityHigh :
                      nextDeadline.priority === 'medium' ? colors.priorityMedium :
                        nextDeadline.priority === 'low' ? colors.priorityLow :
                          colors.priorityNone,
              }]} />
            </View>

            <Text style={[styles.deadlineTitle, { color: colors.text }]} numberOfLines={2}>
              {nextDeadline.title}
            </Text>

            {nextDeadline.description ? (
              <Text style={[styles.deadlineDesc, { color: colors.secondaryText }]} numberOfLines={1}>
                {nextDeadline.description}
              </Text>
            ) : null}

            <View style={styles.deadlineFooter}>
              <View style={styles.deadlineMeta}>
                <Ionicons name="calendar-outline" size={13} color={colors.secondaryText} />
                <Text style={[styles.deadlineMetaText, { color: colors.secondaryText }]}>
                  {new Date(nextDeadline.dueDate!).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              {nextDeadline.dueTime && (
                <View style={styles.deadlineMeta}>
                  <Ionicons name="time-outline" size={13} color={colors.secondaryText} />
                  <Text style={[styles.deadlineMetaText, { color: colors.secondaryText }]}>
                    {new Date(nextDeadline.dueTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
              <View style={[styles.categoryChip, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.categoryChipText, { color: colors.accent }]}>
                  {nextDeadline.category}
                </Text>
              </View>
            </View>

            <View style={styles.deadlineArrow}>
              <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.emptyDeadline, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <View style={[styles.emptyDeadlineIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle-outline" size={32} color={colors.success} />
            </View>
            <Text style={[styles.emptyDeadlineTitle, { color: colors.text }]}>All clear!</Text>
            <Text style={[styles.emptyDeadlineSubtitle, { color: colors.secondaryText }]}>
              No upcoming deadlines. Enjoy your free time!
            </Text>
          </View>
        )}
      </Animated.View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 20 },

  // ─── Header / Greeting
  headerSection: { marginBottom: 24 },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  greeting: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  userName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  dateText: { fontSize: 14, fontWeight: '500', letterSpacing: 0.2, marginTop: 4 },
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

  // ─── Quote Card
  quoteCard: {
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteAccent: {
    width: 4,
  },
  quoteContent: {
    flex: 1,
    padding: 18,
  },
  quoteText: {
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },

  // ─── Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.2,
  },

  // ─── Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },

  // ─── Deadline Card
  deadlineCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  deadlineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  deadlineBadgeText: { fontSize: 12, fontWeight: '700' },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deadlineTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
  },
  deadlineDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  deadlineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  deadlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineMetaText: { fontSize: 12, fontWeight: '500' },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryChipText: { fontSize: 11, fontWeight: '600' },
  deadlineArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -9,
  },

  // ─── Empty Deadline
  emptyDeadline: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 18,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyDeadlineIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyDeadlineTitle: { fontSize: 18, fontWeight: '700' },
  emptyDeadlineSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 18 },

  // ─── Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: { fontSize: 14, fontWeight: '700' },

  // ─── Progress Ring (unused for now, kept for future)
  ringBg: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringText: {
    position: 'absolute',
  },
});
