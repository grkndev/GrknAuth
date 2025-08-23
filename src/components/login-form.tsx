"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
  
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [isSuccess, setSuccess] = useState(false)
  const { signIn } = useSignIn()

  const formHandler = async (formData: FormData) => {
    try {
      setError(null) // Clear previous errors
      setLoading(true)

      const result = await signIn?.create({
        password: formData.get("password") as string,
        identifier: formData.get("email") as string,
        strategy: "password",
      })

      if (result?.status === "complete") {
        router.prefetch("/dashboard")
        setSuccess(true)
        
        // Use window.location.href for hard redirect to ensure middleware picks up the auth state
        window.location.href = "/dashboard"
      } else {
        setError("Giriş tamamlanamadı. Lütfen tekrar deneyin.")
        setLoading(false)
      }
    } catch (err: any) {
      console.error("Login error:", err)
      // Handle different types of Clerk errors
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0]
        switch (clerkError.code) {
          case "form_identifier_not_found":
            setError("Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.")
            break
          case "form_password_incorrect":
            setError("Yanlış şifre girdiniz.")
            break
          case "form_identifier_exists":
            setError("Bu e-posta adresi zaten kayıtlı.")
            break
          default:
            setError(clerkError.longMessage || clerkError.message || "Bir hata oluştu.")
        }
      } else {
        setError(err.message || "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.")
      }
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await formHandler(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Hesabınıza Giriş Yapın</h1>
        <p className="text-muted-foreground text-sm text-balance">
          E-posta adresinizi ve şifrenizi giriniz.
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-3">
          <Label htmlFor="email">E-posta</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            name="email" 
            required 
            disabled={isLoading || isSuccess}
          />
        </div>
        
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Şifre</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline text-muted-foreground"
            >
              Şifrenizi mi unuttunuz?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            name="password" 
            required 
            disabled={isLoading || isSuccess}
          />
        </div>
        
        <Button 
          type="submit" 
          className={cn("w-full", isSuccess && "bg-green-600 hover:bg-green-600")} 
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4" />
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
      </div>
    </form>
  )
}
