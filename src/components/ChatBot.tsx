import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Plus, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  messageCount: number;
  isLoading: boolean;
  lastAction: string;
}

const ChatBot = () => {
  const { toast } = useToast();
  const [chatState, setChatState] = useState<ChatState>({
    sessions: [],
    currentSession: null,
    messages: [],
    messageCount: 0,
    isLoading: false,
    lastAction: '',
  });
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  useEffect(() => {
    loadAllSessions();
  }, []);

  const callChatAPI = async (payload: any) => {
    setChatState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-handler', {
        body: payload
      });

      if (error) throw error;

      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to communicate with server',
        variant: "destructive",
      });
      throw error;
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadAllSessions = async () => {
    try {
      const response = await callChatAPI({ action: 'get_all_sessions' });
      
      if (response.success) {
        setChatState(prev => ({
          ...prev,
          sessions: response.sessions || [],
          lastAction: 'get_all_sessions'
        }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await callChatAPI({ 
        action: 'new_chat',
        title: `Chat ${chatState.sessions.length + 1}`
      });

      if (response.success) {
        setChatState(prev => ({
          ...prev,
          currentSession: response.session,
          messages: [],
          messageCount: 0,
          sessions: [response.session, ...prev.sessions],
          lastAction: 'new_chat'
        }));

        toast({
          title: "New Chat Created",
          description: "Started a new conversation",
        });
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const selectSession = async (session: ChatSession) => {
    try {
      const response = await callChatAPI({ 
        action: 'get_session',
        sessionId: session.id
      });

      if (response.success) {
        setChatState(prev => ({
          ...prev,
          currentSession: response.session,
          messages: response.messages || [],
          messageCount: response.session.message_count,
          lastAction: 'get_session'
        }));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatState.currentSession) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');

    try {
      const response = await callChatAPI({
        action: 'send_message',
        sessionId: chatState.currentSession.id,
        message: messageToSend
      });

      if (response.success) {
        setChatState(prev => ({
          ...prev,
          messages: response.messages || [],
          messageCount: response.session.message_count,
          currentSession: response.session,
          lastAction: 'send_message',
          sessions: prev.sessions.map(s => 
            s.id === response.session.id ? response.session : s
          )
        }));

        toast({
          title: "Message Sent",
          description: "Bot response received",
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Button 
            onClick={createNewChat} 
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            disabled={chatState.isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {chatState.sessions.map((session) => (
              <Card 
                key={session.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  chatState.currentSession?.id === session.id ? 'bg-accent' : ''
                }`}
                onClick={() => selectSession(session)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium truncate">{session.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.message_count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* State Information */}
        <div className="p-4 border-t border-border bg-accent/30">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Sessions: {chatState.sessions.length}</div>
            <div>Messages: {chatState.messageCount}</div>
            <div>Last Action: {chatState.lastAction}</div>
            <div>Status: {chatState.isLoading ? 'Loading...' : 'Ready'}</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatState.currentSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{chatState.currentSession.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {chatState.messageCount} messages • Last updated: {new Date(chatState.currentSession.updated_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="bg-gradient-primary text-primary-foreground">
                  Session: {chatState.currentSession.id.slice(0, 8)}...
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatState.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[70%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gradient-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={chatState.isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || chatState.isLoading}
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Welcome to ChatBot</h3>
              <p className="text-muted-foreground mb-4">
                Create a new chat or select an existing conversation to get started
              </p>
              <Button 
                onClick={createNewChat} 
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                disabled={chatState.isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;