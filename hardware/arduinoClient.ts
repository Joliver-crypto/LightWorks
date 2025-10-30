/*
 * Arduino Serial Communication Client
 * 
 * Handles communication with Arduino-based devices via serial port
 * For now, this is a mock implementation that simulates Arduino communication
 * In a real implementation, this would use Web Serial API or Electron's serial communication
 */

export interface ArduinoResponse {
  success: boolean
  message: string
  data?: any
}

export class ArduinoClient {
  private isConnected = false
  private port: string = ''
  private heartbeatInterval: NodeJS.Timeout | null = null
  
  constructor(port: string = '') {
    this.port = port
  }
  
  async connect(): Promise<boolean> {
    try {
      console.log(`Attempting to connect to Arduino...`)
      
      // Check if we're in an Electron environment
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        console.log('Electron API available:', Object.keys((window as any).electronAPI))
        
        if (!(window as any).electronAPI.connectSerial) {
          console.error('connectSerial function not available on electronAPI')
          return false
        }
        
        try {
          // Use Electron's serial communication
          const result = await (window as any).electronAPI.connectSerial({
            port: this.port || 'auto',
            baudRate: 9600
          })
          
          if (result.success) {
            this.isConnected = true
            console.log('Arduino connected successfully via USB')
            this.startHeartbeat()
            return true
          } else {
            console.log('Failed to connect to Arduino:', result.error)
            return false
          }
        } catch (error) {
          console.error('Electron serial connection failed:', error)
          return false
        }
      } else {
        // Fallback for web environment - would need Web Serial API
        console.log('Web Serial API not available - would need browser support')
        return false
      }
    } catch (error) {
      console.error('Failed to connect to Arduino:', error)
      return false
    }
  }
  
  async disconnect(): Promise<void> {
    this.stopHeartbeat()
    this.isConnected = false
    console.log('Arduino disconnected')
  }
  
  private startHeartbeat(): void {
    // Send STATUS command every 3 seconds to keep Arduino alive
    this.heartbeatInterval = setInterval(async () => {
      if (this.isConnected) {
        try {
          await this.sendCommand('STATUS')
        } catch (error) {
          console.warn('Heartbeat failed:', error)
        }
      }
    }, 3000) // 3 seconds
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
  
  async sendCommand(command: string): Promise<ArduinoResponse> {
    if (!this.isConnected) {
      return {
        success: false,
        message: 'Arduino not connected - try connecting first'
      }
    }
    
    try {
      console.log(`Sending command to Arduino: ${command}`)
      
      // Check if we're in an Electron environment
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        try {
          // Use Electron's serial communication
          const result = await (window as any).electronAPI.sendSerialCommand(command)
          
          if (result.success) {
            return {
              success: true,
              message: result.response || 'Command executed successfully',
              data: result.data
            }
          } else {
            return {
              success: false,
              message: result.error || 'Command failed'
            }
          }
        } catch (error) {
          return {
            success: false,
            message: `Serial communication error: ${error}`
          }
        }
      } else {
        return {
          success: false,
          message: 'Serial communication not available'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Command failed: ${error}`
      }
    }
  }
  
  get connected(): boolean {
    return this.isConnected
  }
}

// Singleton instance for the application
export const arduinoClient = new ArduinoClient('auto') // Auto-detect port

// Helper function to execute Arduino commands
export async function executeArduinoCommand(command: string): Promise<ArduinoResponse> {
  // Always try to connect if not connected
  if (!arduinoClient.connected) {
    const connected = await arduinoClient.connect()
    if (!connected) {
      return {
        success: false,
        message: 'Failed to connect to Arduino'
      }
    }
  }
  
  return await arduinoClient.sendCommand(command)
}

// Helper function to establish persistent connection
export async function connectToArduino(): Promise<boolean> {
  return await arduinoClient.connect()
}

// Helper function to disconnect
export async function disconnectFromArduino(): Promise<void> {
  await arduinoClient.disconnect()
}


