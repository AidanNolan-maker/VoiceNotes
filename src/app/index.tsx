import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import {
  Canvas,
  Line,
  vec,
} from '@shopify/react-native-skia';

const BAR_COUNT = 40;
const WAVEFORM_HEIGHT = 140;

export default function HomeScreen() {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });

  const recorderState = useAudioRecorderState(recorder);

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>(
    Array(BAR_COUNT).fill(0.08),
  );

  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Microphone Permission Required',
            'Voice Notes needs microphone access to record audio.',
          );
          return;
        }

        setPermissionGranted(true);

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Failed to configure audio:', error);

        Alert.alert(
          'Audio Error',
          'Unable to configure audio recording.',
        );
      }
    };

    configureAudio();
  }, []);

  useEffect(() => {
    if (recorderState.isRecording) {
      animationRef.current = setInterval(() => {
        setLevels((current) =>
           current.map(() => 0.08 + Math.random() * 0.75),
        );
      }, 80);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }

      setLevels((current) =>
        current.map(() => 0.08),
      );
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [recorderState.isRecording]);

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert(
        'Microphone Permission Required',
        'Microphone access has not been granted.',
      );
      return;
    }

    try {
      setRecordingUri(null);

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);

      Alert.alert(
        'Recording Error',
        'Unable to start recording.',
      );
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();

      setRecordingUri(recorder.uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);

      Alert.alert(
        'Recording Error',
        'Unable to stop recording.',
      );
    }
  };

  const totalSeconds = Math.floor(
    recorderState.durationMillis / 1000,
  );

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const formattedDuration =
  `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View className="flex-1 items-center justify-center bg-zinc-950 px-6">
      <Text className="text-3xl font-bold text-white">
        Voice Notes
      </Text>

      <Text className="mt-2 text-zinc-400">
        {recorderState.isRecording
          ? 'Recording...'
          : 'Ready to record'}
      </Text>

      <Text className="mt-8 text-5xl font-semibold text-white">
        {formattedDuration}
      </Text>

      <View className="mt-10 h-[140px] w-full overflow-hidden rounded-2xl bg-zinc-900">
        <Canvas
          style={{
            width: '100%',
            height: WAVEFORM_HEIGHT,
          }}
        >
          {levels.map((level, index) => {
            const barWidth = 3;
            const gap = 4;
            const x = 12 + index * (barWidth + gap);

            const centerY = WAVEFORM_HEIGHT / 2;
            const halfHeight = Math.max(
              4,
              level * (WAVEFORM_HEIGHT / 2 - 12),
            );

            return (
              <Line
                key={index}
                p1={vec(x, centerY - halfHeight)}
                p2={vec(x, centerY + halfHeight)}
                color="#ef4444"
                strokeWidth={barWidth}
                strokeCap="round"
              />
            );
          })}
        </Canvas>
      </View>

      <Pressable
        onPress={
          recorderState.isRecording
            ? stopRecording
            : startRecording 
        }
        className={`mt-10 h-24 w-24 items-center justify-center rounded full ${
          recorderState.isRecording
            ? 'bg-red-500'
            : 'bg-white'
        }`}
        >
          <View
            className={`h-8 w-8 ${
              recorderState.isRecording
                ? 'rounded-md bg-white'
                : 'rounded-full bg-red-500'
            }`}
          />
        </Pressable>

        {recordingUri && (
          <View className="mt-10 w-full rounded-2xl bg-zinc-900 p-4">
            <Text className="text-sm font-medium text-zinc-400">
              Recording saved
            </Text>

            <Text
              selectable
              className="mt-2 text-xs text-zinc-300"
            >
              {recordingUri}
            </Text>
          </View>
        )}
    </View>
  );
}