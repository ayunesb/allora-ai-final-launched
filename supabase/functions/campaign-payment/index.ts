
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const SUPABASE_URL = "https://ofwxyctfzskeeniaaazw.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { Authorization: req.headers.get("Authorization") || "" },
    },
  });
  
  // Initialize Stripe
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });

  try {
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { action, campaignId, cancelUrl } = await req.json();

    if (action === "create-checkout-session") {
      if (!campaignId) {
        return new Response(
          JSON.stringify({ error: "Campaign ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
        
      if (campaignError || !campaign) {
        return new Response(
          JSON.stringify({ error: "Campaign not found", details: campaignError }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Calculate management fee (10%)
      const managementFee = Math.round(campaign.budget * 0.1);
      const totalAmount = campaign.budget + managementFee;
      
      // Update campaign with fee and total amount
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({
          management_fee: managementFee,
          total_amount: totalAmount
        })
        .eq('id', campaignId);
        
      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update campaign", details: updateError }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get or create Stripe customer
      let customerId;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, name, email')
        .eq('id', user.id)
        .single();
      
      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id;
      } else {
        // Create a new customer
        const customer = await stripe.customers.create({
          name: profile?.name || user.email?.split('@')[0],
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        
        customerId = customer.id;
        
        // Save Stripe customer ID
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);
      }
      
      // Create a Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Campaign: ${campaign.name}`,
                description: `Ad budget: $${campaign.budget} + Management fee: $${managementFee}`,
              },
              unit_amount: Math.round(totalAmount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          campaignId: campaignId,
          budget: campaign.budget,
          managementFee: managementFee,
          userId: user.id
        },
        mode: 'payment',
        success_url: `${APP_URL}/dashboard/campaigns/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${APP_URL}/dashboard/campaigns`,
      });

      // Update campaign with Stripe payment ID
      await supabase
        .from('campaigns')
        .update({
          stripe_payment_id: session.id,
          payment_status: 'pending'
        })
        .eq('id', campaignId);

      return new Response(
        JSON.stringify({ 
          url: session.url,
          sessionId: session.id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === "check-payment-status") {
      if (!campaignId) {
        return new Response(
          JSON.stringify({ error: "Campaign ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('stripe_payment_id, payment_status')
        .eq('id', campaignId)
        .single();
        
      if (campaignError || !campaign) {
        return new Response(
          JSON.stringify({ error: "Campaign not found", details: campaignError }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!campaign.stripe_payment_id) {
        return new Response(
          JSON.stringify({ error: "No payment found for this campaign" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check payment status in Stripe
      const session = await stripe.checkout.sessions.retrieve(campaign.stripe_payment_id);
      
      let paymentStatus = campaign.payment_status;
      
      if (session.payment_status === 'paid' && campaign.payment_status !== 'paid') {
        // Update campaign payment status
        await supabase
          .from('campaigns')
          .update({
            payment_status: 'paid',
            deployment_status: 'ready'
          })
          .eq('id', campaignId);
          
        paymentStatus = 'paid';
      }
      
      return new Response(
        JSON.stringify({ 
          status: paymentStatus,
          stripeStatus: session.payment_status,
          session: session
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === "process-webhook") {
      // This would be a separate webhook handler for Stripe
      // For now, we'll implement the manual check status above
      return new Response(
        JSON.stringify({ error: "Webhook processing not implemented" }),
        { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error(`Campaign payment error: ${err.message}`);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
