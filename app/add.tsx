import { Colors } from '@/constants/theme';
import {
  CATEGORIES,
  useTodos,
  type Category,
  type Priority,
  type Recurrence,
} from '@/context/todo-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

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

function SectionHeader({ title, delay = 0 }: { title: string; delay?: number }) {
  // FORCE LIGHT MODE
  const colors = Colors.light;
  return (
    <Animated.View entering={FadeInDown.delay(delay)}>
      <Text style={[styles.sectionLabel, { color: colors.text }]}>{title}</Text>
    </Animated.View>
  );
}

export default function AddTask() {
  // FORCE LIGHT MODE
  const colors = Colors.light;
  const router = useRouter();
  const { addTodo, updateTodo, todos } = useTodos();
  const params = useLocalSearchParams<{ editId?: string }>();
  const editingTask = params.editId ? todos.find((t) => t.id === params.editId) : null;
  const isEditing = !!editingTask;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [dueTime, setDueTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [duration, setDuration] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('None');
  const [notes, setNotes] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [category, setCategory] = useState<Category>('Personal');

  // Populate fields when editing
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate ? new Date(editingTask.dueDate) : null);
      setDueTime(editingTask.dueTime ? new Date(editingTask.dueTime) : null);
      setDuration(editingTask.duration || '');
      setRecurrence(editingTask.recurrence);
      setNotes(editingTask.notes);
      setFavorite(editingTask.favorite);
      setCategory(editingTask.category);
    }
  }, [editingTask?.id]);

  const priorityColors: Record<Priority, string> = {
    urgent: colors.priorityUrgent,
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
    none: colors.priorityNone,
  };

  async function scheduleReminders(taskTitle: string, deadlineDate: Date) {
    if (Platform.OS === 'web') return false;
    try {
      // Request permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Please enable notifications to receive task reminders.');
          return;
        }
      }

      const now = new Date();

      // Schedule 1 hour before reminder
      const oneHourBefore = new Date(deadlineDate.getTime() - 60 * 60 * 1000);
      if (oneHourBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏰ Task Due in 1 Hour',
            body: `"${taskTitle}" is due in 1 hour!`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: oneHourBefore,
            channelId: 'task-reminders',
          },
        });
      }

      // Schedule 30 minutes before reminder
      const thirtyMinBefore = new Date(deadlineDate.getTime() - 30 * 60 * 1000);
      if (thirtyMinBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Task Due in 30 Minutes',
            body: `"${taskTitle}" is due soon! Time to wrap up.`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: thirtyMinBefore,
            channelId: 'task-reminders',
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      return false;
    }
  }

  const handleSave = async () => {

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    let deadlineDate: Date | null = null;

    if (dueDate && dueTime) {
      const combined = new Date(dueDate);
      combined.setHours(dueTime.getHours());
      combined.setMinutes(dueTime.getMinutes());
      combined.setSeconds(0);
      deadlineDate = combined;
    }

    if (isEditing && editingTask) {
      updateTodo(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate: dueDate?.toISOString(),
        dueTime: dueTime?.toISOString(),
        duration: duration || undefined,
        tags: editingTask.tags, // preserve existing tags
        reminder: deadlineDate ? new Date(deadlineDate.getTime() - 30 * 60 * 1000).toISOString() : undefined,
        recurrence,
        notes: notes.trim(),
        favorite,
      });

      router.back();
      return;
    }

    addTodo({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate?.toISOString(),
      dueTime: dueTime?.toISOString(),
      duration: duration || undefined,
      tags: [],
      reminder: deadlineDate ? new Date(deadlineDate.getTime() - 30 * 60 * 1000).toISOString() : undefined,
      recurrence,
      subtasks: [],
      notes: notes.trim(),
      favorite,
    });

    // Schedule push notifications (1hr + 30min before deadline)
    if (deadlineDate && deadlineDate > new Date()) {
      const scheduled = await scheduleReminders(title.trim(), deadlineDate);
      if (scheduled) {
        Alert.alert(
          '✅ Task Created',
          `Reminders set for 1 hour and 30 minutes before deadline.`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: isEditing ? 'Edit Task' : 'New Task' }} />
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
                autoFocus={!isEditing}
                returnKeyType="next"
              />
            </View>
            <Pressable
              onPress={() => setFavorite(!favorite)}
              style={[styles.favoriteBtn, { backgroundColor: favorite ? colors.accentLight : colors.surface, borderColor: favorite ? colors.favorite : colors.border }]}
            >
              <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.favorite : colors.secondaryText} />
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

        <View style={styles.row}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.input,
              styles.pickerInput,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.secondaryText} />
            <Text style={{ color: dueDate ? colors.text : colors.secondaryText }}>
              {dueDate ? dueDate.toDateString() : 'Select Date'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={[
              styles.input,
              styles.pickerInput,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="time-outline" size={18} color={colors.secondaryText} />
            <Text style={{ color: dueTime ? colors.text : colors.secondaryText }}>
              {dueTime
                ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Select Time'}
            </Text>
          </Pressable>
        </View>


        {showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={dueTime ?? new Date()}
            mode="time"
            display={Platform.OS === 'android' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (event.type === 'set' && selectedTime) {
                setDueTime(selectedTime);
              }
            }}
          />
        )}


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

        {/* Notes */}
        <SectionHeader title="Notes" delay={440} />
        <Animated.View entering={FadeInDown.delay(470).springify()}>
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

        {/* Save Button */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Pressable
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
          >
            <Ionicons name={isEditing ? 'save' : 'checkmark-circle'} size={22} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Create Task'}</Text>
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
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
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
