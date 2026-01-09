// Lovable Cloud Function: public-product-group-colors
// Returns available colors for the selected product's group, without exposing any cost values.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ReqBody = {
  productId?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing backend configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = (await req.json().catch(() => ({}))) as ReqBody;
    const productId = body.productId?.trim();

    if (!productId) {
      return new Response(
        JSON.stringify({ colors: [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
          },
        },
      );
    }

    const { data: product, error: productError } = await admin
      .from("products")
      .select("group_id")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      return new Response(
        JSON.stringify({ error: "Failed to load product" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const groupId = product?.group_id ?? null;
    if (!groupId) {
      return new Response(
        JSON.stringify({ colors: [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        },
      );
    }

    const { data: groupProducts, error: groupError } = await admin
      .from("products")
      .select("id")
      .eq("group_id", groupId);

    if (groupError || !groupProducts?.length) {
      return new Response(
        JSON.stringify({ colors: [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        },
      );
    }

    const productIds = groupProducts.map((p) => p.id);

    const { data: dyeingRows, error: dyeingError } = await admin
      .from("dyeing_costs")
      .select("color_id")
      .in("product_id", productIds)
      .limit(5000);

    if (dyeingError) {
      return new Response(
        JSON.stringify({ error: "Failed to load colors" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const colorIds = Array.from(new Set((dyeingRows ?? []).map((r) => r.color_id))).filter(Boolean);

    if (colorIds.length === 0) {
      return new Response(
        JSON.stringify({ colors: [] }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
          },
        },
      );
    }

    const { data: colors, error: colorsError } = await admin
      .from("colors")
      .select("id, name")
      .in("id", colorIds)
      .order("name")
      .limit(2000);

    if (colorsError) {
      return new Response(
        JSON.stringify({ error: "Failed to load colors" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ colors: colors ?? [] }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (_e) {
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
