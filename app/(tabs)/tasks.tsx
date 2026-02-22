import { BottomModal } from '@/components/bottom-modal';
import { Colors } from '@/constants/theme';
import {
  useTodos,
  type Priority,
  type Todo,
} from '@/context/todo-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  PanResponder,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 90;

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

// Swipeable task card with archive (left) and delete (right) gestures
function SwipeableTaskCard({
  todo,
  colors,
  onToggle,
  onLongPress,
  onArchive,
  onDelete,
  onFavorite,
  index,
}: {
  todo: Todo;
  colors: (typeof Colors)['light'];
  onToggle: () => void;
  onLongPress: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  index: number;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const scaleAnim = useRef(new RNAnimated.Value(1)).current;

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

  const subtaskProgress = todo.subtasks.length > 0
    ? `${todo.subtasks.filter((s) => s.completed).length}/${todo.subtasks.length}`
    : null;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderGrant: () => {
        RNAnimated.spring(scaleAnim, {
          toValue: 0.97,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        RNAnimated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }).start();

        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped left → Archive
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          RNAnimated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onArchive();
            translateX.setValue(0);
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swiped right → Delete (confirm first, then animate)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          // Spring back first, then show confirm
          RNAnimated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
          onDelete();
        } else {
          RNAnimated.spring(translateX, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };

  // Background indicators for swipe actions
  const archiveOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD * 1.5, -SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const deleteOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD * 1.5],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={styles.swipeContainer}>
        {/* Archive indicator (left swipe → shows on right side) */}
        <RNAnimated.View
          style={[
            styles.swipeAction,
            styles.swipeActionRight,
            { backgroundColor: '#F59E0B', opacity: archiveOpacity },
          ]}
        >
          <Ionicons name="archive" size={24} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Archive</Text>
        </RNAnimated.View>

        {/* Delete indicator (right swipe → shows on left side) */}
        <RNAnimated.View
          style={[
            styles.swipeAction,
            styles.swipeActionLeft,
            { backgroundColor: colors.destructive, opacity: deleteOpacity },
          ]}
        >
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </RNAnimated.View>

        <RNAnimated.View
          style={{
            transform: [{ translateX }, { scale: scaleAnim }],
          }}
          {...panResponder.panHandlers}
        >
          <Pressable
            onLongPress={handleLongPress}
            delayLongPress={300}
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceCard,
                shadowColor: colors.cardShadow,
                borderLeftColor: pColor,
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
                </View>

                {todo.description ? (
                  <Text style={[styles.cardDesc, { color: colors.secondaryText }]} numberOfLines={1}>
                    {todo.description}
                  </Text>
                ) : null}

                {/* Badges row */}
                <View style={styles.cardMeta}>
                  <View style={[styles.badge, { backgroundColor: pColor + '18' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: pColor }]} />
                    <Text style={[styles.badgeText, { color: pColor }]}>{priorityLabels[todo.priority]}</Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[styles.badgeText, { color: colors.accent }]}>{todo.category}</Text>
                  </View>

                  {dueDate && (
                    <View style={[styles.badge, { backgroundColor: isOverdue ? colors.destructiveLight : colors.borderLight }]}>
                      <Ionicons name="calendar-outline" size={10} color={isOverdue ? colors.destructive : colors.secondaryText} />
                      <Text style={[styles.badgeText, { color: isOverdue ? colors.destructive : colors.secondaryText }]}>
                        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                  )}

                  {todo.duration && (
                    <View style={[styles.badge, { backgroundColor: colors.infoLight }]}>
                      <Ionicons name="timer-outline" size={10} color={colors.info} />
                      <Text style={[styles.badgeText, { color: colors.info }]}>{todo.duration}</Text>
                    </View>
                  )}

                  {subtaskProgress && (
                    <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                      <Ionicons name="list-outline" size={10} color={colors.success} />
                      <Text style={[styles.badgeText, { color: colors.success }]}>{subtaskProgress}</Text>
                    </View>
                  )}

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

              {/* Favorite Heart Icon */}
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onFavorite();
                  }}
                  hitSlop={8}
                  style={[styles.favoriteIcon, { backgroundColor: todo.favorite ? colors.favoriteLight : 'transparent' }]}
                >
                  <Ionicons
                    name={todo.favorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={todo.favorite ? colors.favorite : colors.border}
                  />
                </Pressable>
              </View>
            </View>
          </Pressable>
        </RNAnimated.View>
      </View>
    </Animated.View>
  );
}

export default function TasksScreen() {
  // FORCE LIGHT MODE
  const colors = Colors.light;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [showHint, setShowHint] = useState(true);

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

  const handleTaskLongPress = (task: Todo) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleEdit = () => {
    if (selectedTask) {
      handleCloseModal();
      router.push({ pathname: '/add', params: { editId: selectedTask.id } });
    }
  };

  const handleToggleFavorite = () => {
    if (selectedTask) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleFavorite(selectedTask.id);
    }
    handleCloseModal();
  };

  const handleArchive = () => {
    if (selectedTask) {
      if (selectedTask.status === 'archived') {
        unarchiveTodo(selectedTask.id);
      } else {
        archiveTodo(selectedTask.id);
      }
    }
    handleCloseModal();
  };

  const handleDelete = () => {
    if (selectedTask) {
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete "${selectedTask.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteTodo(selectedTask.id);
              handleCloseModal();
            },
          },
        ]
      );
    }
  };

  const handleSwipeArchive = (task: Todo) => {
    if (task.status === 'archived') {
      unarchiveTodo(task.id);
    } else {
      archiveTodo(task.id);
    }
  };

  const handleSwipeDelete = (task: Todo) => {
    Alert.alert(
      'Delete Task',
      `Delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(task.id) },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Todo; index: number }) => (
    <SwipeableTaskCard
      todo={item}
      colors={colors}
      index={index}
      onToggle={() => toggleComplete(item.id)}
      onLongPress={() => handleTaskLongPress(item)}
      onArchive={() => handleSwipeArchive(item)}
      onDelete={() => handleSwipeDelete(item)}
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

      {/* Swipe Hint Banner */}
      {showHint && sortedTodos.length > 0 && (
        <Animated.View entering={SlideInDown.delay(400).springify()}>
          <View style={[styles.hintBanner, { backgroundColor: colors.accentLight, borderColor: colors.accent + '30' }]}>
            <View style={styles.hintContent}>
              <Ionicons name="swap-horizontal" size={16} color={colors.accent} />
              <Text style={[styles.hintText, { color: colors.accent }]}>
                Swipe left to archive · Swipe right to delete
              </Text>
            </View>
            <Pressable onPress={() => setShowHint(false)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.accent} />
            </Pressable>
          </View>
        </Animated.View>
      )}

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
            { key: 'favorites' as FilterTab, label: 'Favorites', count: stats.favorites },
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
                      ? 'heart-outline'
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
                    ? 'No favorite tasks'
                    : filter === 'archived'
                      ? 'Archive is empty'
                      : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              {filter === 'all'
                ? 'Tap + to create your first task'
                : filter === 'archived'
                  ? 'Swipe left on a task to archive it'
                  : 'Try a different filter'}
            </Text>
          </Animated.View>
        }
      />

      {/* Bottom Modal */}
      <BottomModal visible={modalVisible} onClose={handleCloseModal} title="Task Options">
        <View style={styles.modalOptions}>
          <Pressable
            style={[styles.modalOption, { borderBottomColor: colors.border }]}
            onPress={handleEdit}
          >
            <View style={[styles.modalOptionIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="create-outline" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.modalOptionText, { color: colors.text }]}>Edit Task</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} style={{ marginLeft: 'auto' }} />
          </Pressable>

          <Pressable
            style={[styles.modalOption, { borderBottomColor: colors.border }]}
            onPress={handleToggleFavorite}
          >
            <View style={[styles.modalOptionIcon, { backgroundColor: colors.favoriteLight }]}>
              <Ionicons
                name={selectedTask?.favorite ? 'heart' : 'heart-outline'}
                size={20}
                color={colors.favorite}
              />
            </View>
            <Text style={[styles.modalOptionText, { color: colors.text }]}>
              {selectedTask?.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} style={{ marginLeft: 'auto' }} />
          </Pressable>

          <Pressable
            style={[styles.modalOption, { borderBottomColor: colors.border }]}
            onPress={handleArchive}
          >
            <View style={[styles.modalOptionIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons
                name={selectedTask?.status === 'archived' ? 'archive-outline' : 'archive'}
                size={20}
                color={colors.warning}
              />
            </View>
            <Text style={[styles.modalOptionText, { color: colors.text }]}>
              {selectedTask?.status === 'archived' ? 'Unarchive' : 'Archive'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} style={{ marginLeft: 'auto' }} />
          </Pressable>

          <Pressable style={[styles.modalOption, { borderBottomColor: 'transparent' }]} onPress={handleDelete}>
            <View style={[styles.modalOptionIcon, { backgroundColor: colors.destructiveLight }]}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </View>
            <Text style={[styles.modalOptionText, { color: colors.destructive }]}>Delete Task</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.destructive} style={{ marginLeft: 'auto', opacity: 0.5 }} />
          </Pressable>
        </View>
      </BottomModal>
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
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hintText: { fontSize: 12, fontWeight: '600' },
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
  swipeContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    gap: 4,
  },
  swipeActionLeft: {
    left: 0,
    alignItems: 'flex-start',
    paddingLeft: 30,
  },
  swipeActionRight: {
    right: 0,
    alignItems: 'flex-end',
    paddingRight: 30,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
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
  cardTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22, flex: 1 },
  cardDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
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
    paddingVertical: 4,
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
  },
  favoriteIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOptions: {
    gap: 0,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
