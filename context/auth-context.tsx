"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserByEmail } from "@/lib/file-storage"

type User = {
  id: string
  tipo: string
  nome: string
  email: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Em um cenário real, isso seria uma chamada a uma API
      const user = await getUserByEmail(email)

      if (user && user.senha === password) {
        setUser(user)
        localStorage.setItem("user", JSON.stringify(user))
        return true
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
