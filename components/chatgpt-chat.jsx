'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Send, Loader2, AlertCircle, Trash2, Settings, Key } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function ChatGPTChat() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Check for API key (server-side key is handled automatically, user key is optional)
    const checkApiKey = () => {
      const savedApiKey = localStorage.getItem('openai_api_key')
      if (savedApiKey) {
        setApiKey(savedApiKey)
        setHasApiKey(true)
      } else {
        // Server-side key may be available, so we'll allow usage
        // The API route will handle server-side key automatically
        setHasApiKey(true) // Allow usage - server may have key configured
      }
    }
    
    checkApiKey()

    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m ChatGPT. How can I help you today?',
      timestamp: new Date().toISOString(),
    }])

    // Listen for API key changes
    const handleStorageChange = (e) => {
      if (e.key === 'openai_api_key' || e.key === null) {
        checkApiKey()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    // Also check periodically for same-tab changes
    const interval = setInterval(checkApiKey, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkApiKey = () => {
    // Server-side API key may be configured, so we don't require user key
    // The API route will handle server-side key automatically
    // User key is optional - if not provided, server key will be used
    return true
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    if (!checkApiKey()) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const startTime = Date.now()
      const savedApiKey = localStorage.getItem('openai_api_key')
      
      const response = await fetch('/api/chatgpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          // Only send user API key if available (server-side key will be used if not provided)
          ...(savedApiKey && { apiKey: savedApiKey }),
        }),
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData.error || 'Failed to get response from ChatGPT')
        error.triedModels = errorData.triedModels
        throw error
      }

      const data = await response.json()

      const assistantMessage = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        metadata: {
          tokens: data.tokens,
          model: data.model,
          responseTime,
        },
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      
      let errorDescription = error.message || 'Failed to communicate with ChatGPT'
      let errorContent = `Sorry, I encountered an error: ${errorDescription}`
      
      // Provide helpful error messages
      if (errorDescription.includes('does not have access')) {
        errorDescription = 'Your OpenAI API key does not have access to chat models. Please check your OpenAI dashboard to enable model access or use a different API key.'
        const triedModelsText = error.triedModels ? `\n\nTried models: ${error.triedModels.join(', ')}` : ''
        errorContent = `**Model Access Error**\n\n${errorDescription}${triedModelsText}\n\nYou may need to:\n1. Enable chat models in your OpenAI dashboard\n2. Check your API key permissions\n3. Ensure you have credits/quota available\n4. Try a different API key`
      } else if (errorDescription.includes('Invalid API key')) {
        errorDescription = 'Invalid API key. Please check your API key in Settings.'
        errorContent = `**API Key Error**\n\n${errorDescription}`
      } else if (errorDescription.includes('Insufficient quota') || errorDescription.includes('quota')) {
        errorDescription = 'You have reached your API usage limit. Please check your OpenAI account billing.'
        errorContent = `**Quota Exceeded**\n\n${errorDescription}`
      }
      
      toast.error('Error sending message', {
        description: errorDescription,
        duration: 5000,
      })
      
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m ChatGPT. How can I help you today?',
      timestamp: new Date().toISOString(),
    }])
    toast.success('Chat cleared')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex flex-col h-full border-2 border-border/70 bg-card">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">ChatGPT</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Chat with AI assistant
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasApiKey ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                <Key className="h-3 w-3 mr-1" />
                Using Server Key
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
              className="h-8 w-8"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8"
              title="Clear Chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="rounded-full bg-accent/20 p-2 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%]",
                  message.role === 'user'
                    ? "bg-accent text-accent-foreground"
                    : message.isError
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                {message.metadata && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
                    <Badge variant="outline" className="text-xs">
                      {message.metadata.model}
                    </Badge>
                    {message.metadata.tokens && (
                      <Badge variant="outline" className="text-xs">
                        {message.metadata.tokens} tokens
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.metadata.responseTime}ms
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="rounded-full bg-primary/20 p-2 flex-shrink-0">
                  <span className="h-4 w-4 text-primary text-xs font-bold">U</span>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="rounded-full bg-accent/20 p-2 flex-shrink-0">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t p-4 bg-secondary/30">
          {!localStorage.getItem('openai_api_key') && (
            <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-500">
                Using server-configured API key. You can optionally add your own key in Settings for personal usage.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings')}
                className="ml-auto"
              >
                Settings
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

