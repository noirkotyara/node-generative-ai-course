export function getWeather(location: string) {
    if (location.toLowerCase().includes('kyiv')) {
        return {
            temperature: {
                actual: 7,
                feelsLike: 4,
            },
            wind: 4,
            humidity: 81,
        }
    }

    return {};
}

export function validWeatherFunctionArguments<T>(
    functionArguments: unknown,
): asserts functionArguments is T {
    if (!functionArguments?.hasOwnProperty("location")) {
        throw new Error("Should has location parameter");
    }
}
