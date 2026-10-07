import { Pressable, View } from 'react-native';

interface RecordingButtonProps {
    isRecording: boolean;
    onPress: () => void;
}

export function RecordingButton({
    isRecording,
    onPress,
}: RecordingButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`mt-10 h-24 w-24 items-center justify-center rounded-full ${
              isRecording ? 'bg-red-500' : 'bg-white'
            }`}
        >
            <View
              className={`h-8 w-8 ${
                isRecording
                  ? 'rounded-md bg-white'
                  : 'rounded-full bg-red-500'
              }`}
            />
        </Pressable>
    );
}