'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Edit2,
  MoreVertical,
  X,
  Check,
  Key,
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Available OpenAI models
const MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Most capable model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast and affordable' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'High performance' },
  { value: 'gpt-3.5-turbo-0125', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
]

// Storage keys
const STORAGE_KEY = 'chatgpt_conversations'
const SETTINGS_KEY = 'chatgpt_settings'
const SIDEBAR_KEY = 'chatgpt_sidebar_open'
const CURRENT_CONVERSATION_KEY = 'chatgpt_current_conversation_id'

export function ChatGPTEnhanced() {
  const router = useRouter()
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(() => {
    // Load current conversation ID from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CURRENT_CONVERSATION_KEY) || null
    }
    return null
  })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sendingMessageId, setSendingMessageId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Always default to true - sidebar should always be visible
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_KEY)
      // Only use saved value if it's explicitly set to false, otherwise default to true
      return saved === 'false' ? false : true
    }
    return true
  })
  const [editingConversationId, setEditingConversationId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const [settings, setSettings] = useState({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
    organizationId: '',
    projectId: '',
  })

  // Load conversations and settings from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY)
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations)
        setConversations(parsed)
        
        // Restore current conversation ID from localStorage, or use first conversation
        const savedConversationId = localStorage.getItem(CURRENT_CONVERSATION_KEY)
        let conversationIdToUse = null
        
        if (savedConversationId && parsed.find(c => c.id === savedConversationId)) {
          conversationIdToUse = savedConversationId
        } else if (parsed.length > 0) {
          conversationIdToUse = parsed[0].id
          localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationIdToUse)
        }
        
        if (conversationIdToUse) {
          setCurrentConversationId(conversationIdToUse)
          // Immediately load messages for this conversation
          const conversation = parsed.find(c => c.id === conversationIdToUse)
          if (conversation && conversation.messages) {
            setMessages(conversation.messages)
          }
        }
      } catch (e) {
        console.error('Error loading conversations:', e)
      }
    }
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error('Error loading settings:', e)
      }
    }
    
    // Load organization and project IDs from localStorage
    const orgId = localStorage.getItem('openai_organization_id') || ''
    const projId = localStorage.getItem('openai_project_id') || ''
    if (orgId || projId) {
      setSettings(prev => ({
        ...prev,
        organizationId: orgId,
        projectId: projId,
      }))
    }

    // Listen for changes to organization/project IDs
    const handleStorageChange = (e) => {
      if (e.key === 'openai_organization_id' || e.key === 'openai_project_id' || e.key === null) {
        const orgId = localStorage.getItem('openai_organization_id') || ''
        const projId = localStorage.getItem('openai_project_id') || ''
        setSettings(prev => ({
          ...prev,
          organizationId: orgId,
          projectId: projId,
        }))
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const orgId = localStorage.getItem('openai_organization_id') || ''
      const projId = localStorage.getItem('openai_project_id') || ''
      setSettings(prev => {
        if (prev.organizationId !== orgId || prev.projectId !== projId) {
          return {
            ...prev,
            organizationId: orgId,
            projectId: projId,
          }
        }
        return prev
      })
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Load current conversation messages
  useEffect(() => {
    if (currentConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === currentConversationId)
      if (conversation) {
        // Only update messages if they're different to avoid unnecessary re-renders
        setMessages(prev => {
          const newMessages = conversation.messages || []
          // Check if messages are actually different
          if (prev.length !== newMessages.length || 
              prev.some((msg, idx) => msg.id !== newMessages[idx]?.id)) {
            return newMessages
          }
          return prev
        })
      }
    } else if (!currentConversationId && conversations.length === 0) {
      // Only clear messages if there are no conversations at all
      setMessages([])
    }
  }, [currentConversationId, conversations])

  // Save conversations to localStorage
  const saveConversations = useCallback((newConversations) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations))
    setConversations(newConversations)
  }, [])

  // Save current conversation ID whenever it changes
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, currentConversationId)
    } else {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY)
    }
  }, [currentConversationId])

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    setSettings(newSettings)
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Create new conversation
  const createNewConversation = () => {
    const newId = `conv-${Date.now()}`
    const newConversation = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [newConversation, ...conversations]
    saveConversations(updated)
    setCurrentConversationId(newId)
    localStorage.setItem(CURRENT_CONVERSATION_KEY, newId)
    setMessages([])
    toast.success('New conversation created')
  }

  // Delete conversation
  const deleteConversation = (id) => {
    const updated = conversations.filter(c => c.id !== id)
    saveConversations(updated)
    if (currentConversationId === id) {
      if (updated.length > 0) {
        const newId = updated[0].id
        setCurrentConversationId(newId)
        localStorage.setItem(CURRENT_CONVERSATION_KEY, newId)
      } else {
        setCurrentConversationId(null)
        localStorage.removeItem(CURRENT_CONVERSATION_KEY)
        setMessages([])
      }
    }
    toast.success('Conversation deleted')
  }

  // Rename conversation
  const startRenameConversation = (id) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setEditingConversationId(id)
      setEditingTitle(conversation.title)
    }
  }

  const saveRenameConversation = (id) => {
    if (!editingTitle.trim()) {
      toast.error('Title cannot be empty')
      return
    }
    const updated = conversations.map(c => 
      c.id === id 
        ? { ...c, title: editingTitle.trim(), updatedAt: new Date().toISOString() }
        : c
    )
    saveConversations(updated)
    setEditingConversationId(null)
    setEditingTitle('')
    toast.success('Conversation renamed')
  }

  // Update conversation title from first message
  const updateConversationTitle = (conversationId, firstUserMessage) => {
    if (!firstUserMessage || firstUserMessage.length > 50) return
    
    const updated = conversations.map(c => 
      c.id === conversationId 
        ? { ...c, title: firstUserMessage.substring(0, 50), updatedAt: new Date().toISOString() }
        : c
    )
    saveConversations(updated)
  }

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending',
    }

    // Create conversation if none exists
    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = `conv-${Date.now()}`
      const newConversation = {
        id: conversationId,
        title: input.trim().substring(0, 50) || 'New Chat',
        messages: [userMessage],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updated = [newConversation, ...conversations]
      saveConversations(updated)
      setCurrentConversationId(conversationId)
      localStorage.setItem(CURRENT_CONVERSATION_KEY, conversationId)
    } else {
      // Update conversation
      const updated = conversations.map(c => 
        c.id === conversationId 
          ? { ...c, messages: [...(c.messages || []), userMessage], updatedAt: new Date().toISOString() }
          : c
      )
      saveConversations(updated)
    }

    setMessages(prev => [...prev, userMessage])
    setSendingMessageId(userMessage.id)
    const messageToSend = input.trim()
    setInput('')
    setIsLoading(true)

    try {
      const savedApiKey = localStorage.getItem('openai_api_key')
      const conversation = conversations.find(c => c.id === conversationId) || { messages: [] }
      const allMessages = [...conversation.messages, userMessage]

      const response = await fetch('/api/chatgpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(({ role, content }) => ({ role, content })),
          model: settings.model,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          organizationId: settings.organizationId || undefined,
          projectId: settings.projectId || undefined,
          ...(savedApiKey && { apiKey: savedApiKey }),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to get response'
        const suggestion = errorData.suggestion || ''
        const triedModels = errorData.triedModels || []
        
        // Show a more helpful error message
        let fullErrorMessage = errorMessage
        if (suggestion) {
          fullErrorMessage += `\n\n${suggestion}`
        }
        if (triedModels.length > 0) {
          fullErrorMessage += `\n\nTried models: ${triedModels.join(', ')}`
        }
        
        throw new Error(fullErrorMessage)
      }

      const data = await response.json()

      // Show notification if a fallback model was used
      if (data.usedFallback && data.requestedModel) {
        toast.info(`Using ${data.model} instead of ${data.requestedModel}`, {
          description: 'Your requested model is not available, but a compatible model was used successfully.',
          duration: 5000,
        })
      }

      const assistantMessage = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        metadata: {
          model: data.model,
          requestedModel: data.requestedModel,
          usedFallback: data.usedFallback,
          tokens: data.tokens,
          responseTime: data.responseTime,
        },
      }

      // Update user message status to sent
      const sentUserMessage = { ...userMessage, status: 'sent' }
      
      // Update conversation with both messages
      const updated = conversations.map(c => {
        if (c.id === conversationId) {
          const newMessages = [...(c.messages || []).filter(m => m.id !== userMessage.id), sentUserMessage, assistantMessage]
          // Update title from first user message if still default
          let title = c.title
          if (title === 'New Chat' && newMessages.length > 0) {
            const firstUserMsg = newMessages.find(m => m.role === 'user')
            if (firstUserMsg) {
              title = firstUserMsg.content.substring(0, 50)
            }
          }
          return {
            ...c,
            messages: newMessages,
            title,
            updatedAt: new Date().toISOString(),
          }
        }
        return c
      })
      saveConversations(updated)
      setMessages(prev => prev.map(m => m.id === userMessage.id ? sentUserMessage : m))
      setMessages(prev => [...prev, assistantMessage])
      setSendingMessageId(null)
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Error sending message', {
        description: error.message || 'Failed to communicate with ChatGPT',
      })
      
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
        isError: true,
      }
      
      // Update user message status to sent even on error
      const sentUserMessage = { ...userMessage, status: 'sent' }
      
      const updated = conversations.map(c => 
        c.id === conversationId 
          ? { ...c, messages: [...(c.messages || []).filter(m => m.id !== userMessage.id), sentUserMessage, errorMessage], updatedAt: new Date().toISOString() }
          : c
      )
      saveConversations(updated)
      setMessages(prev => prev.map(m => m.id === userMessage.id ? sentUserMessage : m))
      setMessages(prev => [...prev, errorMessage])
      setSendingMessageId(null)
    } finally {
      setIsLoading(false)
      setSendingMessageId(null)
      textareaRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Simple markdown-like rendering
  const renderMessage = (content) => {
    // Convert markdown-like syntax to HTML
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n/g, '<br />')
    
    return { __html: html }
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <div className={cn(
        "border-r border-border bg-card flex flex-col transition-all duration-300 flex-shrink-0",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className={cn(
          "w-64 flex flex-col h-full",
          !sidebarOpen && "hidden"
        )}>
          {/* New Chat Button */}
          <div className="p-2">
            <Button
              onClick={createNewConversation}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <Separator />

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  currentConversationId === conversation.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => {
                  setCurrentConversationId(conversation.id)
                  localStorage.setItem(CURRENT_CONVERSATION_KEY, conversation.id)
                }}
              >
                {editingConversationId === conversation.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveRenameConversation(conversation.id)
                        } else if (e.key === 'Escape') {
                          setEditingConversationId(null)
                          setEditingTitle('')
                        }
                      }}
                      className="h-7 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        saveRenameConversation(conversation.id)
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingConversationId(null)
                        setEditingTitle('')
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 text-sm truncate">{conversation.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startRenameConversation(conversation.id)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteConversation(conversation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Settings Button */}
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newState = !sidebarOpen
                setSidebarOpen(newState)
                localStorage.setItem(SIDEBAR_KEY, String(newState))
              }}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold">
                {currentConversation?.title || 'New Chat'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {settings.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Select
              value={settings.model}
              onValueChange={(value) => {
                const newSettings = { ...settings, model: value }
                saveSettings(newSettings)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div>
                      <div className="font-medium">{model.label}</div>
                      <div className="text-xs text-muted-foreground">{model.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold mb-1.5">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground">
                Start a conversation or select an existing one from the sidebar
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isSending = sendingMessageId === message.id || message.status === 'sending'
              const isSent = message.status === 'sent' || (!message.status && !isSending && message.role === 'user')
              const messageTime = message.timestamp ? new Date(message.timestamp).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }) : ''
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="rounded-full bg-accent/20 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] transition-all",
                      message.role === 'user'
                        ? "bg-accent text-accent-foreground"
                        : message.isError
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-muted",
                      isSending && "opacity-70"
                    )}
                  >
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={renderMessage(message.content)}
                    />
                    {message.role === 'user' && (
                      <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-border/50 text-xs text-muted-foreground">
                        {isSending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : isSent ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>Sent</span>
                          </>
                        ) : null}
                        {messageTime && (
                          <>
                            {isSending || isSent ? <span>•</span> : null}
                            <span>{messageTime}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="rounded-full bg-primary/20 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                      {isSending ? (
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      ) : (
                        <span className="text-primary text-xs font-bold">U</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
          {isLoading && (
            <div className="flex gap-2 justify-start animate-in fade-in duration-300">
              <div className="rounded-full bg-accent/20 p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span className="text-sm text-muted-foreground">Receiving response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message ChatGPT..."
              disabled={isLoading}
              className="min-h-[60px] max-h-[200px] resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}

