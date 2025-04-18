
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CallScript {
  id: string;
  title: string;
  content: string;
  script_type: string;
  created_at: string;
}

interface CallScriptParams {
  companySize?: string | number;
  industry?: string;
  scriptType: string;
  productName?: string;
  targetAudience?: string;
}

export const useCallScripts = () => {
  const [scripts, setScripts] = useState<CallScript[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const generateScript = async (params: CallScriptParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const companyName = profile?.company || 'your company';
      const industryName = profile?.industry || params.industry || 'your industry';
      
      const { data, error } = await supabase.functions.invoke('generate-call-script', {
        body: {
          company: companyName,
          industry: industryName,
          scriptType: params.scriptType,
          companySize: typeof params.companySize === 'number' 
            ? params.companySize.toString() 
            : params.companySize || 'Small',
          productName: params.productName || 'our product',
          targetAudience: params.targetAudience || 'potential customers'
        }
      });

      if (error) throw error;

      // Save script to database
      const { data: savedScript, error: saveError } = await supabase
        .from('ai_communication_scripts')
        .insert({
          content: data.script,
          script_type: params.scriptType,
          company_id: profile?.company_id,
          executive_bot: 'Sales Director'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Update local state
      setScripts(prev => [savedScript as CallScript, ...prev]);
      
      return savedScript;
    } catch (err: any) {
      console.error('Error generating script:', err);
      setError(err.message || 'Failed to generate script');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScripts = async () => {
    if (!profile?.company_id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_communication_scripts')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data as CallScript[]);
    } catch (err: any) {
      console.error('Error fetching scripts:', err);
      setError(err.message || 'Failed to fetch scripts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, [profile?.company_id]);

  return {
    scripts,
    isLoading,
    error,
    generateScript,
    fetchScripts
  };
};
