
import * as tf from "@tensorflow/tfjs";
import { logger } from '@/utils/loggingService';

/**
 * Trains a simple forecast model based on historical data
 * 
 * @param data Array of numerical data points
 * @returns Trained TensorFlow model
 */
export async function trainForecastModel(data: number[]) {
  try {
    // Create tensors for input (time indices) and output (actual values)
    const xs = tf.tensor1d(data.map((_, i) => i)); // Time indices
    const ys = tf.tensor1d(data); // Actual KPI values

    // Create a sequential model with several dense layers
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 8, activation: "relu", inputShape: [1] }));
    model.add(tf.layers.dense({ units: 8, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1 }));

    // Compile the model with appropriate optimizer and loss function
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    // Train the model
    await model.fit(xs, ys, {
      epochs: 500,
      verbose: 0,
    });

    return model;
  } catch (error) {
    logger.error('Error training forecast model:', error);
    throw error;
  }
}

/**
 * Forecasts future values using a trained model
 * 
 * @param model Trained TensorFlow model
 * @param nextX The time index to predict
 * @returns Predicted value for the given time index
 */
export async function forecastFuture(model: tf.Sequential, nextX: number): Promise<number> {
  try {
    const input = tf.tensor2d([[nextX]]);
    const prediction = model.predict(input) as tf.Tensor;
    const forecastedValue = (await prediction.data())[0];
    return forecastedValue;
  } catch (error) {
    logger.error('Error forecasting future value:', error);
    throw error;
  }
}

/**
 * Forecasts resource points for an executive based on past performance
 * 
 * @param pastResourcePoints Array of historical resource point values
 * @returns Predicted future resource point value
 */
export async function forecastExecutiveResources(pastResourcePoints: number[]): Promise<number | null> {
  try {
    if (pastResourcePoints.length < 3) {
      return null; // Not enough data for meaningful prediction
    }

    const model = await trainForecastModel(pastResourcePoints);
    const nextX = pastResourcePoints.length;
    const forecastedValue = await forecastFuture(model, nextX);
    
    return Math.round(forecastedValue);
  } catch (error) {
    logger.error('Error forecasting executive resources:', error);
    return null;
  }
}

/**
 * Trains multiple forecast models for different KPI types
 * 
 * @param kpiData Record of KPI types to their historical data
 * @returns Record of KPI types to their trained models
 */
export async function trainMultiForecastModels(kpiData: Record<string, number[]>): Promise<Record<string, tf.Sequential>> {
  try {
    const models: Record<string, tf.Sequential> = {};

    for (const kpiType in kpiData) {
      const data = kpiData[kpiType];
      if (data.length < 3) {
        logger.warn(`Not enough data points for KPI type ${kpiType}. Skipping model training.`);
        continue;
      }
      
      models[kpiType] = await trainForecastModel(data);
      logger.info(`Trained forecast model for KPI type: ${kpiType}`);
    }

    return models;
  } catch (error) {
    logger.error('Error training multiple forecast models:', error);
    throw error;
  }
}

/**
 * Forecasts future values for multiple KPI types
 * 
 * @param models Record of KPI types to their trained models
 * @param nextX The time index to predict
 * @returns Record of KPI types to their predicted values
 */
export async function forecastMultipleFuture(models: Record<string, tf.Sequential>, nextX: number): Promise<Record<string, number>> {
  try {
    const forecasts: Record<string, number> = {};

    for (const kpiType in models) {
      const model = models[kpiType];
      forecasts[kpiType] = await forecastFuture(model, nextX);
      logger.info(`Forecasted future value for KPI type ${kpiType}: ${forecasts[kpiType]}`);
    }

    return forecasts;
  } catch (error) {
    logger.error('Error forecasting multiple future values:', error);
    throw error;
  }
}
