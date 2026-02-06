import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  useTodos,
  type Priority,
  type Category,
  type Recurrence,
  CATEGORIES,
} from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRIORITIES: { key: Priority; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'urgent', label: 'Urgent', icon: 'flame-outline' },
  { key: 'high', label: 'High', icon: 'arrow-up-outline' },
  { key: 'medium', label: 'Medium', icon: 'remove-outline' },
  { key: 'low', label: 'Low', icon: 'arrow-down-outline' },
  { key: 'none', label: 'None', icon: 'ellipse-outline' },
];

const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Personal: 'person-outline',
  Work: 'briefcase-outline',
  Health: 'heart-outline',
  Shopping: 'cart-outline',
  Finance: 'cash-outline',
  Education: 'school-outline',
  Other: 'ellipsis-horizontal-outline',
};

const DURATIONS = ['15m', '30m', '45m', '1h', '1.5h', '2h', '3h', '4h'];
const RECURRENCES: Recurrence[] = ['None', 'Daily', 'Weekly', 'Monthly'];

function SectionHeader({ title, delay = 0 }: { title: string; delay?: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>{title}</Text>
    </Animated.View>
  );
}

export default function AddTask() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { addTodo } = useTodos();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [duration, setDuration] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [reminder, setReminder] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('None');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priorityColors: Record<Priority, string> = {
    urgent: colors.priorityUrgent,
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
    none: colors.priorityNone,
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Build reminder datetime if provided
    let reminderDate: string | undefined;
    if (reminder.trim()) {
      reminderDate = new Date(reminder.trim()).toISOString();
    } else if (dueDate && dueTime) {
      // Auto-set reminder 30 min before due
      const dt = new Date(`${dueDate}T${dueTime}`);
      dt.setMinutes(dt.getMinutes() - 30);
      reminderDate = dt.toISOString();
    }

    addTodo({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      duration: duration || undefined,
      tags,
      reminder: reminderDate,
      recurrence,
      subtasks: [],
      notes: notes.trim(),
      favorite,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title + Favorite */}
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: colors.text }]}>Task Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="What needs to be done?"
                placeholderTextColor={colors.secondaryText}
                value={title}
                onChangeText={setTitle}
                autoFocus
                returnKeyType="next"
              />
            </View>
            <Pressable
              onPress={() => setFavorite(!favorite)}
              style={[styles.favoriteBtn, { backgroundColor: favorite ? colors.accentLight : colors.surface, borderColor: favorite ? colors.favorite : colors.border }]}
            >
              <Ionicons name={favorite ? 'star' : 'star-outline'} size={22} color={favorite ? colors.favorite : colors.secondaryText} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Add details..."
            placeholderTextColor={colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Priority */}
        <SectionHeader title="Priority" delay={150} />
        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionScroll}>
            {PRIORITIES.map((p) => {
              const isActive = priority === p.key;
              const pColor = priorityColors[p.key];
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={[
                    styles.priorityBtn,
                    {
                      backgroundColor: isActive ? pColor + '18' : colors.surface,
                      borderColor: isActive ? pColor : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={p.icon} size={16} color={isActive ? pColor : colors.secondaryText} />
                  <Text style={[styles.priorityText, { color: isActive ? pColor : colors.secondaryText }]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Category */}
        <SectionHeader title="Category" delay={220} />
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor: isActive ? colors.accentLight : colors.surface,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[c]}
                    size={18}
                    color={isActive ? colors.accent : colors.secondaryText}
                  />
                  <Text style={[styles.categoryText, { color: isActive ? colors.accent : colors.secondaryText }]}>
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Due Date + Time */}
        <SectionHeader title="Due Date & Time" delay={300} />
        <Animated.View entering={FadeInDown.delay(330).springify()}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.secondaryText}
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="HH:MM"
                placeholderTextColor={colors.secondaryText}
                value={dueTime}
                onChangeText={setDueTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>
        </Animated.View>

        {/* Duration */}
        <SectionHeader title="Estimated Duration" delay={370} />
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionScroll}>
            {DURATIONS.map((d) => {
              const isActive = duration === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDuration(isActive ? '' : d)}
                  style={[
                    styles.durationBtn,
                    {
                      backgroundColor: isActive ? colors.accentLight : colors.surface,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.durationText, { color: isActive ? colors.accent : colors.secondaryText }]}>
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Tags */}
        <SectionHeader title="Tags" delay={440} />
        <Animated.View entering={FadeInDown.delay(470).springify()}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="home, shopping, urgent (comma-separated)"
            placeholderTextColor={colors.secondaryText}
            value={tagsInput}
            onChangeText={setTagsInput}
          />
          {tagsInput.length > 0 && (
            <View style={styles.tagPreview}>
              {tagsInput.split(',').filter(Boolean).map((t, i) => (
                <View key={i} style={[styles.tagChip, { backgroundColor: colors.accentLight, borderColor: colors.accent + '40' }]}>
                  <Text style={[styles.tagChipText, { color: colors.accent }]}>#{t.trim()}</Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Advanced toggle */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            style={[styles.advancedToggle, { borderColor: colors.border }]}
          >
            <Text style={[styles.advancedToggleText, { color: colors.accent }]}>
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Text>
            <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={18} color={colors.accent} />
          </Pressable>
        </Animated.View>

        {showAdvanced && (
          <>
            {/* Recurrence */}
            <SectionHeader title="Recurrence" delay={0} />
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.row}>
                {RECURRENCES.map((r) => {
                  const isActive = recurrence === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRecurrence(r)}
                      style={[
                        styles.recurrenceBtn,
                        {
                          backgroundColor: isActive ? colors.accentLight : colors.surface,
                          borderColor: isActive ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.recurrenceText, { color: isActive ? colors.accent : colors.secondaryText }]}>
                        {r}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* Reminder */}
            <SectionHeader title="Reminder" delay={0} />
            <Animated.View entering={FadeInDown.springify()}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="YYYY-MM-DD HH:MM (or leave empty for auto)"
                placeholderTextColor={colors.secondaryText}
                value={reminder}
                onChangeText={setReminder}
              />
              <Text style={[styles.helperText, { color: colors.secondaryText }]}>
                Auto-reminds 30 min before due time if left empty
              </Text>
            </Animated.View>

            {/* Notes */}
            <SectionHeader title="Notes" delay={0} />
            <Animated.View entering={FadeInDown.springify()}>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Additional notes..."
                placeholderTextColor={colors.secondaryText}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Animated.View>
          </>
        )}

        {/* Save Button */}
        <Animated.View entering={FadeInUp.delay(550).springify()}>
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Create Task</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', marginBottom: 16 },
  favoriteBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, letterSpacing: 0.2 },
  sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 16, letterSpacing: 0.2 },
  input: {
    fontSize: 15,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  textArea: { minHeight: 80, paddingTop: 14 },
  optionScroll: { gap: 8, paddingBottom: 4 },
  priorityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  priorityText: { fontSize: 13, fontWeight: '600' },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryText: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  durationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  durationText: { fontSize: 13, fontWeight: '600' },
  tagPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagChipText: { fontSize: 12, fontWeight: '600' },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  advancedToggleText: { fontSize: 14, fontWeight: '600' },
  recurrenceBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  recurrenceText: { fontSize: 13, fontWeight: '600' },
  helperText: { fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#E8820C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
