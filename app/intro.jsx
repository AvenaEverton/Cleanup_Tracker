import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

const PRIMARY_COLOR = '#2c3e50';
const SECONDARY_COLOR = '#3498db';
const ACCENT_COLOR = '#e74c3c';
const TEXT_COLOR_LIGHT = '#fff';
const TEXT_COLOR_DARK = '#333';
const PROGRESS_BAR_BG = '#f0f0f0';
const PROGRESS_BAR_COLOR = SECONDARY_COLOR;
const BUTTON_BG = SECONDARY_COLOR;
const BUTTON_TEXT = TEXT_COLOR_LIGHT;
const BACK_BUTTON_BG = ACCENT_COLOR;
const TEXT_OUTLINE_COLOR = '#000'; // Black outline color

export default function IntroScreen({ navigation }) {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const bgFadeAnim = useRef(new Animated.Value(1)).current;
    const [slideIndex, setSlideIndex] = useState(1);

    const playSound = async () => {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sound/click.mp3')
        );
        await sound.playAsync();
    };

    const handleNext = async () => {
        playSound();
        if (slideIndex === 3) return;

        Animated.timing(bgFadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            setSlideIndex(slideIndex + 1);
            bgFadeAnim.setValue(0);
            Animated.timing(bgFadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();
        });

        Animated.timing(progressAnim, {
            toValue: slideIndex * 33.33,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const handleBack = async () => {
        playSound();
        if (slideIndex === 1) {
            router.replace('/');
        } else {
            setSlideIndex(slideIndex - 1);

            Animated.timing(progressAnim, {
                toValue: (slideIndex - 2) * 33.33,
                duration: 500,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleProceed = async () => {
        playSound();
        router.replace('/register');
    };

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    const getImageSource = () => {
        switch (slideIndex) {
            case 1: return require('../assets/images/clean.jpg');
            case 2: return require('../assets/images/clean_2.jpg');
            case 3: return require('../assets/images/clean_3.jpg');
            default: return require('../assets/images/clean.jpg');
        }
    };

    return (
        <View style={styles.container}>
            <Animated.Image
                source={getImageSource()}
                style={[styles.fullScreenImage, { opacity: bgFadeAnim }]}
            />

            <View style={styles.overlayContainer}>
                <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
                    {/* Progress Bar at the Top */}
                    <View style={styles.progressWrapper}>
                        <Text style={[styles.progressText, styles.textWithOutline]}>{slideIndex}/3</Text>
                        <View style={styles.progressBarContainer}>
                            <Animated.View style={[styles.progressBar, {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%']
                                }),
                            }]} />
                        </View>
                    </View>

                    <Text style={[styles.title, styles.textWithOutline]}>
                        {slideIndex === 1 ? 'Understanding Waste Issues' : slideIndex === 2 ? 'Key App Features' : 'Our Commitment'}
                    </Text>

                    {slideIndex === 1 && (
                        <>
                            <Text style={[styles.description, styles.textWithOutline]}>
                                Discover the significant challenges of improper waste management in {'\n'}
                                <Text style={[styles.boldText, styles.textWithOutline]}>Bucana, Nasugbu, Batangas</Text>. Learn how this affects our community and environment.
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={handleNext}>
                                <Text style={styles.buttonText}>Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {slideIndex === 2 && (
                        <>
                            <Text style={[styles.description, styles.textWithOutline, styles.leftAlignText]}>
                                Explore the powerful features designed to empower you:{"\n\n"}
                                ✅ <Text style={[styles.highlightText, styles.textWithOutline]}>Effortlessly report environmental concerns</Text>{"\n"}
                                ✅ <Text style={[styles.highlightText, styles.textWithOutline]}>Join a community of Environmental Advocates</Text>{"\n"}
                                ✅ <Text style={[styles.highlightText, styles.textWithOutline]}>Access clear guidelines for proper waste disposal</Text>
                            </Text>
                            <TouchableOpacity style={styles.button} onPress={handleNext}>
                                <Text style={styles.buttonText}>Continue</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {slideIndex === 3 && (
                        <>
                            <Text style={[styles.description, styles.textWithOutline]}>
                                We are dedicated to fostering a {"\n"}
                                <Text style={[styles.boldText, styles.textWithOutline]}>cleaner, healthier, and more sustainable Bucana</Text> for all residents.
                            </Text>
                            <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                <Text style={styles.buttonText}>Back</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </Animated.View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fullScreenImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlayContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    contentContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 30,
        paddingBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        elevation: 5,
    },
    progressWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    progressText: {
        fontSize: 18,
        fontWeight: '600',
        color: TEXT_COLOR_LIGHT, // Set text color to white
    },
    progressBarContainer: {
        width: '70%',
        height: 10,
        backgroundColor: PROGRESS_BAR_BG,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: 10,
        backgroundColor: PROGRESS_BAR_COLOR,
        borderRadius: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: TEXT_COLOR_LIGHT, // Set text color to white
        textAlign: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 18,
        color: TEXT_COLOR_LIGHT, // Set text color to white
        textAlign: 'center',
        lineHeight: 28,
        marginBottom: 30,
    },
    boldText: {
        fontWeight: 'bold',
        color: TEXT_COLOR_LIGHT, // Set text color to white
    },
    highlightText: {
        fontWeight: 'bold',
        color: TEXT_COLOR_LIGHT, // Set text color to white
    },
    button: {
        backgroundColor: BUTTON_BG,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    proceedButton: {
        backgroundColor: '#008000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    backButton: {
        backgroundColor: BACK_BUTTON_BG,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: BUTTON_TEXT,
        fontWeight: 'bold',
        fontSize: 18,
    },
    textWithOutline: {
        textShadowColor: TEXT_OUTLINE_COLOR,
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    leftAlignText: {
        textAlign: 'left',
    },
});