import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, sessionId, message, title } = await req.json();
    console.log('Received request:', { action, sessionId, message });

    let responseData = {};

    switch (action) {
      case 'new_chat':
        // Create new chat session
        const { data: newSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({ title: title || 'New Chat' })
          .select()
          .single();

        if (sessionError) throw sessionError;

        responseData = {
          action: 'new_chat',
          session: newSession,
          success: true,
          message: 'New chat session created'
        };
        break;

      case 'send_message':
        if (!sessionId || !message) {
          throw new Error('Session ID and message are required');
        }

        // Save user message
        const { error: userMessageError } = await supabase
          .from('messages')
          .insert({
            session_id: sessionId,
            role: 'user',
            content: message
          });

        if (userMessageError) throw userMessageError;

        // Generate bot response (simple echo bot for demo)
        const botResponse = `I received your message: "${message}". This is a demo response from the backend!`;

        // Save bot response
        const { error: botMessageError } = await supabase
          .from('messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: botResponse
          });

        if (botMessageError) throw botMessageError;

        // Get updated session with message count
        const { data: updatedSession, error: sessionFetchError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionFetchError) throw sessionFetchError;

        // Get all messages for this session
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        responseData = {
          action: 'send_message',
          session: updatedSession,
          messages: messages,
          botResponse: botResponse,
          success: true,
          message: 'Message sent and response generated'
        };
        break;

      case 'get_session':
        if (!sessionId) {
          throw new Error('Session ID is required');
        }

        // Get session details
        const { data: session, error: getSessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (getSessionError) throw getSessionError;

        // Get messages for this session
        const { data: sessionMessages, error: getMessagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (getMessagesError) throw getMessagesError;

        responseData = {
          action: 'get_session',
          session: session,
          messages: sessionMessages,
          success: true,
          message: 'Session retrieved successfully'
        };
        break;

      case 'get_all_sessions':
        // Get all chat sessions
        const { data: allSessions, error: getAllSessionsError } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false });

        if (getAllSessionsError) throw getAllSessionsError;

        responseData = {
          action: 'get_all_sessions',
          sessions: allSessions,
          success: true,
          message: 'All sessions retrieved successfully'
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-handler:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'An error occurred processing your request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});