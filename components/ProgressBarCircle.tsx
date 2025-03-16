import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

interface ProgressCircleProps {
    progress: number; // Прогресс в процентах (от 0 до 100)
}

const ProgressBarCircle: React.FC<ProgressCircleProps> = ({ progress }) => {
    const size = 52; // Размер круга
    const strokeWidth = 5; // Толщина линии
    const radius = (size - strokeWidth) / 2; // Радиус круга
    const circumference = 2 * Math.PI * radius; // Длина окружности
    const strokeDashoffset = circumference - (progress / 100) * circumference; // Смещение для отображения прогресса

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    {/* Фоновый круг (не выполненная часть) */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#D9D9D9"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Круг прогресса (выполненная часть) */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#30DA88"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </G>
                {/* Текст с процентами */}
                <SvgText
                    x={size / 2}
                    y={size / 2}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontSize={10}
                    fill="#000"
                >
                    {`${progress}%`}
                </SvgText>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ProgressBarCircle;
