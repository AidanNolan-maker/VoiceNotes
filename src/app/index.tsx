import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950">
      <Text className="text-3xl font-bold text-white">
        Voice Notes
      </Text>

      <Text className="mt-2 text-base text-zinc-400">
        NativeWind is working.
      </Text>
    </View>
  );
}