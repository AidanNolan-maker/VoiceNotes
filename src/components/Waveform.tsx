import { Canvas, Line, vec } from '@shopify/react-native-skia';

interface WaveformProps {
    levels: number[];
}

const WAVEFORM_HEIGHT = 140;

export function Waveform({ levels }: WaveformProps) {
    return (
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
    );
}