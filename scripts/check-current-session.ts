import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

async function checkSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  
  if (!token) {
    console.log('No auth token found')
    return
  }
  
  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    console.log('Current user session:')
    console.log(JSON.stringify(payload, null, 2))
  } catch (error) {
    console.error('Error verifying token:', error)
  }
}

checkSession()
