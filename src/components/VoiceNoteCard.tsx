import { Pressable, Text, View } from 'react-native'
import type { VoiceNote } from '@/stores/recording-store';

interface VoiceNoteCardProps {
    note: VoiceNote;
    isPlaying: boolean;
    currentTime: number;
    onPlay: () => void;
}

export function VoiceNoteCard({
    note,
    isPlaying,
    currentTime,
    onPlay,
}: VoiceNoteCardProps) {
    const totalSeconds = Math.floor(
        note.durationMillis / 1000,
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const duration =
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const elapsedSeconds = Math.floor(currentTime);

    const elapsedMinutes = Math.floor(
        elapsedSeconds / 60,
    );

    const elapsedRemainingSeconds =
        elapsedSeconds % 60;

    const elapsed =
        `${elapsedMinutes}:${elapsedRemainingSeconds
            .toString()
            .padStart(2, '0')}`;

    return (
        <View className="mb-3 rounded-2xl bg-zinc-900 p-4">
            <View className="flex-row items-center">
                <Pressable
                    onPress={onPlay}
                    className={`h-12 w-12 items-center justify-center rounded-full ${
                        isPlaying
                            ? 'bg-red-500'
                            : 'bg-white'
                    }`}
                >
                    <View
                        className={`${
                            isPlaying
                                ? 'h-5 w-5 rounded-md bg-white'
                                : 'ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-red-500'
                        }`}
                    />
                </Pressable>

                <View className="ml-4 flex-1">
                    <Text className="text-lg font-semibold text-white">
                        {note.title}
                    </Text>

                    <Text className="mt-1 text-sm text-zinc-400">
                        {isPlaying
                            ? `${elapsed} / ${duration}`
                            : duration}
                    </Text>
                </View>
            </View>

            <Text className="mt-3 text-xs text-zinc-600">
                {new Date(note.createdAt).toLocaleString()}
            </Text>
        </View>
    );
}