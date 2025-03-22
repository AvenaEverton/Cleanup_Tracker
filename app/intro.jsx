import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

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

    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(300);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    });

    Animated.timing(progressAnim, {
      toValue: (slideIndex * 33.33),
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
      {/* Background image with fade effect */}
      <Animated.Image
        source={getImageSource()}
        style={[styles.fullScreenImage, { opacity: bgFadeAnim }]}
      />

      <View style={styles.overlayContainer}>
        <Animated.View
          style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
        >
          {slideIndex === 1 && (
            <>
              <Text style={styles.title}>Description:</Text>
              <Text style={styles.description}>
                One of the major problems in {'\n'}
                <Text style={styles.boldText}>Bucana, Nasugbu, Batangas</Text> is improper waste management.{"\n\n"}
                This app was developed to provide a platform where residents can:{"\n\n"}
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
              <Text style={styles.title}>App Features:</Text>
              <Text style={styles.description}>
              ✅ <Text style={styles.highlightText}>Report environmental issues</Text>{"\n"}
              ✅ <Text style={styles.highlightText}>Become an Environmental Advocate</Text>{"\n"}
              ✅ <Text style={styles.highlightText}>Access guidelines for proper waste disposal</Text>{"\n\n"}

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
              <Text style={styles.title}>Our Mission:</Text>
              <Text style={styles.description}>
                Our goal is to promote a {"\n"}
                <Text style={styles.boldText}>cleaner and more sustainable community.</Text>
              </Text>

              <TouchableOpacity style={styles.button} onPress={handleProceed}>
                <Text style={styles.buttonText}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>

        {/* Progress Bar (stays at bottom) */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            }),
          }]} />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // ✅ Transparent glass effect
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    backdropFilter: 'blur(15px)', // ✅ Glassmorphism blur effect
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff', // ✅ Text visible on glass effect
  },
  description: {
    fontSize: 16,
    color: '#f0f0f0', // ✅ Slightly brighter text for visibility
  },
  button: {
    backgroundColor: '#008000',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#008000',
  },
});

