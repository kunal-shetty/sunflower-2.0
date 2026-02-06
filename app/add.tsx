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
import { useTodos, type Priority, type Category } from '@/context/todo-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PRIORITIES: { key: Priority; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'low', label: 'Low', icon: 'arrow-down-outline' },
  { key: 'medium', label: 'Medium', icon: 'remove-outline' },
  { key: 'high', label: 'High', icon: 'arrow-up-outline' },
];

const CATEGORIES: { key: Category; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'personal', label: 'Personal', icon: 'person-outline' },
  { key: 'work', label: 'Work', icon: 'briefcase-outline' },
  { key: 'health', label: 'Health', icon: 'heart-outline' },
  { key: 'shopping', label: 'Shopping', icon: 'cart-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

export default function AddTask() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { addTodo } = useTodos();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('personal');

  const priorityColors: Record<Priority, string> = {
    high: colors.priorityHigh,
    medium: colors.priorityMedium,
    low: colors.priorityLow,
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a task title.');
      return;
    }

    addTodo({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
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
      >
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Task Title</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="What needs to be done?"
            placeholderTextColor={colors.secondaryText}
            value={title}
            onChangeText={setTitle}
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add some details..."
            placeholderTextColor={colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
          <View style={styles.optionRow}>
            {PRIORITIES.map((p) => {
              const isActive = priority === p.key;
              const pColor = priorityColors[p.key];
              return (
                <Pressable
                  key={p.key}
                  onPress={() => setPriority(p.key)}
                  style={[
                    styles.optionBtn,
                    {
                      backgroundColor: isActive ? pColor + '18' : colors.surface,
                      borderColor: isActive ? pColor : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={p.icon} size={18} color={isActive ? pColor : colors.secondaryText} />
                  <Text
                    style={[
                      styles.optionText,
                      { color: isActive ? pColor : colors.secondaryText },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const isActive = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[
                    styles.categoryBtn,
                    {
                      backgroundColor: isActive ? colors.accentLight : colors.surface,
                      borderColor: isActive ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={isActive ? colors.accent : colors.secondaryText}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isActive ? colors.accent : colors.secondaryText },
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Add Task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 14,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
