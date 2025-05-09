
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trainMultiForecastModels, forecastMultipleFuture } from "@/agents/forecaster";
import { detectAnomalies, getAnomalyRecommendations, Anomaly, ThresholdConfig } from "@/agents/anomalyDetector";
import { triggerCrisisMeeting } from "@/agents/crisisManager";
import { toast } from "sonner";

// Default thresholds for different KPI types
const DEFAULT_THRESHOLDS: Record<string, ThresholdConfig> = {
  revenue: { min: 50000, max: 1000000 },
  churn: { min: 0, max: 0.2 },
  user_growth: { min: 100, max: 10000 },
  retention: { min: 0.6, max: 1.0 },
  conversion_rate: { min: 0.02, max: 0.2 },
  executive_resources: { min: 50, max: 450 }
};

export function useForecastData() {
  const [kpiData, setKpiData] = useState<Record<string, number[]>>({});
  const [forecasts, setForecasts] = useState<Record<string, number>>({});
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to fetch KPI data and generate forecasts
  const fetchAndForecast = async () => {
    try {
      setLoading(true);
      
      // Get KPI types to forecast
      const types = ["revenue", "churn", "user_growth", "executive_resources"];
      const dataMap: Record<string, number[]> = {};

      // Fetch historical data for each KPI type
      for (const type of types) {
        let data;
        
        if (type === "executive_resources") {
          // Fetch executive resource history from the new table
          const { data: resourceHistory, error } = await supabase
            .from("executive_resource_history")
            .select("resource_points, created_at")
            .order("created_at", { ascending: true });
          
          if (!error && resourceHistory && resourceHistory.length > 0) {
            data = resourceHistory.map(entry => entry.resource_points);
          }
        } else {
          // Fetch regular KPI data from kpi_history
          const { data: kpiHistory, error } = await supabase
            .from("kpi_history")
            .select("*")
            .eq("type", type)
            .order("timestamp", { ascending: true });
          
          if (!error && kpiHistory && kpiHistory.length > 0) {
            data = kpiHistory.map(entry => entry.value);
          }
        }
        
        // If we have data, add it to our map
        if (data && data.length) {
          dataMap[type] = data;
        } else {
          // Generate synthetic data for demo purposes
          dataMap[type] = generateSyntheticData(type, 12);
        }
      }
      
      // Store the KPI data
      setKpiData(dataMap);
      
      // Train models for each KPI type
      const models = await trainMultiForecastModels(dataMap);
      
      // Generate forecasts
      const nextX = Math.max(...Object.values(dataMap).map(arr => arr.length));
      const multiForecast = await forecastMultipleFuture(models, nextX);
      
      // Store the forecasts
      setForecasts(multiForecast);
      
      // Detect anomalies
      const detectedAnomalies = detectAnomalies(multiForecast, DEFAULT_THRESHOLDS);
      setAnomalies(detectedAnomalies);
      
      // Generate recommendations
      const anomalyRecommendations = getAnomalyRecommendations(detectedAnomalies);
      setRecommendations(anomalyRecommendations);
      
      // If anomalies are found, trigger crisis meeting
      if (detectedAnomalies.length > 0) {
        triggerCrisisMeeting(detectedAnomalies);
      }
      
    } catch (error) {
      console.error("Error in forecast generation:", error);
      toast.error("Failed to generate forecasts. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generate synthetic data for demo purposes
  const generateSyntheticData = (type: string, count: number): number[] => {
    const data: number[] = [];
    let base = 0;
    
    switch (type) {
      case "revenue":
        base = 100000;
        for (let i = 0; i < count; i++) {
          data.push(base + Math.random() * 20000 - 10000); 
        }
        break;
      case "churn":
        base = 0.05;
        for (let i = 0; i < count; i++) {
          data.push(base + Math.random() * 0.06 - 0.03); 
        }
        break;
      case "user_growth":
        base = 500;
        for (let i = 0; i < count; i++) {
          data.push(base + Math.random() * 300 - 150); 
        }
        break;
      case "executive_resources":
        base = 200;
        for (let i = 0; i < count; i++) {
          data.push(base + Math.random() * 60 - 30); 
        }
        break;
      default:
        for (let i = 0; i < count; i++) {
          data.push(Math.random() * 100); 
        }
    }
    
    return data;
  };

  // Refresh forecasts
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAndForecast();
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAndForecast();
  }, []);

  return {
    kpiData,
    forecasts,
    anomalies,
    recommendations,
    loading,
    refreshing,
    handleRefresh
  };
}
