import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
  Animated as RNAnimated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, Layout, FadeInDown, SlideInRight, ZoomIn } from 'react-native-reanimated';
import {
  useTodos,
  type Todo,
  type Priority,
  type Category,
  type TaskStatus,
  CATEGORIES,
} from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

type FilterTab = 'all' | 'active' | 'completed' | 'favorites' | 'archived';
type SortBy = 'newest' | 'priority' | 'dueDate' | 'category';

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

function FilterChip({
  label,
  active,
  onPress,
  count,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
  colors: (typeof Colors)['light'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.secondaryText }]}>
        {label}
        {count !== undefined && count > 0 ? ` (${count})` : ''}
      </Text>
    </Pressable>
  );
}

function SwipeableTaskCard({
  todo,
  colors,
  onToggle,
  onDelete,
  onArchive,
  onFavorite,
  index,
}: {
  todo: Todo;
  colors: (typeof Colors)['light'];
  onToggle: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onFavorite: () => void;
  index: number;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const [swiping, setSwiping] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: () => setSwiping(true),
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        setSwiping(false);
        if (gs.dx < -SWIPE_THRESHOLD) {
          // Swipe left -> delete
          RNAnimated.spring(translateX, { toValue: -SCREEN_WIDTH, useNativeDriver: true, friction: 8 }).start(() => {
            Alert.alert('Delete Task', `Delete "${todo.title}"?`, [
              {
                text: 'Cancel',
                onPress: () => {
                  RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
                },
              },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ]);
          });
        } else if (gs.dx > SWIPE_THRESHOLD) {
          // Swipe right -> archive
          RNAnimated.spring(translateX, { toValue: SCREEN_WIDTH, useNativeDriver: true, friction: 8 }).start(() => {
            onArchive();
            translateX.setValue(0);
          });
        } else {
          RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        setSwiping(false);
        RNAnimated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  const priorityColors: Record<Priority, string> = {
    urgent: colors.priorityUrgent,
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
    none: colors.priorityNone,
  };

  const priorityLabels: Record<Priority, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'None',
  };

  const pColor = priorityColors[todo.priority];
  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate && dueDate < today && todo.status !== 'completed';
  const isCompleted = todo.status === 'completed';
  const isArchived = todo.status === 'archived';

  const subtaskProgress = todo.subtasks.length > 0
    ? `${todo.subtasks.filter((s) => s.completed).length}/${todo.subtasks.length}`
    : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify()}
      layout={Layout.springify()}
    >
      {/* Background actions */}
      <View style={styles.swipeBackground}>
        <View style={[styles.swipeActionLeft, { backgroundColor: colors.archived + '30' }]}>
          <Ionicons name="archive-outline" size={22} color={colors.archived} />
          <Text style={[styles.swipeActionText, { color: colors.archived }]}>Archive</Text>
        </View>
        <View style={[styles.swipeActionRight, { backgroundColor: colors.destructive + '18' }]}>
          <Ionicons name="trash-outline" size={22} color={colors.destructive} />
          <Text style={[styles.swipeActionText, { color: colors.destructive }]}>Delete</Text>
        </View>
      </View>

      <RNAnimated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.cardShadow,
            borderLeftColor: pColor,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.cardMain}>
          {/* Checkbox */}
          <Pressable onPress={onToggle} hitSlop={8}>
            <View
              style={[
                styles.checkboxOuter,
                {
                  borderColor: isCompleted ? colors.success : colors.border,
                  backgroundColor: isCompleted ? colors.success : 'transparent',
                },
              ]}
            >
              {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </Pressable>

          {/* Content */}
          <View style={styles.cardContent}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text },
                  isCompleted && { textDecorationLine: 'line-through', color: colors.secondaryText },
                ]}
                numberOfLines={2}
              >
                {todo.title}
              </Text>
              {todo.favorite && (
                <Ionicons name="star" size={14} color={colors.favorite} style={{ marginLeft: 4 }} />
              )}
            </View>

            {todo.description ? (
              <Text style={[styles.cardDesc, { color: colors.secondaryText }]} numberOfLines={1}>
                {todo.description}
              </Text>
            ) : null}

            {/* Tags row */}
            <View style={styles.cardMeta}>
              {/* Priority badge */}
              <View style={[styles.badge, { backgroundColor: pColor + '18' }]}>
                <View style={[styles.badgeDot, { backgroundColor: pColor }]} />
                <Text style={[styles.badgeText, { color: pColor }]}>{priorityLabels[todo.priority]}</Text>
              </View>

              {/* Category badge */}
              <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.badgeText, { color: colors.accent }]}>{todo.category}</Text>
              </View>

              {/* Due date */}
              {dueDate && (
                <View style={[styles.badge, { backgroundColor: isOverdue ? colors.destructiveLight : colors.borderLight }]}>
                  <Ionicons name="calendar-outline" size={10} color={isOverdue ? colors.destructive : colors.secondaryText} />
                  <Text style={[styles.badgeText, { color: isOverdue ? colors.destructive : colors.secondaryText }]}>
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              )}

              {/* Duration */}
              {todo.duration && (
                <View style={[styles.badge, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="timer-outline" size={10} color={colors.info} />
                  <Text style={[styles.badgeText, { color: colors.info }]}>{todo.duration}</Text>
                </View>
              )}

              {/* Subtasks */}
              {subtaskProgress && (
                <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="list-outline" size={10} color={colors.success} />
                  <Text style={[styles.badgeText, { color: colors.success }]}>{subtaskProgress}</Text>
                </View>
              )}

              {/* Recurrence */}
              {todo.recurrence !== 'None' && (
                <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="repeat-outline" size={10} color={colors.warning} />
                  <Text style={[styles.badgeText, { color: colors.warning }]}>{todo.recurrence}</Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {todo.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {todo.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.secondaryText }]}>#{tag}</Text>
                  </View>
                ))}
                {todo.tags.length > 3 && (
                  <Text style={[styles.moreTagsText, { color: colors.secondaryText }]}>+{todo.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            <Pressable onPress={onFavorite} hitSlop={8}>
              <Ionicons
                name={todo.favorite ? 'star' : 'star-outline'}
                size={20}
                color={todo.favorite ? colors.favorite : colors.border}
              />
            </Pressable>
          </View>
        </View>
      </RNAnimated.View>
    </Animated.View>
  );
}

export default function TasksScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    todos,
    toggleComplete,
    deleteTodo,
    archiveTodo,
    unarchiveTodo,
    toggleFavorite,
    getFilteredTodos,
    stats,
  } = useTodos();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTodos = getFilteredTodos(filter);

  const sortedTodos = useCallback(() => {
    let result = [...filteredTodos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'priority':
        result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
        break;
      case 'dueDate':
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [filteredTodos, searchQuery, sortBy])();

  const sortOptions: { key: SortBy; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'newest', label: 'Newest', icon: 'time-outline' },
    { key: 'priority', label: 'Priority', icon: 'flag-outline' },
    { key: 'dueDate', label: 'Due Date', icon: 'calendar-outline' },
    { key: 'category', label: 'Category', icon: 'folder-outline' },
  ];

  const cycleSortBy = () => {
    const idx = sortOptions.findIndex((s) => s.key === sortBy);
    setSortBy(sortOptions[(idx + 1) % sortOptions.length].key);
  };

  const currentSort = sortOptions.find((s) => s.key === sortBy)!;

  const renderItem = ({ item, index }: { item: Todo; index: number }) => (
    <SwipeableTaskCard
      todo={item}
      colors={colors}
      index={index}
      onToggle={() => toggleComplete(item.id)}
      onDelete={() => deleteTodo(item.id)}
      onArchive={() => {
        if (item.status === 'archived') {
          unarchiveTodo(item.id);
        } else {
          archiveTodo(item.id);
        }
      }}
      onFavorite={() => toggleFavorite(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={cycleSortBy}
            style={[styles.sortBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name={currentSort.icon} size={15} color={colors.accent} />
            <Text style={[styles.sortText, { color: colors.accent }]}>{currentSort.label}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/add')}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks, tags..."
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <Animated.View entering={FadeInDown.delay(100)}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          data={[
            { key: 'all' as FilterTab, label: 'All', count: stats.total },
            { key: 'active' as FilterTab, label: 'Active', count: stats.active },
            { key: 'completed' as FilterTab, label: 'Done', count: stats.completed },
            { key: 'favorites' as FilterTab, label: 'Starred', count: stats.favorites },
            { key: 'archived' as FilterTab, label: 'Archived', count: stats.archived },
          ]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              active={filter === item.key}
              onPress={() => setFilter(item.key)}
              count={item.count}
              colors={colors}
            />
          )}
        />
      </Animated.View>

      {/* Task List */}
      <FlatList
        data={sortedTodos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.emptyWrap}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.accentLight }]}>
              <Ionicons
                name={
                  filter === 'completed'
                    ? 'checkmark-done-outline'
                    : filter === 'favorites'
                    ? 'star-outline'
                    : filter === 'archived'
                    ? 'archive-outline'
                    : 'clipboard-outline'
                }
                size={36}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'completed'
                ? 'No completed tasks'
                : filter === 'active'
                ? 'All caught up!'
                : filter === 'favorites'
                ? 'No starred tasks'
                : filter === 'archived'
                ? 'Archive is empty'
                : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              {filter === 'all'
                ? 'Add a task to get started'
                : filter === 'archived'
                ? 'Swipe right on a task to archive it'
                : 'Try a different filter'}
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortText: { fontSize: 13, fontWeight: '600' },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E8820C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  chipRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  swipeBackground: {
    position: 'absolute',
    top: 0,
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeActionLeft: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  swipeActionRight: {
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  swipeActionText: { fontSize: 11, fontWeight: '600' },
  card: {
    borderRadius: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  cardContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', lineHeight: 21, flex: 1 },
  cardDesc: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 10, fontWeight: '500' },
  moreTagsText: { fontSize: 10, fontWeight: '500', alignSelf: 'center' },
  cardActions: {
    paddingTop: 2,
    gap: 12,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
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
