import { create } from 'zustand';

interface RecordingState {
    isRecording: boolean;
    recordingUri: string | null;
    durationMillis: number;

    setIsRecording: (isRecording: boolean) => void;
    setRecordingUri: (recordingUri: string | null) => void;
    setDurationMillis: (durationMillis: number) => void;

    reset: () => void;
}

const initialState = {
    isRecording: false,
    recordingUri: null,
    durationMillis: 0,
};

export const useRecordingStore = create<RecordingState>((set) => ({
    ...initialState,

    setIsRecording: (isRecording) =>
        set({ isRecording }),

    setRecordingUri: (recordingUri) =>
        set({ recordingUri }),

    setDurationMillis: (durationMillis) =>
        set({ durationMillis }),

    reset: () =>
        set(initialState),
}));