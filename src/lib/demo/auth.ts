// Demo authentication for testing without Supabase
// WARNING: This is for demo purposes only. Never use in production!

interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  password: string;
}

// Demo users database (in-memory)
const demoUsers: DemoUser[] = [
  {
    id: 'admin-001',
    email: 'lirong',
    name: 'Li Rong',
    role: 'admin',
    password: 'Qq221122?@'
  }
];

// Store current user in sessionStorage
export const demoAuth = {
  signIn: async (email: string, password: string) => {
    const user = demoUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Store user in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('demo_user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }));
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { name: user.name }
      }
    };
  },
  
  signOut: async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('demo_user');
    }
  },
  
  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('demo_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          data: {
            user: {
              id: user.id,
              email: user.email
            }
          }
        };
      }
    }
    return { data: { user: null } };
  },
  
  getUserProfile: (userId: string) => {
    const userStr = typeof window !== 'undefined' ? sessionStorage.getItem('demo_user') : null;
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.id === userId) {
        return { data: user, error: null };
      }
    }
    return { data: null, error: 'User not found' };
  },
  
  // Add a new user (admin only)
  createUser: (newUser: Omit<DemoUser, 'id'>) => {
    const id = `user-${Date.now()}`;
    const user = { ...newUser, id };
    demoUsers.push(user);
    return { data: { user }, error: null };
  },
  
  // Get all users (admin only)
  getAllUsers: () => {
    return demoUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_credits: [{
        sms_credits: 100,
        voice_credits: 10
      }],
      phone_numbers: [{ count: 0 }]
    }));
  }
};

// Demo mode flag
export const isDemoMode = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here';
}; 