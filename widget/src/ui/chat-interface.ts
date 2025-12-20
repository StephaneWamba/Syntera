/**
 * Chat Interface UI Component
 * Creates and manages the chat widget UI
 */

import type { Agent, Message, CallConfig } from '../types'
import { logger } from '../utils/logger'
import { Icons } from '../utils/icons'

export interface ChatInterfaceConfig {
  agent: Agent
  theme: 'light' | 'dark'
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onSendMessage: (content: string, tempMessageId?: string) => Promise<void>
  onStartCall: (type: 'voice' | 'video') => Promise<void>
  onEndCall: () => Promise<void>
  onClose: () => void
}

export class ChatInterface {
  private config: ChatInterfaceConfig
  private container: HTMLDivElement | null = null
  private button: HTMLButtonElement | null = null
  private window: HTMLDivElement | null = null
  private messagesContainer: HTMLDivElement | null = null
  private input: HTMLInputElement | null = null
  private inputArea: HTMLDivElement | null = null
  private isOpen = false
  private isInCall = false
  private voiceCircle: HTMLDivElement | null = null
  private isVoiceActive = false
  private audioAnalyser: AnalyserNode | null = null
  private animationFrameId: number | null = null
  private emojiPicker: HTMLDivElement | null = null
  private emojiButton: HTMLButtonElement | null = null
  private isEmojiPickerOpen = false
  private isClosing = false // Prevent infinite recursion in close callback

  constructor(config: ChatInterfaceConfig) {
    this.config = config
  }

  /**
   * Initialize the chat interface
   */
  init(): void {
    this.createFloatingButton()
    this.createChatWindow()
    this.attachStyles()
  }

  /**
   * Create floating button
   */
  private createFloatingButton(): void {
    this.button = document.createElement('button')
    this.button.className = 'syntera-button'
    this.button.setAttribute('aria-label', 'Open chat')
    
    // Use agent avatar photo if available, otherwise fallback to gradient/icon
    const avatarUrl = this.config.agent.avatar_url || this.generateAvatarUrl(this.config.agent.id)
    const hasPhotoAvatar = !!this.config.agent.avatar_url
    
    this.button.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        border-radius: 50%;
        ${hasPhotoAvatar 
          ? '' 
          : `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;`}
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        position: relative;
      ">
        ${hasPhotoAvatar 
          ? `<img src="${avatarUrl}" alt="${this.config.agent.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center'; this.parentElement.innerHTML='${Icons.chat('white')}'" />` 
          : Icons.chat('white')}
      </div>
    `

    this.button.addEventListener('click', () => {
      this.toggle()
    })

    // Position button with modern styling
    const position = this.getPositionStyles(this.config.position)
    Object.assign(this.button.style, {
      position: 'fixed',
      ...position,
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: 'transparent',
      color: 'white',
      cursor: 'pointer',
      zIndex: '999998',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '0',
      overflow: 'hidden',
    })

    this.button.addEventListener('mouseenter', () => {
      if (this.button) {
        this.button.style.transform = 'scale(1.1) translateY(-2px)'
        const inner = this.button.querySelector('div')
        if (inner) {
          inner.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.6)'
        }
      }
    })

    this.button.addEventListener('mouseleave', () => {
      if (this.button) {
        this.button.style.transform = 'scale(1) translateY(0)'
        const inner = this.button.querySelector('div')
        if (inner) {
          inner.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)'
        }
      }
    })

    document.body.appendChild(this.button)
  }

  /**
   * Create chat window
   */
  private createChatWindow(): void {
    this.window = document.createElement('div')
    this.window.className = 'syntera-window'
    const isDark = this.config.theme === 'dark'
    this.window.style.cssText = `
      position: fixed;
      ${this.getPositionStyles(this.config.position).bottom ? `bottom: 90px;` : `top: 90px;`}
      ${this.getPositionStyles(this.config.position).right ? `right: 20px;` : `left: 20px;`}
      width: 400px;
      height: 650px;
      max-height: calc(100vh - 120px);
      background: ${isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 24px;
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
      box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
      display: none;
      flex-direction: column;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      overflow: hidden;
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `
    
    // Add slide-up animation
    if (!document.getElementById('syntera-window-animations')) {
      const style = document.createElement('style')
      style.id = 'syntera-window-animations'
      style.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `
      document.head.appendChild(style)
    }

    // Header
    const header = this.createHeader()
    this.window.appendChild(header)

    // Messages area with modern styling
    this.messagesContainer = document.createElement('div')
    this.messagesContainer.className = 'syntera-messages'
    this.messagesContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: ${isDark ? 'transparent' : 'transparent'};
    `
    this.window.appendChild(this.messagesContainer)

    // Input area
    this.inputArea = this.createInputArea()
    this.window.appendChild(this.inputArea)

    document.body.appendChild(this.window)
  }

  /**
   * Create header
   */
  private createHeader(): HTMLDivElement {
    const header = document.createElement('div')
    const isDark = this.config.theme === 'dark'
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
      display: flex;
      align-items: center;
      gap: 14px;
      background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
    `

    // Agent avatar - use photo if available, otherwise fallback to gradient/icon
    const avatarUrl = this.config.agent.avatar_url || this.generateAvatarUrl(this.config.agent.id)
    const hasPhotoAvatar = !!this.config.agent.avatar_url
    
    header.innerHTML = `
      <div style="
        width: 48px; 
        height: 48px; 
        border-radius: 50%; 
        ${hasPhotoAvatar 
          ? '' 
          : `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;`}
        flex-shrink: 0;
        overflow: hidden;
        position: relative;
      ">
        ${hasPhotoAvatar 
          ? `<img src="${avatarUrl}" alt="${this.config.agent.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.parentElement.innerHTML='${Icons.chat('white')}'" />` 
          : Icons.chat('white')}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="
          font-weight: 600; 
          font-size: 16px;
          color: ${isDark ? '#fff' : '#1a1a1a'}; 
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        ">
          ${this.config.agent.name}
        </div>
        <div id="syntera-status" style="
          font-size: 13px; 
          color: ${isDark ? '#a0a0a0' : '#666'}; 
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          ${this.isInCall ? '<span>Voice call active</span>' : '<span>Tap to start voice chat</span>'}
        </div>
      </div>
      <button class="syntera-close" style="
        background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; 
        border: none; 
        cursor: pointer; 
        padding: 8px; 
        border-radius: 8px;
        color: ${isDark ? '#a0a0a0' : '#666'}; 
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        ${Icons.close(isDark ? '#a0a0a0' : '#666')}
      </button>
    `

    const closeBtn = header.querySelector('.syntera-close') as HTMLElement
    closeBtn?.addEventListener('mouseenter', () => {
      if (closeBtn) {
        closeBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        closeBtn.style.transform = 'scale(1.1)'
      }
    })
    closeBtn?.addEventListener('mouseleave', () => {
      if (closeBtn) {
        closeBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        closeBtn.style.transform = 'scale(1)'
      }
    })
    closeBtn?.addEventListener('click', () => {
      this.close()
    })

    return header
  }

  /**
   * Create input area
   */
  private createInputArea(): HTMLDivElement {
    const inputArea = document.createElement('div')
    inputArea.className = 'syntera-input-area'
    const isDark = this.config.theme === 'dark'
    inputArea.style.cssText = `
      padding: 16px 20px;
      border-top: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
      display: flex;
      gap: 10px;
      align-items: center;
      background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
    `

    // Voice/End Call button - changes based on call state
    this.updateCallButton(inputArea)

    // Emoji picker button
    this.emojiButton = this.createEmojiButton(isDark)
    inputArea.appendChild(this.emojiButton)

    // Text input with modern styling
    this.input = document.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = this.isInCall ? 'Call in progress...' : 'Type a message...'
    this.input.disabled = this.isInCall
    this.input.style.cssText = `
      flex: 1;
      padding: 12px 16px;
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      border-radius: 12px;
      background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
      color: ${isDark ? '#fff' : '#1a1a1a'};
      font-size: 14px;
      transition: all 0.2s;
      outline: none;
      ${this.isInCall ? 'opacity: 0.5; cursor: not-allowed;' : ''}
    `
    
    if (!this.isInCall) {
      this.input.addEventListener('focus', () => {
        this.input!.style.borderColor = isDark ? 'rgba(102, 126, 234, 0.5)' : '#667eea'
        this.input!.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)'}`
      })
      this.input.addEventListener('blur', () => {
        this.input!.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        this.input!.style.boxShadow = 'none'
      })
    }

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input?.value.trim() && !this.isInCall) {
        this.sendMessage()
      }
    })

    // Modern send button with SVG icon
    const sendBtn = document.createElement('button')
    sendBtn.innerHTML = Icons.send('white')
    sendBtn.disabled = this.isInCall
    sendBtn.style.cssText = `
      background: ${this.isInCall 
        ? (isDark ? 'rgba(156, 163, 175, 0.2)' : '#9ca3af') 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
      border: none;
      color: white;
      padding: 12px 18px;
      border-radius: 12px;
      cursor: ${this.isInCall ? 'not-allowed' : 'pointer'};
      font-size: 18px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: ${this.isInCall ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'};
      ${this.isInCall ? 'opacity: 0.5;' : ''}
      min-width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    if (!this.isInCall) {
      sendBtn.addEventListener('mouseenter', () => {
        sendBtn.style.transform = 'scale(1.05) translateY(-1px)'
        sendBtn.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
      })
      sendBtn.addEventListener('mouseleave', () => {
        sendBtn.style.transform = 'scale(1) translateY(0)'
        sendBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
      })
    }
    sendBtn.addEventListener('click', () => {
      if (this.input?.value.trim() && !this.isInCall) {
        this.sendMessage()
      }
    })

    inputArea.appendChild(this.input)
    inputArea.appendChild(sendBtn)

    // Create emoji picker (initially hidden)
    this.createEmojiPicker(isDark)

    return inputArea
  }

  /**
   * Create emoji button
   */
  private createEmojiButton(isDark: boolean): HTMLButtonElement {
    const emojiBtn = document.createElement('button')
    emojiBtn.type = 'button'
    emojiBtn.className = 'syntera-emoji-button'
    emojiBtn.innerHTML = Icons.emoji(isDark ? '#666' : '#666')
    emojiBtn.disabled = this.isInCall
    emojiBtn.style.cssText = `
      background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
      border: none !important;
      cursor: ${this.isInCall ? 'not-allowed' : 'pointer'} !important;
      padding: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border-radius: 12px !important;
      min-width: 48px !important;
      min-height: 48px !important;
      flex-shrink: 0 !important;
      color: ${isDark ? '#a0a0a0' : '#666'};
      ${this.isInCall ? 'opacity: 0.5;' : ''}
    `
    
    if (!this.isInCall) {
      emojiBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.toggleEmojiPicker()
      })
      emojiBtn.addEventListener('mouseenter', () => {
        emojiBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        emojiBtn.style.transform = 'scale(1.05)'
      })
      emojiBtn.addEventListener('mouseleave', () => {
        emojiBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        emojiBtn.style.transform = 'scale(1)'
      })
    }

    return emojiBtn
  }

  /**
   * Create emoji picker
   */
  private createEmojiPicker(isDark: boolean): void {
    if (!this.window) return

    const pickerContainer = document.createElement('div')
    pickerContainer.className = 'syntera-emoji-picker-container'
    pickerContainer.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 20px;
      right: 20px;
      display: none;
      z-index: 1000000;
    `

    const picker = document.createElement('div')
    picker.className = 'syntera-emoji-picker'
    picker.style.cssText = `
      background: ${isDark ? 'rgba(26, 26, 26, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
      backdrop-filter: blur(20px);
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;
    `

    // Popular emoji categories
    const emojiCategories = [
      { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙'] },
      { name: 'Gestures', emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍'] },
      { name: 'Objects', emojis: ['❤️', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️'] },
      { name: 'Symbols', emojis: ['✅', '❌', '⭕', '❓', '❗', '💯', '🔥', '⭐', '🌟', '💫', '✨', '💥', '💢', '💤', '💨', '🎉', '🎊', '🎈', '🎁', '🏆'] },
    ]

    emojiCategories.forEach(category => {
      const categoryTitle = document.createElement('div')
      categoryTitle.textContent = category.name
      categoryTitle.style.cssText = `
        font-size: 11px;
        font-weight: 600;
        color: ${isDark ? '#888' : '#666'};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 12px 0 8px 0;
      `
      picker.appendChild(categoryTitle)

      const emojiGrid = document.createElement('div')
      emojiGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 4px;
        margin-bottom: 16px;
      `

      category.emojis.forEach(emoji => {
        const emojiBtn = document.createElement('button')
        emojiBtn.textContent = emoji
        emojiBtn.style.cssText = `
          background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
          border: none;
          border-radius: 8px;
          padding: 8px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        `
        emojiBtn.addEventListener('mouseenter', () => {
          emojiBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          emojiBtn.style.transform = 'scale(1.2)'
        })
        emojiBtn.addEventListener('mouseleave', () => {
          emojiBtn.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          emojiBtn.style.transform = 'scale(1)'
        })
        emojiBtn.addEventListener('click', () => {
          if (this.input && !this.isInCall) {
            this.input.value += emoji
            this.input.focus()
          }
        })
        emojiGrid.appendChild(emojiBtn)
      })

      picker.appendChild(emojiGrid)
    })

    pickerContainer.appendChild(picker)
    this.emojiPicker = pickerContainer
    this.window.appendChild(pickerContainer)

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isEmojiPickerOpen && 
          this.emojiPicker && 
          !this.emojiPicker.contains(e.target as Node) &&
          this.emojiButton &&
          !this.emojiButton.contains(e.target as Node)) {
        this.closeEmojiPicker()
      }
    })
  }

  /**
   * Toggle emoji picker
   */
  private toggleEmojiPicker(): void {
    if (this.isEmojiPickerOpen) {
      this.closeEmojiPicker()
    } else {
      this.openEmojiPicker()
    }
  }

  /**
   * Open emoji picker
   */
  private openEmojiPicker(): void {
    if (this.emojiPicker && !this.isInCall) {
      this.emojiPicker.style.display = 'block'
      this.isEmojiPickerOpen = true
    }
  }

  /**
   * Close emoji picker
   */
  private closeEmojiPicker(): void {
    if (this.emojiPicker) {
      this.emojiPicker.style.display = 'none'
      this.isEmojiPickerOpen = false
    }
  }

  /**
   * Update call button (voice button or end call button)
   */
  private updateCallButton(container: HTMLDivElement): void {
    // Remove existing call button if any
    const existingBtn = container.querySelector('.syntera-call-button')
    if (existingBtn) {
      existingBtn.remove()
    }

    const callButton = document.createElement('button')
    callButton.className = 'syntera-call-button'
    callButton.type = 'button' // Prevent form submission
    
    if (this.isInCall) {
      // Modern end call button with SVG icon
      callButton.innerHTML = Icons.phone('white')
      callButton.title = 'End Call'
      callButton.setAttribute('aria-label', 'End Call')
      callButton.style.cssText = `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        border: none !important;
        color: white !important;
        cursor: pointer !important;
        font-size: 20px !important;
        padding: 12px 18px !important;
        border-radius: 12px !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 48px !important;
        min-height: 48px !important;
        flex-shrink: 0 !important;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
      `
      callButton.addEventListener('mouseenter', () => {
        callButton.style.transform = 'scale(1.05) translateY(-1px)'
        callButton.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4) !important'
      })
      callButton.addEventListener('mouseleave', () => {
        callButton.style.transform = 'scale(1) translateY(0)'
        callButton.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3) !important'
      })
      callButton.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        callButton.disabled = true
        callButton.style.opacity = '0.5'
        try {
          await this.config.onEndCall()
        } catch (error) {
          logger.error('Failed to end call:', error)
        } finally {
          callButton.disabled = false
          callButton.style.opacity = '1'
        }
      })
    } else {
      // Modern voice button with SVG icon
      const isDark = this.config.theme === 'dark'
      callButton.innerHTML = Icons.mic(isDark ? '#666' : '#666')
      callButton.title = 'Start Voice Call'
      callButton.setAttribute('aria-label', 'Start Voice Call')
      callButton.style.cssText = `
        background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 20px !important;
        padding: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 12px !important;
        min-width: 48px !important;
        min-height: 48px !important;
        flex-shrink: 0 !important;
      `
      callButton.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.config.onStartCall('voice')
      })
      callButton.addEventListener('mouseenter', () => {
        callButton.style.transform = 'scale(1.05)'
        callButton.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      })
      callButton.addEventListener('mouseleave', () => {
        callButton.style.transform = 'scale(1)'
        callButton.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      })
    }

    // Insert at the beginning
    if (container.firstChild) {
      container.insertBefore(callButton, container.firstChild)
    } else {
      container.appendChild(callButton)
    }
    
  }

  /**
   * Send message
   */
  private async sendMessage(): Promise<void> {
    if (!this.input?.value.trim()) return

    const content = this.input.value.trim()
    this.input.value = ''

    // Store temp message ID to replace it later
    const tempId = `temp-${Date.now()}`
    
    // Add user message to UI immediately (optimistic update)
    this.addMessage({
      id: tempId,
      conversation_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    })

    // Send to API - the response will replace the temp message
    await this.config.onSendMessage(content, tempId)
  }

  /**
   * Add message to UI
   */
  addMessage(message: Message, replaceTempId?: string): void {
    if (!this.messagesContainer) return

    // If we need to replace a temp message, find and replace it
    if (replaceTempId) {
      const tempMessageEl = this.messagesContainer.querySelector(`[data-message-id="${replaceTempId}"]`)
      if (tempMessageEl) {
        tempMessageEl.remove()
      }
    }

    // Check if message already exists (prevent duplicates)
    const existingMessage = this.messagesContainer.querySelector(`[data-message-id="${message.id}"]`)
    if (existingMessage) {
      return // Message already exists, don't add duplicate
    }

    // During calls, add messages but keep them below the voice circle
    // The voice circle should stay at the top of the messages container

    const messageEl = document.createElement('div')
    messageEl.className = `syntera-message syntera-message-${message.role}`
    messageEl.setAttribute('data-message-id', message.id)
    
    const isUser = message.role === 'user'
    messageEl.style.cssText = `
      display: flex;
      gap: 8px;
      align-self: ${isUser ? 'flex-end' : 'flex-start'};
      max-width: 85%;
      flex-direction: ${isUser ? 'row-reverse' : 'row'};
      margin-left: ${isUser ? 'auto' : '0'};
      margin-right: ${isUser ? '0' : 'auto'};
      width: fit-content;
      ${isUser ? 'margin-left: auto;' : ''}
    `

    // Modern avatar with SVG icon and gradient
    if (!isUser) {
      const avatar = document.createElement('div')
      avatar.innerHTML = Icons.chat('white')
      avatar.style.cssText = `
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      `
      messageEl.appendChild(avatar)
    } else {
      // User avatar with SVG icon and gradient
      const avatar = document.createElement('div')
      const isDark = this.config.theme === 'dark'
      avatar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="7" r="4" stroke="white" stroke-width="2"/>
          <path d="M3 19C3 15 6.58172 12 10 12C13.4183 12 17 15 17 19" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `
      avatar.style.cssText = `
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      `
      messageEl.appendChild(avatar)
    }

    // Modern message content with emoji support
    const content = document.createElement('div')
    const isDark = this.config.theme === 'dark'
    content.style.cssText = `
      padding: 12px 16px;
      border-radius: ${isUser ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};
      background: ${isUser 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Gradient for user messages
        : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)')}; // Subtle background for agent
      color: ${isUser ? '#ffffff' : (isDark ? '#e5e5e5' : '#1a1a1a')};
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      max-width: 100%;
      box-shadow: ${isUser 
        ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
        : (isDark ? '0 2px 8px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.08)')};
      border: ${isUser ? 'none' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`};
      transition: transform 0.2s;
    `
    // Clean content - remove JSON array formatting if present
    let cleanContent = message.content
    if (cleanContent.startsWith('[') && cleanContent.endsWith(']')) {
      try {
        const parsed = JSON.parse(cleanContent)
        if (Array.isArray(parsed) && parsed.length > 0) {
          cleanContent = String(parsed[0])
        } else if (typeof parsed === 'string') {
          cleanContent = parsed
        }
      } catch {
        // If JSON parsing fails, just remove brackets
        cleanContent = cleanContent.replace(/^\[|\]$/g, '').replace(/^["']|["']$/g, '')
      }
    }
    // Support emojis in messages
    content.innerHTML = this.formatMessageWithEmojis(cleanContent)
    messageEl.appendChild(content)

    this.messagesContainer.appendChild(messageEl)
    
    // Hide empty state if it exists
    const emptyState = this.messagesContainer.querySelector('.syntera-empty-state')
    if (emptyState) {
      emptyState.remove()
    }
    
    this.scrollToBottom()
  }

  /**
   * Start call with animated voice circle
   */
  async startCall(config: CallConfig): Promise<void> {
    if (!this.window || !this.messagesContainer) return

    this.isInCall = true

    // Update header status
    const statusEl = this.window.querySelector('#syntera-status')
    if (statusEl) {
      statusEl.innerHTML = '<span>Voice call active</span>'
    }

    // Update input area - show end call button and disable input
    // Fallback: find input area if not set
    if (!this.inputArea && this.window) {
      this.inputArea = this.window.querySelector('.syntera-input-area') as HTMLDivElement
      if (!this.inputArea) {
        // Find the last div child (input area)
        const children = Array.from(this.window.children)
        const lastDiv = children[children.length - 1] as HTMLDivElement
        if (lastDiv && lastDiv.style.padding) {
          this.inputArea = lastDiv
          this.inputArea.classList.add('syntera-input-area')
        }
      }
    }
    
    if (this.inputArea) {
      this.updateCallButton(this.inputArea)
      
      if (this.input) {
        this.input.placeholder = 'Call in progress...'
        this.input.disabled = true
        this.input.style.opacity = '0.5'
        this.input.style.cursor = 'not-allowed'
      }
      // Close emoji picker and disable emoji button during call
      this.closeEmojiPicker()
      if (this.emojiButton) {
        this.emojiButton.disabled = true
        this.emojiButton.style.opacity = '0.5'
        this.emojiButton.style.cursor = 'not-allowed'
      }
      const sendBtn = this.inputArea.querySelector('button:last-child') as HTMLButtonElement
      if (sendBtn && !sendBtn.classList.contains('syntera-call-button')) {
        sendBtn.disabled = true
        sendBtn.style.background = '#9ca3af'
        sendBtn.style.opacity = '0.5'
        sendBtn.style.cursor = 'not-allowed'
      }
    } else {
      logger.error('Input area not found!', { window: this.window, inputArea: this.inputArea })
    }

    // Show ChatGPT-style animated voice circle
    this.showVoiceCircle()
  }

  /**
   * End call and restore UI
   */
  endCall(): void {
    this.isInCall = false

    // Update header status
    const statusEl = this.window?.querySelector('#syntera-status')
    if (statusEl) {
      statusEl.innerHTML = '<span>Tap to start voice chat</span>'
    }

    // Update input area - show voice button and enable input
    if (this.inputArea) {
      this.updateCallButton(this.inputArea)
      if (this.input) {
        this.input.placeholder = 'Type a message...'
        this.input.disabled = false
        this.input.style.opacity = '1'
        this.input.style.cursor = 'text'
      }
      // Re-enable emoji button after call
      if (this.emojiButton) {
        this.emojiButton.disabled = false
        this.emojiButton.style.opacity = '1'
        this.emojiButton.style.cursor = 'pointer'
      }
      const sendBtn = this.inputArea.querySelector('button:last-child') as HTMLButtonElement
      if (sendBtn) {
        sendBtn.disabled = false
        sendBtn.style.background = '#3b82f6'
        sendBtn.style.opacity = '1'
        sendBtn.style.cursor = 'pointer'
      }
    }

    // Remove voice circle
    const voiceCircle = this.messagesContainer?.querySelector('#syntera-voice-circle')
    if (voiceCircle) {
      voiceCircle.remove()
    }
    this.voiceCircle = null
    this.stopAudioMonitoring()
  }

  /**
   * Set up audio analyser for voice detection
   */
  setupAudioAnalyser(audioTrack: MediaStreamTrack): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]))
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      
      source.connect(analyser)
      this.audioAnalyser = analyser
      
      // Start monitoring audio levels
      this.monitorAudioLevels()
    } catch (error) {
      logger.warn('Failed to setup audio analyser:', error)
    }
  }

  /**
   * Monitor audio levels and animate circle when voice is active
   */
  private monitorAudioLevels(): void {
    if (!this.audioAnalyser) return

    const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount)
    
    const checkAudio = () => {
      if (!this.audioAnalyser) return
      
      this.audioAnalyser.getByteFrequencyData(dataArray)
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
      
      // Threshold for voice activity (adjust as needed)
      const threshold = 20
      const isActive = average > threshold
      
      if (isActive !== this.isVoiceActive) {
        this.setVoiceActive(isActive)
      }
      
      this.animationFrameId = requestAnimationFrame(checkAudio)
    }
    
    checkAudio()
  }

  /**
   * Stop audio monitoring
   */
  stopAudioMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.audioAnalyser = null
    this.setVoiceActive(false)
  }

  /**
   * Show ElevenLabs-style animated orb
   */
  private showVoiceCircle(): void {
    if (!this.messagesContainer) return

    // Remove existing circle if any
    const existingCircle = this.messagesContainer.querySelector('#syntera-voice-circle')
    if (existingCircle) {
      existingCircle.remove()
    }

    // Create orb container
    const orbContainer = document.createElement('div')
    orbContainer.id = 'syntera-voice-circle'
    orbContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      margin: 20px 0;
    `

    // Create wrapper div for the orb effect (ElevenLabs style - darker, more dynamic)
    const orbWrapper = document.createElement('div')
    orbWrapper.style.cssText = `
      position: relative;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: 
        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8) 40%),
        radial-gradient(circle at 80% 80%, rgba(30, 64, 175, 0.6), transparent 60%),
        radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.7), transparent 80%),
        linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(30, 64, 175, 0.95) 100%);
      box-shadow: 
        inset 0 0 100px rgba(59, 130, 246, 0.8),
        inset -30px -30px 60px rgba(30, 64, 175, 0.6),
        inset 30px 30px 60px rgba(96, 165, 250, 0.4),
        0 0 0 2px rgba(59, 130, 246, 0.3),
        0 20px 60px rgba(37, 99, 235, 0.6),
        0 0 80px rgba(59, 130, 246, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: orbRotate 20s linear infinite;
    `

    // Create inner orb layers for 3D effect (darker, more dynamic)
    const innerOrb = document.createElement('div')
    innerOrb.style.cssText = `
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: 
        radial-gradient(circle at 25% 25%, rgba(147, 197, 253, 0.5), transparent 60%),
        radial-gradient(circle at 75% 75%, rgba(96, 165, 250, 0.3), transparent 70%),
        radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2), transparent 80%);
      animation: orbFloat 3s ease-in-out infinite, orbRotateInner 15s linear infinite reverse;
      filter: blur(1px);
    `
    
    // Add a second inner layer for more depth
    const innerOrb2 = document.createElement('div')
    innerOrb2.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, rgba(191, 219, 254, 0.3), transparent 70%);
      animation: orbPulseInner 2.5s ease-in-out infinite;
    `

    // Create dynamic shimmer effect (darker, more visible)
    const shimmer = document.createElement('div')
    shimmer.style.cssText = `
      position: absolute;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent 20%,
        rgba(147, 197, 253, 0.2) 40%,
        rgba(96, 165, 250, 0.3) 50%,
        rgba(147, 197, 253, 0.2) 60%,
        transparent 80%
      );
      animation: orbShimmer 2.5s ease-in-out infinite;
      top: -50%;
      left: -50%;
      filter: blur(2px);
    `
    
    // Add outer glow ring
    const glowRing = document.createElement('div')
    glowRing.style.cssText = `
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      border: 2px solid rgba(59, 130, 246, 0.3);
      box-shadow: 
        0 0 40px rgba(59, 130, 246, 0.5),
        inset 0 0 40px rgba(59, 130, 246, 0.2);
      animation: orbGlow 3s ease-in-out infinite;
      top: -10px;
      left: -10px;
    `

    // Add CSS animations for orb
    if (!document.getElementById('syntera-orb-animations')) {
      const style = document.createElement('style')
      style.id = 'syntera-orb-animations'
      style.textContent = `
        @keyframes orbRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes orbRotateInner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        @keyframes orbFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.05);
          }
        }
        @keyframes orbPulseInner {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes orbShimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(360deg);
            opacity: 0.3;
          }
        }
        @keyframes orbGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
            box-shadow: 
              0 0 40px rgba(59, 130, 246, 0.5),
              inset 0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
            box-shadow: 
              0 0 60px rgba(59, 130, 246, 0.7),
              inset 0 0 50px rgba(59, 130, 246, 0.4);
          }
        }
        @keyframes orbPulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            box-shadow: 
              inset 0 0 100px rgba(59, 130, 246, 0.8),
              inset -30px -30px 60px rgba(30, 64, 175, 0.6),
              inset 30px 30px 60px rgba(96, 165, 250, 0.4),
              0 0 0 2px rgba(59, 130, 246, 0.3),
              0 20px 60px rgba(37, 99, 235, 0.6),
              0 0 80px rgba(59, 130, 246, 0.4);
          }
          50% {
            transform: scale(1.05) rotate(5deg);
            box-shadow: 
              inset 0 0 120px rgba(59, 130, 246, 1),
              inset -30px -30px 70px rgba(30, 64, 175, 0.7),
              inset 30px 30px 70px rgba(96, 165, 250, 0.5),
              0 0 0 3px rgba(59, 130, 246, 0.5),
              0 25px 70px rgba(37, 99, 235, 0.8),
              0 0 100px rgba(59, 130, 246, 0.6);
          }
        }
        @keyframes orbTalking {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            box-shadow: 
              inset 0 0 120px rgba(59, 130, 246, 1),
              inset -30px -30px 70px rgba(30, 64, 175, 0.7),
              inset 30px 30px 70px rgba(96, 165, 250, 0.5),
              0 0 0 3px rgba(59, 130, 246, 0.5),
              0 0 0 0 rgba(59, 130, 246, 0.6),
              0 25px 70px rgba(37, 99, 235, 0.8),
              0 0 100px rgba(59, 130, 246, 0.6);
          }
          50% {
            transform: scale(1.12) rotate(-5deg);
            box-shadow: 
              inset 0 0 140px rgba(59, 130, 246, 1),
              inset -35px -35px 80px rgba(30, 64, 175, 0.8),
              inset 35px 35px 80px rgba(96, 165, 250, 0.6),
              0 0 0 4px rgba(59, 130, 246, 0.7),
              0 0 0 30px rgba(59, 130, 246, 0),
              0 30px 80px rgba(37, 99, 235, 1),
              0 0 120px rgba(59, 130, 246, 0.8);
          }
        }
        .syntera-orb-listening {
          animation: orbPulse 1.8s ease-in-out infinite, orbRotate 20s linear infinite !important;
        }
        .syntera-orb-talking {
          animation: orbTalking 1s ease-in-out infinite, orbRotate 15s linear infinite !important;
        }
      `
      document.head.appendChild(style)
    }

    orbWrapper.appendChild(innerOrb)
    orbWrapper.appendChild(innerOrb2)
    orbWrapper.appendChild(shimmer)
    orbContainer.appendChild(orbWrapper)
    orbContainer.appendChild(glowRing)
    this.voiceCircle = orbWrapper

    // Insert at the beginning of messages container
    const firstChild = this.messagesContainer.firstChild
    if (firstChild) {
      this.messagesContainer.insertBefore(orbContainer, firstChild)
    } else {
      this.messagesContainer.appendChild(orbContainer)
    }

    // Start with listening state
    this.voiceCircle.classList.add('syntera-orb-listening')
  }

  /**
   * Set voice active state (animate orb when agent is speaking)
   */
  setVoiceActive(active: boolean): void {
    this.isVoiceActive = active
    if (this.voiceCircle) {
      // Remove all state classes
      this.voiceCircle.classList.remove('syntera-orb-listening', 'syntera-orb-talking')
      
      if (active) {
        // Agent is talking
        this.voiceCircle.classList.add('syntera-orb-talking')
      } else {
        // Agent is listening
        this.voiceCircle.classList.add('syntera-orb-listening')
      }
    }
    
    // Update status in header
    const statusEl = this.window?.querySelector('#syntera-status')
    if (statusEl) {
      if (this.isInCall) {
        statusEl.innerHTML = active 
          ? '<span>Agent is speaking...</span>' 
          : '<span>Listening...</span>'
      }
    }
  }

  /**
   * Get wave icon SVG (no longer used, but kept for compatibility)
   */
  private getWaveIcon(): string {
    return '🎤' // Mic emoji
  }

  /**
   * Format message with emoji support
   */
  private formatMessageWithEmojis(text: string): string {
    // Escape HTML but preserve emojis
    const div = document.createElement('div')
    div.textContent = text
    const escaped = div.innerHTML
    
    // Convert emoji shortcodes if needed (e.g., :smile: -> 😊)
    // For now, just return the text as-is (emojis are already Unicode)
    return escaped.replace(/\n/g, '<br>')
  }

  /**
   * Set typing indicator
   */
  setTyping(isTyping: boolean): void {
    // TODO: Implement typing indicator
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    // TODO: Show error in UI
    logger.error(message)
  }

  /**
   * Toggle chat window
   */
  toggle(): void {
    if (this.isOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  /**
   * Open chat window
   */
  open(): void {
    if (this.window) {
      this.window.style.display = 'flex'
      this.isOpen = true
      if (this.input) {
        this.input.focus()
      }
    }
  }

  /**
   * Close chat window
   */
  close(): void {
    // Prevent infinite recursion
    if (this.isClosing) {
      return
    }
    this.isClosing = true

    try {
      if (this.window) {
        this.window.style.display = 'none'
        this.isOpen = false
      }
      // Close emoji picker if open
      this.closeEmojiPicker()
      // Stop audio monitoring when closing
      this.stopAudioMonitoring()
      // Call callback (the widget's handleClose has its own guard to prevent recursion)
      if (this.config.onClose) {
        this.config.onClose()
      }
    } finally {
      // Reset flag after a short delay to allow cleanup
      setTimeout(() => {
        this.isClosing = false
      }, 100)
    }
  }

  /**
   * Get position styles
   */
  private getPositionStyles(position: string): Record<string, string> {
    const styles: Record<string, string> = {}
    
    if (position.includes('bottom')) {
      styles.bottom = '20px'
    } else {
      styles.top = '20px'
    }
    
    if (position.includes('right')) {
      styles.right = '20px'
    } else {
      styles.left = '20px'
    }
    
    return styles
  }

  /**
   * Generate avatar URL (using DiceBear or similar)
   */
  private generateAvatarUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=128`
  }

  /**
   * Scroll to bottom
   */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight
    }
  }

  /**
   * Attach styles
   */
  private attachStyles(): void {
    // Styles are mostly inline for simplicity
    // Can be extracted to CSS file if needed
  }
}


