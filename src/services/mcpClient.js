class MCPClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
    this.sessionId = null;
    this.eventSource = null;
    this.messageHandlers = new Map();
  }

  // Initialize MCP connection with retry logic
  async initialize(walletAddress, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
    
    try {
      this.sessionId = this.generateSessionId();
      
      // Initialize MCP session
      const initResponse = await this.sendMCPRequest({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          clientInfo: {
            name: 'chimpx-frontend',
            version: '1.0.0',
          },
        },
      }, walletAddress);

      if (initResponse.result) {
        console.log('MCP initialized successfully:', initResponse.result);
        this.isConnected = true;
        
        // Set up SSE connection for real-time updates
        this.setupSSEConnection();
        
        return true;
      }
      
      throw new Error('Failed to initialize MCP connection');
    } catch (error) {
      console.error(`MCP initialization failed (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.initialize(walletAddress, retryCount + 1);
      }
      
      this.isConnected = false;
      this.notifyHandlers('connection_failed', { error: error.message, retries: retryCount });
      return false;
    }
  }

  // Set up Server-Sent Events connection
  setupSSEConnection() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const sseUrl = `${this.baseUrl}/mcp?sessionId=${this.sessionId}`;
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleSSEMessage(event.type, data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE connected:', data);
    });

    this.eventSource.addEventListener('tool_execution', (event) => {
      const data = JSON.parse(event.data);
      console.log('Tool execution update:', data);
      this.notifyHandlers('tool_execution', data);
    });

    this.eventSource.addEventListener('tool_error', (event) => {
      const data = JSON.parse(event.data);
      console.error('Tool execution error:', data);
      this.notifyHandlers('tool_error', data);
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (this.isConnected) {
          this.setupSSEConnection();
        }
      }, 5000);
    };
  }

  // Send MCP request
  async sendMCPRequest(request, walletAddress) {
    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          walletAddress,
          request,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  // Send message to MCP server
  async sendMessage(message, conversationId = null) {
    try {
      // Analyze message to determine tools and clarifications
      const { tools, clarifications } = this.analyzeMessageForTools(message);
      
      // If there are clarifications needed, return them immediately
      if (clarifications.length > 0) {
        return {
          success: true,
          data: {
            response: clarifications[0].message,
            conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sessionId: this.sessionId,
            type: 'clarification',
            clarification: clarifications[0]
          }
        };
      }
      
      const requestData = {
        message,
        conversationId,
        sessionId: this.sessionId,
        tools: tools.length > 0 ? tools : undefined,
      };

      console.log('Sending MCP request:', requestData);

      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('MCP response:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Process user message with AI and tools
  async processMessage(message, walletAddress, conversationId) {
    try {
      // Try to initialize connection if not connected
      if (!this.isConnected) {
        const initialized = await this.initialize(walletAddress);
        if (!initialized) {
          return this.getFallbackResponse(message, conversationId, 'Connection failed');
        }
      }

      // Send user message directly to Claude via MCP for natural language processing
      // This follows the Claude Desktop pattern where LLM decides tool usage
      const chatResponse = await Promise.race([
        this.sendMCPRequest({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'completion/complete',
          params: {
            prompt: {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: message
                  }
                }
              ]
            },
            includeContext: 'thisServer'
          }
        }, walletAddress),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Chat completion timeout')), 30000)
        )
      ]);

      console.log('Claude response:', chatResponse);

      // Handle structured response from backend
      const responseType = chatResponse.result?.type || 'text';
      const transaction = chatResponse.result?.transaction;
      
      // Format response based on type
      switch (responseType) {
        case 'swap':
          if (transaction) {
            // Format transaction for TransactionCard compatibility
            const formattedTransaction = {
              quote: {
                fromToken: transaction.fromToken,
                toToken: transaction.toToken,
                amountIn: transaction.amountIn,
                amountOut: transaction.amountOut,
                priceImpact: transaction.priceImpact,
                route: transaction.route,
                gasEstimate: transaction.gasEstimate,
                slippage: transaction.slippage
              },
              fromAsset: transaction.fromAsset,
              toAsset: transaction.toAsset,
              simulateSwap: transaction.simulateSwap
            };
            
            return {
              success: true,
              data: {
                response: chatResponse.result?.content?.[0]?.text || 'Check Details for the swap transaction',
                conversationId: conversationId || this.generateConversationId(),
                sessionId: this.sessionId,
                type: 'quote',
                transaction: formattedTransaction
              }
            };
          }
          break;
          
        case 'stake':
          if (transaction) {
            return {
              success: true,
              data: {
                response: chatResponse.result?.content?.[0]?.text || 'Here\'s your staking transaction:',
                conversationId: conversationId || this.generateConversationId(),
                sessionId: this.sessionId,
                type: 'stake',
                quote: transaction
              }
            };
          }
          break;
          
        case 'unstake':
          if (transaction) {
            return {
              success: true,
              data: {
                response: chatResponse.result?.content?.[0]?.text || 'Here\'s your unstaking transaction:',
                conversationId: conversationId || this.generateConversationId(),
                sessionId: this.sessionId,
                type: 'unstake',
                quote: transaction
              }
            };
          }
          break;
          
        case 'balance':
          if (transaction) {
            return {
              success: true,
              data: {
                response: chatResponse.result?.content?.[0]?.text || 'Here\'s your wallet balance:',
                conversationId: conversationId || this.generateConversationId(),
                sessionId: this.sessionId,
                type: 'balance',
                balances: transaction
              }
            };
          }
          break;
      }

      // Return the response from Claude for conversational responses
      return {
        success: true,
        data: {
          response: chatResponse.result?.content?.[0]?.text || 'I apologize, but I encountered an issue processing your request.',
          conversationId: conversationId || this.generateConversationId(),
          sessionId: this.sessionId,
          type: 'text',
          toolCalls: chatResponse.result?.toolCalls || [],
          toolResults: chatResponse.result?.toolResults || []
        }
      };

    } catch (error) {
      console.error('Error processing message:', error);
      
      // If MCP fails, try fallback response
      if (error.message.includes('timeout') || error.message.includes('fetch')) {
        this.isConnected = false;
        return this.getFallbackResponse(message, conversationId, 'Service temporarily unavailable');
      }
      
      return {
        success: false,
        error: {
          message: error.message,
          code: 'MCP_ERROR',
        },
      };
    }
  }

  // Fallback response when MCP is unavailable
  getFallbackResponse(message, conversationId, reason) {
    const fallbackText = "I'm currently experiencing connectivity issues with the AI assistant. Please try again in a moment. If the issue persists, you can perform TON blockchain operations directly through your wallet app.";
    
    return {
      success: true,
      data: {
        response: fallbackText,
        conversationId: conversationId || this.generateConversationId(),
        type: 'text',
        fallback: true,
        reason,
      },
    };
  }

  // Analyze message to determine which tools to use
  // Legacy method removed - now using pure MCP flow where Claude handles natural language understanding

  // Format tool results for UI display
  formatToolResults(originalMessage, results) {
    if (results.length === 0) {
      return {
        success: true,
        data: {
          response: "I couldn't find any specific actions to perform. Please be more specific about what you'd like to do.",
          type: 'text',
        },
      };
    }

    // Handle different types of results
    for (const result of results) {
      if (result.tool === 'getSwapQuote' && result.result) {
        return {
          success: true,
          data: {
            response: `Here's your swap quote:`,
            type: 'quote',
            quote: result.result,
            conversationId: this.generateConversationId(),
            sessionId: this.sessionId,
          },
        };
      }

      if (result.tool === 'getStakeQuote' && result.result) {
        return {
          success: true,
          data: {
            response: `Here's your staking quote:`,
            type: 'stake',
            quote: result.result,
            conversationId: this.generateConversationId(),
            sessionId: this.sessionId,
          },
        };
      }

      if (result.tool === 'getUnstakeQuote' && result.result) {
        return {
          success: true,
          data: {
            response: `Here's your unstaking quote:`,
            type: 'unstake',
            quote: result.result,
            conversationId: this.generateConversationId(),
            sessionId: this.sessionId,
          },
        };
      }

      if ((result.tool === 'getTonBalance' || result.tool === 'getJettonBalances') && result.result) {
        return {
          success: true,
          data: {
            response: `Here are your current balances:`,
            type: 'balance',
            balances: result.result,
            conversationId: this.generateConversationId(),
            sessionId: this.sessionId,
          },
        };
      }
    }

    // Default response with results
    return {
      success: true,
      data: {
        response: `I've executed the requested operations. Here are the results: ${JSON.stringify(results, null, 2)}`,
        type: 'text',
        conversationId: this.generateConversationId(),
        sessionId: this.sessionId,
      },
    };
  }

  // Event handling
  onMessage(event, handler) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event).push(handler);
  }

  notifyHandlers(event, data) {
    const handlers = this.messageHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  handleSSEMessage(type, data) {
    console.log('SSE message received:', type, data);
    this.notifyHandlers(type, data);
  }

  // Utility methods
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateConversationId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  disconnect() {
    this.isConnected = false;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.sessionId) {
      // Clean up session on server
      fetch(`${this.baseUrl}/mcp/${this.sessionId}`, {
        method: 'DELETE',
      }).catch(error => {
        console.error('Error cleaning up session:', error);
      });
    }
  }
}

// Create singleton instance
const mcpClient = new MCPClient();

export default mcpClient;