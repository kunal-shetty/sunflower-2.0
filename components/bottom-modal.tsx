import { Colors } from '@/constants/theme';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export function BottomModal({ visible, onClose, children, title }: BottomModalProps) {
    // FORCE LIGHT MODE
    const colors = Colors.light;
    const insets = useSafeAreaInsets();

    const translateY = useSharedValue(1000);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            backdropOpacity.value = withTiming(1, { duration: 250 });
            translateY.value = withSpring(0, {
                damping: 30,
                stiffness: 300,
            });
        } else {
            backdropOpacity.value = withTiming(0, { duration: 200 });
            translateY.value = withTiming(1000, { duration: 250 });
        }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const modalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
            statusBarTranslucent
        >
            <View style={styles.container}>
                <Animated.View style={[styles.backdrop, backdropStyle]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.modal,
                        {
                            backgroundColor: colors.surface,
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                        modalStyle,
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Title */}
                    {title && (
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                        </View>
                    )}

                    {/* Content */}
                    <View style={styles.content}>{children}</View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: 20,
    },
});
