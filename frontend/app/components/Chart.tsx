"use client";
import { createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const ChartComponent = (props: { data: any[] }) => {
    const { data } = props;
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Verificación de seguridad
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        // Crear el gráfico
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8', // Color gris suave para texto
            },
            width: chartContainerRef.current.clientWidth,
            height: 350,
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.1)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.1)',
                timeVisible: true,
            },
        });

        // Añadir la serie de Velas
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10b981',    // Verde Esmeralda
            downColor: '#ef4444',  // Rojo
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        candlestickSeries.setData(data);

        window.addEventListener('resize', handleResize);

        // Limpieza al desmontar
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data]);

    return (
        <div ref={chartContainerRef} className="w-full h-full" />
    );
};