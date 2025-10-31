// Supabase Edge Function: admin-posts
// - Validates admin using users table and x-user-email header
// - Bypasses RLS using service role to create/update posts securely

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown> | null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500, headers: corsHeaders },
      );
    }

    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    const email = req.headers.get("x-user-email")?.trim().toLowerCase();
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Falta cabecera x-user-email" }),
        { status: 401, headers: corsHeaders },
      );
    }

    // Validate admin
    const { data: user, error: userErr } = await supabase
      .from("users")
      .select("id, is_admin")
      .eq("email", email)
      .single();

    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404, headers: corsHeaders },
      );
    }

    if (!user.is_admin) {
      return new Response(
        JSON.stringify({ error: "No autorizado: se requiere rol admin" }),
        { status: 403, headers: corsHeaders },
      );
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (req.method === "POST") {
      // Create post
      const insertPayload = {
        title: body.title as string,
        content: body.content as string,
        author_id: user.id as string,
        is_event: Boolean(body.is_event ?? false),
        event_date: (body.event_date as string | null) ?? null,
        event_end_date: (body.event_end_date as string | null) ?? null,
        event_location: (body.event_location as string | null) ?? null,
        event_description: (body.event_description as string | null) ?? null,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: corsHeaders },
        );
      }

      return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders });
    }

    if (req.method === "PUT") {
      // Update post
      const id = body.id as string | undefined;
      if (!id) {
        return new Response(
          JSON.stringify({ error: "Falta id del post" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const updatePayload = {
        title: body.title as string,
        content: body.content as string,
        is_event: Boolean(body.is_event ?? false),
        event_date: (body.event_date as string | null) ?? null,
        event_end_date: (body.event_end_date as string | null) ?? null,
        event_location: (body.event_location as string | null) ?? null,
        event_description: (body.event_description as string | null) ?? null,
        updated_at: new Date().toISOString(),
      } as Record<string, Json>;

      const { data, error } = await supabase
        .from("posts")
        .update(updatePayload)
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: corsHeaders },
        );
      }

      return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Método no permitido" }), {
      status: 405,
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error interno" }),
      { status: 500, headers: corsHeaders },
    );
  }
});