import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const USERNAME_KEY = '@user_name';

export default function OnboardingScreen() {
    const colors = Colors.light;
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [name, setName] = useState('');

    const handleContinue = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            Alert.alert('Enter Your Name', 'Please enter your name to continue.');
            return;
        }
        await AsyncStorage.setItem(USERNAME_KEY, trimmed);
        router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
                {/* Icon */}
                <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
                        <Ionicons name="checkbox" size={48} color={colors.accent} />
                    </View>
                </Animated.View>

                {/* Title */}
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <Text style={[styles.title, { color: colors.text }]}>Welcome to</Text>
                    <Text style={[styles.appName, { color: colors.accent }]}>TodoApp</Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.View entering={FadeInUp.delay(350).springify()}>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        Organize your tasks, set reminders, and stay productive.
                    </Text>
                </Animated.View>

                {/* Name Input */}
                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.inputSection}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>What should we call you?</Text>
                    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="person-outline" size={20} color={colors.secondaryText} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Enter your name"
                            placeholderTextColor={colors.secondaryText}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleContinue}
                            maxLength={30}
                        />
                    </View>
                </Animated.View>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Features preview */}
                <Animated.View entering={FadeInDown.delay(650).springify()} style={styles.features}>
                    {[
                        { icon: 'notifications-outline' as const, text: 'Smart Reminders' },
                        { icon: 'heart-outline' as const, text: 'Favorite Tasks' },
                        { icon: 'swap-horizontal' as const, text: 'Swipe Actions' },
                    ].map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                            <View style={[styles.featureIcon, { backgroundColor: colors.accentLight }]}>
                                <Ionicons name={f.icon} size={16} color={colors.accent} />
                            </View>
                            <Text style={[styles.featureText, { color: colors.secondaryText }]}>{f.text}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Continue Button */}
                <Animated.View entering={FadeInUp.delay(800).springify()}>
                    <Pressable
                        onPress={handleContinue}
                        style={[styles.continueBtn, { backgroundColor: colors.accent }]}
                    >
                        <Text style={styles.continueBtnText}>Get Started</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </Pressable>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        paddingHorizontal: 32,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    appName: {
        fontSize: 42,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: -1,
        marginTop: 2,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    inputSection: {
        marginTop: 40,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 17,
        fontWeight: '500',
        padding: 0,
    },
    features: {
        gap: 12,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 14,
        fontWeight: '600',
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#E8820C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueBtnText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
