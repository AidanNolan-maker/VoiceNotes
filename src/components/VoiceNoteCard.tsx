import { Text, View } from 'react-native'
import type { VoiceNote } from '@/stores/recording-store';

interface VoiceNoteCardProps {
    note: VoiceNote;
}

export function VoiceNoteCard({
    note,
}: VoiceNoteCardProps) {
    const totalSeconds = Math.floor(
        note.durationMillis / 1000,
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const duration =
    `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
        <View className="mb-3 rounded-2xl bg-zinc-900 p-4">
            <Text className="text-lg font-semibold text-white">
                {note.title}
            </Text>

            <Text className="mt-1 text-sm text-zinc-400">
                {duration}
            </Text>

            <Text className="mt-2 text-xs text-zinc-600">
                {new Date(note.createdAt).toLocaleString()}
            </Text>
        </View>
    );
}