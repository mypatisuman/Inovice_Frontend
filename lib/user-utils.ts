import { userApi, User } from './api'

// Default user for development (without authentication)
const DEFAULT_USER: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  username: 'default',
  email: 'default@invoiceapp.com',
  password: 'default123',
  fullName: 'Default User',
  phoneNumber: '+1234567890',
  emailVerified: true,
  provider: 'local',
  providerId: 'default'
}

let defaultUserId: string | null = null

export async function getDefaultUserId(): Promise<string> {
  if (defaultUserId) {
    return defaultUserId
  }

  try {
    // Try to get all users first
    const usersResponse = await userApi.getAll()
    
    if (usersResponse.data && usersResponse.data.length > 0) {
      // Use the first available user
      defaultUserId = usersResponse.data[0].id
      return defaultUserId
    }

    // If no users exist, create a default user
    const createResponse = await userApi.create(DEFAULT_USER)
    
    if (createResponse.data) {
      defaultUserId = createResponse.data.id
      return defaultUserId
    }

    throw new Error('Failed to create default user')
  } catch (error) {
    console.error('Error getting default user ID:', error)
    // Fallback to a hardcoded ID that should work
    return '00000000-0000-0000-0000-000000000001'
  }
}

export function resetDefaultUserId() {
  defaultUserId = null
} 