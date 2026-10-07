import { create } from 'zustand';

export interface VoiceNote {
    id: string;
    uri: string;
    title: string;
    durationMillis: number;
    createdAt: string;
}

interface RecordingState {
    isRecording: boolean;
    recordingUri: string | null;
    durationMillis: number;
    notes: VoiceNote[];

    setIsRecording: (isRecording: boolean) => void;
    setRecordingUri: (recordingUri: string | null) => void;
    setDurationMillis: (durationMillis: number) => void;

    addNote: (note: VoiceNote) => void;
    removeNote: (id: string) => void;

    reset: () => void;
}

const initialState = {
    isRecording: false,
    recordingUri: null,
    durationMillis: 0,
    notes: [] as VoiceNote[],
};

export const useRecordingStore = create<RecordingState>((set) => ({
    ...initialState,

    setIsRecording: (isRecording) =>
        set({ isRecording }),

    setRecordingUri: (recordingUri) =>
        set({ recordingUri }),

    setDurationMillis: (durationMillis) =>
        set({ durationMillis }),

    addNote: (note) =>
        set((state) => ({
            notes: [...state.notes, note],
        })),

    removeNote: (id) =>
        set((state) => ({
            notes: state.notes.filter((note) => note.id !== id),
        })),

    reset: () =>
        set(initialState),
}));