import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const colors = Colors.light;

    const iconScale = useSharedValue(0.3);
    const iconOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(20);
    const subtitleOpacity = useSharedValue(0);

    useEffect(() => {
        // Icon entrance
        iconOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
        iconScale.value = withSequence(
            withTiming(1.15, { duration: 500, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 300, easing: Easing.inOut(Easing.cubic) })
        );

        // Title entrance
        textOpacity.value = withDelay(350, withTiming(1, { duration: 400 }));
        textTranslateY.value = withDelay(350, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));

        // Subtitle entrance
        subtitleOpacity.value = withDelay(550, withTiming(1, { duration: 400 }));

        // Finish after animation
        const timer = setTimeout(() => {
            onFinish();
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }],
        opacity: iconOpacity.value,
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }));

    return (
        <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(400)}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            {/* Decorative circles */}
            <View style={[styles.circle, styles.circleTopRight, { backgroundColor: colors.accent + '12' }]} />
            <View style={[styles.circle, styles.circleBottomLeft, { backgroundColor: colors.accent + '08' }]} />

            <View style={styles.content}>
                {/* App icon */}
                <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
                        <Ionicons name="checkbox" size={48} color="#FFFFFF" />
                    </View>
                </Animated.View>

                {/* App name */}
                <Animated.View style={textAnimatedStyle}>
                    <Text style={[styles.title, { color: colors.text }]}>Sunflower 2.0</Text>
                </Animated.View>

                {/* Tagline */}
                <Animated.View style={subtitleAnimatedStyle}>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                        Organize your day, effortlessly.
                    </Text>
                </Animated.View>
            </View>

            {/* Bottom accent bar */}
            <Animated.View style={[styles.bottomBar, { backgroundColor: colors.accent }, subtitleAnimatedStyle]} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    content: {
        alignItems: 'center',
        gap: 16,
    },
    circle: {
        position: 'absolute',
        borderRadius: 999,
    },
    circleTopRight: {
        width: width * 0.8,
        height: width * 0.8,
        top: -width * 0.3,
        right: -width * 0.3,
    },
    circleBottomLeft: {
        width: width * 0.6,
        height: width * 0.6,
        bottom: -width * 0.2,
        left: -width * 0.2,
    },
    iconContainer: {
        marginBottom: 8,
    },
    iconWrap: {
        width: 100,
        height: 100,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8820C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 12,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: 60,
        height: 4,
        borderRadius: 2,
        marginBottom: 40,
    },
});
