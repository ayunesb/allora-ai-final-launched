
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AiRecommendations from "@/components/dashboard/AiRecommendations";
import { DashboardAnalytics } from "@/components/dashboard/DashboardAnalytics";
import CeoMessage from "@/components/dashboard/CeoMessage";
import QuickAccess from "@/components/dashboard/QuickAccess";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import ProductionDataAlert from "@/components/dashboard/ProductionDataAlert";
import { useDashboardData } from "@/hooks/useDashboardData";
import { supabase } from "@/integrations/supabase/client";
import { useStrategies } from "@/hooks/useStrategies";
import { useProductionData } from "@/hooks/useProductionData";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useDashboardData(user?.id);
  
  const { isProductionMode } = useProductionData();
  const [companyName, setCompanyName] = useState<string>("your company");
  const { strategies } = useStrategies();

  // Fetch real company name
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (profile?.company_id) {
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('name')
            .eq('id', profile.company_id)
            .single();
            
          if (!error && data) {
            setCompanyName(data.name);
          }
        } catch (err) {
          console.error("Error fetching company data:", err);
        }
      }
    };
    
    fetchCompanyData();
  }, [profile?.company_id]);

  useEffect(() => {
    if (error) {
      console.error("Dashboard data error:", error);
      toast.error("Error loading dashboard data. Please try refreshing.");
    }
  }, [error]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Dashboard data refreshed");
    } catch (err) {
      console.error("Error refreshing data:", err);
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleSetupProduction = () => {
    // Redirect to the admin launch page
    window.location.href = "/admin/launch-verification";
  };

  if (isLoading && !data) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button 
          onClick={handleRefreshData} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </Button>
      </div>

      {!isProductionMode && <ProductionDataAlert />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
        <div className="md:col-span-2">
          <CeoMessage 
            riskAppetite={profile?.risk_appetite || 'medium'}
          />
        </div>
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Executive Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-lg font-bold">BU</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Business Strategist</h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                I've been reviewing {companyName}'s position and have some balanced strategies that could help optimize your results.
              </p>
              <Button className="mt-4 w-full" variant="outline" onClick={() => window.location.href = "/dashboard/strategies"}>
                <span>View Strategies</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {data && <AiRecommendations 
        recommendations={data.recommendations || []} 
        onApprove={(index) => {
          toast.success(`Recommendation ${index + 1} approved`);
        }}
      />}
      <DashboardAnalytics />
      <QuickAccess />
    </div>
  );
}
