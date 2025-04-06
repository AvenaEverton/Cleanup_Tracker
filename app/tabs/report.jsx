import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import { useEffect, useState } from 'react';
import { View, Button, Text, ActivityIndicator } from 'react-native';

export default function HeightEstimator() {
    const [isLoading, setIsLoading] = useState(false);
    const [height, setHeight] = useState(null);

    useEffect(() => {
        async function loadModel() {
            await tf.ready();
            console.log('TensorFlow.js loaded');
        }
        loadModel();
    }, []);

    async function detectHeight() {
        setIsLoading(true);
        const model = await posedetection.createDetector(posedetection.SupportedModels.MoveNet);
        
        // Simulate detection (since there's no image input)
        setTimeout(() => {
            const fakeHeight = Math.random() * 50 + 150; // Simulated height in cm
            setHeight(fakeHeight.toFixed(2) + " cm");
            setIsLoading(false);
        }, 2000);
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 20 }}>Height Estimator</Text>
            <Button title="Detect Height" onPress={detectHeight} />
            {isLoading && <ActivityIndicator size="large" color="blue" />}
            {height && <Text style={{ fontSize: 18, marginTop: 20 }}>Estimated Height: {height}</Text>}
        </View>
    );
}