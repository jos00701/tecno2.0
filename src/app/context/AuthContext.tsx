import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  userType?: string;
  bio?: string;
  specialty?: string;
  rating?: number;
  reviewCount?: number;
  avatar?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, userType: 'Cliente' | 'Técnico') => Promise<void>;
  logout: () => void;
  updateUser?: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

interface MockAccount {
  user: User;
  password: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  {
    password: 'Cliente2024',
    user: {
      id: 'cli-001',
      name: 'María González Reyes',
      email: 'maria.gonzalez@tecnoconnect.mx',
      phone: '+52 55 3344 5566',
      location: 'Colonia Narvarte, CDMX',
      userType: 'Cliente',
      bio: 'Busco profesionales confiables para el mantenimiento de mi hogar.',
      avatar: '',
      provider: 'email',
    },
  },
  {
    password: 'Tecnico2024',
    user: {
      id: 'tec-001',
      name: 'Carlos Hernández López',
      email: 'carlos.hernandez@tecnoconnect.mx',
      phone: '+52 55 1122 3344',
      location: 'Iztapalapa, CDMX',
      userType: 'Técnico',
      bio: 'Electricista certificado con más de 10 años de experiencia en instalaciones residenciales y comerciales.',
      specialty: 'Electricista',
      rating: 4.9,
      reviewCount: 128,
      avatar: '',
      provider: 'email',
    },
  },
  {
    password: 'Tecnico2024',
    user: {
      id: 'tec-002',
      name: 'Juan Martínez Soto',
      email: 'juan.martinez@tecnoconnect.mx',
      phone: '+52 55 9988 7766',
      location: 'Gustavo A. Madero, CDMX',
      userType: 'Técnico',
      bio: 'Plomero profesional especializado en detección de fugas, instalaciones hidráulicas y reparaciones urgentes.',
      specialty: 'Plomero',
      rating: 4.7,
      reviewCount: 95,
      avatar: '',
      provider: 'email',
    },
  },
  {
    password: 'Tecnico2024',
    user: {
      id: 'tec-003',
      name: 'Roberto Flores García',
      email: 'roberto.flores@tecnoconnect.mx',
      phone: '+52 55 5544 3322',
      location: 'Coyoacán, CDMX',
      userType: 'Técnico',
      bio: 'Carpintero con especialidad en muebles a medida, reparaciones de estructuras de madera y acabados finos.',
      specialty: 'Carpintero',
      rating: 4.8,
      reviewCount: 74,
      avatar: '',
      provider: 'email',
    },
  },
  {
    password: 'Tecnico2024',
    user: {
      id: 'tec-004',
      name: 'Miguel Ángel Torres Ávila',
      email: 'miguel.torres@tecnoconnect.mx',
      phone: '+52 55 7788 9900',
      location: 'Tlalnepantla, Estado de México',
      userType: 'Técnico',
      bio: 'Técnico en climatización certificado por carrier. Instalación y mantenimiento de aires acondicionados, minisplits y sistemas centrales.',
      specialty: 'Climatización',
      rating: 4.6,
      reviewCount: 61,
      avatar: '',
      provider: 'email',
    },
  },
  {
    password: 'Tecnico2024',
    user: {
      id: 'tec-005',
      name: 'Fernando Ramírez Cruz',
      email: 'fernando.ramirez@tecnoconnect.mx',
      phone: '+52 55 2233 4455',
      location: 'Ecatepec, Estado de México',
      userType: 'Técnico',
      bio: 'Electricista industrial y residencial. Tableros eléctricos, cableado estructurado y mantenimiento preventivo.',
      specialty: 'Electricista',
      rating: 4.5,
      reviewCount: 47,
      avatar: '',
      provider: 'email',
    },
  },
];

const SESSION_KEY = 'tecnoconnect_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // sessionStorage no disponible
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const account = MOCK_ACCOUNTS.find(
      (a) =>
        a.user.email.toLowerCase() === email.toLowerCase() &&
        a.password === password
    );
    if (!account) {
      throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
    }
    setUser(account.user);
  };

  /**
   * loginWithGoogle
   * ─────────────────────────────────────────────────────────────────────────
   * DEMO: simula el login con Google creando un usuario de prueba.
   *
   * Para producción, reemplaza este bloque con Google Identity Services:
   *   1. Añade en index.html: <script src="https://accounts.google.com/gsi/client"></script>
   *   2. Inicializa con tu Client ID real de Google Cloud Console
   *   3. Usa google.accounts.id.initialize() + google.accounts.id.prompt()
   *   4. Decodifica el credential JWT para obtener name/email/picture
   * ─────────────────────────────────────────────────────────────────────────
   */
  const loginWithGoogle = async () => {
    await new Promise(resolve => setTimeout(resolve, 900));
    // Demo: crea un usuario "Google" de prueba
    setUser({
      id: `google-${Date.now()}`,
      name: 'Alex García',
      email: 'alex.garcia@gmail.com',
      phone: '',
      location: 'Ciudad de México',
      userType: 'Cliente',
      bio: 'Usuario registrado con Google.',
      avatar: '',
      provider: 'google',
    });
  };

  const register = async (name: string, email: string, _password: string, userType: 'Cliente' | 'Técnico') => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: `new-${Date.now()}`,
      name,
      email,
      phone: '+52 55 0000 0000',
      location: 'Ciudad de México',
      userType,
      bio: '',
      provider: 'email',
    });
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithGoogle,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      login: async () => {},
      loginWithGoogle: async () => {},
      register: async () => {},
      logout: () => {},
      updateUser: () => {},
      isAuthenticated: false,
    } as AuthContextType;
  }
  return context;
}
