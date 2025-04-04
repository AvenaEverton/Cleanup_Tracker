import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { useEffect, useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';

export default function HeightEstimator() {
    const [isLoading, setIsLoading] = useState(false);
    const [height, setHeight] = useState(null);
    const [detector, setDetector] = useState(null);

    useEffect(() => {
        async function loadModel() {
            try {
                await tf.ready();
                console.log('✅ TensorFlow.js loaded');
                const model = await posedetection.createDetector(posedetection.SupportedModels.MoveNet);
                setDetector(model);
                console.log('✅ MoveNet model loaded');
            } catch (error) {
                console.error('❌ Error loading model:', error);
                Alert.alert('Error', 'Failed to load the AI model.');
            }
        }
        loadModel();
    }, []);

    async function detectHeight() {
        if (!detector) {
            Alert.alert('Error', 'Model is still loading, please wait.');
            return;
        }

        setIsLoading(true);
        try {
            // Placeholder: Replace this with real pose detection logic
            const fakeHeight = Math.random() * 50 + 150; // Simulated height in cm
            setTimeout(() => {
                setHeight(fakeHeight.toFixed(2) + ' cm');
                setIsLoading(false);
            }, 2000);
        } catch (error) {
            console.error('❌ Error detecting height:', error);
            Alert.alert('Error', 'Failed to estimate height.');
            setIsLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Height Estimator</Text>
            <Button title="Detect Height" onPress={detectHeight} disabled={isLoading} />
            {isLoading && <ActivityIndicator size="large" color="blue" />}
            {height && <Text style={{ fontSize: 18, marginTop: 20 }}>Estimated Height: {height}</Text>}
        </View>
    );
}
