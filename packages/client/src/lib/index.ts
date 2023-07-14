// place files you want to import through the `$lib` alias in this folder.
export type ThermoData = {
    time: number;
    temperature: number;
    humidity: number;
    pressure: number;
};
type Range = {
    min?: number;
    max?: number;
}
export const normalizeData = (data: Array<number>, range?: Range) => {
    const max = range?.max ?? Math.max(...data);
    const min = range?.min ?? Math.min(...data);
    return data.map((value) => (value - min) / (max - min));
}

export const strokeGraph = (canvas: HTMLCanvasElement, data: Array<number>, range?: Range) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.beginPath();
    normalizeData(data, range).forEach((t, i) => {
        const x = i / data.length * width;
        const y = (1 - t) * height;
        ctx.lineTo(x, y);
    })
    ctx.stroke();
    ctx.closePath();
}

export type DisplayInfo = {
    temperature: boolean;
    humidity: boolean;
    pressure: boolean;
    MA_temperature: boolean;
    MA_humidity: boolean;
    MA_pressure: boolean;
}

export type ViewData = {
    color: string;
    data: Array<number>;
    label: string;
    range?: Range;
}

export const movingAverage = (data: Array<number>, windowSize: number) => {
    const result: Array<number> = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = Math.min(data.length, i + windowSize);
        const sum = data.slice(start, end).reduce((a, b) => a + b, 0);
        result.push(sum / (end - start));
    }
    return result;
}

export const graphDataGenerator = (data: Array<ThermoData>, displayInfo: DisplayInfo): ViewData[] => {
    const viewData: ViewData[] = [];
    const windowSize = Math.ceil(data.length / 10);
    const temperature = data.map((d) => d.temperature);
    const humidity = data.map((d) => d.humidity);
    const pressure = data.map((d) => d.pressure);
    if (displayInfo.temperature) {
        viewData.push({
            label: 'Temperature',
            color: 'red',
            data: temperature
        });
    }
    if (displayInfo.humidity) {
        viewData.push({
            label: 'Humidity',
            color: 'blue',
            data: humidity
        });
    }
    if (displayInfo.pressure) {
        viewData.push({
            label: 'Pressure',
            color: 'green',
            data: pressure,
            range:{
                min: 95000,
                max: 105000
            }
        });
    }
    if (displayInfo.MA_temperature) {
        viewData.push({
            label: 'MA_Temperature',
            color: 'rgb(255, 128, 128)',
            data: movingAverage(temperature, windowSize),
            range:{
                min: Math.min(...temperature),
                max: Math.max(...temperature)
            }
        });
    }
    if (displayInfo.MA_humidity) {
        viewData.push({
            label: 'MA_Humidity',
            color: 'rgb(128, 128, 255)',
            data: movingAverage(data.map((d) => d.humidity), windowSize),
            range:{
                min: Math.min(...humidity),
                max: Math.max(...humidity)
            }
        });
    }
    if (displayInfo.MA_pressure) {
        viewData.push({
            label: 'MA_Pressure',
            color: 'rgb(64, 255, 64)',
            data: movingAverage(data.map((d) => d.pressure), windowSize),
            range:{
                min: 95000,
                max: 105000
            }
        });
    }
    return viewData;
}