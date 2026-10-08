import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioStream,
} from 'expo-audio';

import { useRecordingStore } from '@/stores/recording-store';
import { RecordingButton } from '@/components/RecordingButton';
import { VoiceNoteCard } from '@/components/VoiceNoteCard';
import { Waveform } from '@/components/Waveform';

const BAR_COUNT = 40;
const WAVEFORM_HEIGHT = 140;

export default function HomeScreen() {
  const audioStream = useAudioStream({
    channels: 1,
    encoding: 'float32',
    sampleRate: 48000,

    onBuffer: (buffer) => {
      if (isRecording) {
        return;
      }

      const samples = new Float32Array(buffer.data);

      if (samples.length === 0) {
        return;
      }

      let sumSquares = 0;

      for (let i = 0; i < samples.length; i++) {
        sumSquares += samples[i] * samples[i];
      }

      const rms = Math.sqrt(
        sumSquares / samples.length,
      );

      const normalizedLevel = Math.min(
        1,
        Math.max(0.08, rms * 8),
      );

      setLevels((current) => [
        ...current.slice(1),
        normalizedLevel,
      ]);
    },
  });

  const player = useAudioPlayer(null, {
    updateInterval: 250,
  });

  const playerStatus = useAudioPlayerStatus(player);

  const playNote = async (uri: string) => {
   try {
    // Stop the idle microphone stream before starting playback.
    if (audioStream.isStreaming) {
      await audioStream.stream.stop();
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      interruptionMode: 'doNotMix',
    });

    // Stop any currently playing audio.
    player.pause();

    // Load the selected recording.
    player.replace({ uri });

    // Start playback.
    player.play();
   } catch (error) {
    console.error('Failed to play voice note:', error);

    Alert.alert(
      'Playback Error',
      'Unable to play this recording.',
    );

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      if (!audioStream.isStreaming) {
        await audioStream.stream.start();
      }
    } catch (restoreError) {
      console.error(
        'Failed to restore audio stream:',
        restoreError,
      );
    }
   }
  };

  const {
    isRecording,
    recordingUri,
    notes,
    setIsRecording,
    setRecordingUri,
    setDurationMillis,
    addNote,
  } = useRecordingStore();

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(
    recorder,
    50,
  );

  const [permissionGranted, setPermissionGranted] = useState(false);

  const [levels, setLevels] = useState<number[]>(
    Array(BAR_COUNT).fill(0.08),
  );

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

        await audioStream.stream.start();
      } catch (error) {
        console.error('Failed to configure audio:', error);

        Alert.alert(
          'Audio Error',
          'Unable to configure audio.',
        );
      }
    };

    configureAudio();

    return () => {
      audioStream.stream.stop().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setLevels(Array(BAR_COUNT).fill(0.08));
      return;
    }

    const metering = recorderState.metering;

    if (metering === undefined) {
      return;
    }

    // Expo's metering value is expressed in decibels.
    // Typical microphone values are negative, with values
    // closer to 0 representing louder sounds.
    const normalizedLevel = Math.min(
      1,
      Math.max(
        0.08,
        (metering + 60) / 60,
      ),
    );

    setLevels((current) => [
      ...current.slice(1),
      normalizedLevel,
    ]);
  }, [
    isRecording,
    recorderState.metering,
  ]);

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert(
        'Microphone Permission Required',
        'Microphone access has not been granted.',
      );
      return;
    }

    try {
      player.pause();

      // Stop the live waveform microphone stream first.
      await audioStream.stream.stop();

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      setRecordingUri(null);
      setDurationMillis(0);

      await recorder.prepareToRecordAsync();

      recorder.record();

      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);

      setIsRecording(false)

      Alert.alert(
        'Recording Error',
        'Unable to start recording.',
      );
    }
  };

  const stopRecording = async () => {
    try {
      await recorder.stop();

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
      });

      const uri = recorder.uri;

      if (uri) {
        const note = {
          id: `${Date.now()}`,
          uri,
          title: `Voice Note ${notes.length + 1}`,
          durationMillis: recorderState.durationMillis,
          createdAt: new Date().toISOString(),
        };

        addNote(note);
        setRecordingUri(uri);
      }

      setIsRecording(false);
      setDurationMillis(recorderState.durationMillis);

      // Resume live microphone visualization
      await audioStream.stream.start();
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
          {isRecording
             ? 'Recording...'
             : 'Ready to record'}
        </Text>

        <Text className="mt-8 text-5xl font-semibold text-white">
          {formattedDuration}
        </Text>

        <View className="mt-10 h-[140px] w-full overflow-hidden rounded-2xl bg-zinc-900">
         <Waveform levels={levels} />
        </View>

       <RecordingButton
          isRecording={isRecording}
          onPress={
            isRecording
              ? stopRecording
              : startRecording 
          }
        />

        {notes.length > 0 && (
          <View className="mt-10 w-full">
            <Text className="mb-3 text-xl font-bold text-white">
              Voice Notes
            </Text>

            {notes.map((note) => (
              <VoiceNoteCard
                key={note.id}
                note={note}
                isPlaying={
                  playerStatus.playing &&
                  playerStatus.currentTime < note.durationMillis / 1000
                }
                currentTime={playerStatus.currentTime}
                onPlay={() => playNote(note.uri)}
              />
            ))}
          </View>
        )}

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