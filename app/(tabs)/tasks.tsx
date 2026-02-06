import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useTodos, type Todo, type Priority, type Category } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Filter = 'all' | 'active' | 'completed';
type SortBy = 'newest' | 'priority' | 'category';

const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  personal: 'person-outline',
  work: 'briefcase-outline',
  health: 'heart-outline',
  shopping: 'cart-outline',
  other: 'ellipsis-horizontal-outline',
};

function FilterChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
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
      </Text>
    </Pressable>
  );
}

function TaskCard({
  todo,
  colors,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  colors: typeof Colors.light;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const priorityColors: Record<Priority, string> = {
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
  };

  const priorityLabels: Record<Priority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', `Are you sure you want to delete "${todo.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !todo.completed;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={Layout.springify()}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        <Pressable onPress={onToggle} style={styles.cardRow}>
          <Ionicons
            name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={todo.completed ? colors.accent : colors.border}
          />
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                { color: colors.text },
                todo.completed && { textDecorationLine: 'line-through', color: colors.secondaryText },
              ]}
              numberOfLines={2}
            >
              {todo.title}
            </Text>
            {todo.description ? (
              <Text
                style={[styles.cardDesc, { color: colors.secondaryText }]}
                numberOfLines={1}
              >
                {todo.description}
              </Text>
            ) : null}
            <View style={styles.cardMeta}>
              <View style={[styles.badge, { backgroundColor: priorityColors[todo.priority] + '18' }]}>
                <View style={[styles.badgeDot, { backgroundColor: priorityColors[todo.priority] }]} />
                <Text style={[styles.badgeText, { color: priorityColors[todo.priority] }]}>
                  {priorityLabels[todo.priority]}
                </Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: colors.accentLight }]}>
                <Ionicons name={CATEGORY_ICONS[todo.category]} size={12} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.accent }]}>
                  {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                </Text>
              </View>
              {dueDate && (
                <View
                  style={[
                    styles.dueBadge,
                    { backgroundColor: isOverdue ? colors.priorityHigh + '18' : colors.border + '40' },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={11}
                    color={isOverdue ? colors.priorityHigh : colors.secondaryText}
                  />
                  <Text
                    style={[
                      styles.dueText,
                      { color: isOverdue ? colors.priorityHigh : colors.secondaryText },
                    ]}
                  >
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
        <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function Tasks() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { todos, toggleTodo, deleteTodo, getFilteredTodos } = useTodos();

  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTodos = getFilteredTodos(filter);

  const sortedTodos = useCallback(() => {
    let result = [...filteredTodos];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'priority': {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        result.sort((a, b) => order[a.priority] - order[b.priority]);
        break;
      }
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

  const renderItem = ({ item }: { item: Todo }) => (
    <TaskCard
      todo={item}
      colors={colors}
      onToggle={() => toggleTodo(item.id)}
      onDelete={() => deleteTodo(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              const sorts: SortBy[] = ['newest', 'priority', 'category'];
              const idx = sorts.indexOf(sortBy);
              setSortBy(sorts[(idx + 1) % sorts.length]);
            }}
            style={[styles.sortBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="swap-vertical-outline" size={16} color={colors.accent} />
            <Text style={[styles.sortText, { color: colors.accent }]}>
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/add')}
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { paddingHorizontal: 20 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
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

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} colors={colors} />
        <FilterChip
          label={`Active (${todos.filter((t) => !t.completed).length})`}
          active={filter === 'active'}
          onPress={() => setFilter('active')}
          colors={colors}
        />
        <FilterChip
          label={`Done (${todos.filter((t) => t.completed).length})`}
          active={filter === 'completed'}
          onPress={() => setFilter('completed')}
          colors={colors}
        />
      </View>

      {/* Task List */}
      <FlatList
        data={sortedTodos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name={filter === 'completed' ? 'checkmark-done-outline' : 'clipboard-outline'}
              size={48}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'completed' ? 'No completed tasks' : filter === 'active' ? 'All caught up!' : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
              {filter === 'all' ? 'Add a task to get started' : 'Change filters to see other tasks'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
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
