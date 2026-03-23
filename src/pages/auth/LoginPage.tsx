import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Shield, RefreshCw, Key, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

type LoginState = 'email' | 'waiting' | 'success' | 'error' | 'timeout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loginState, setLoginState] = useState<LoginState>('email')
  const [timeLeft, setTimeLeft] = useState(60)
  const { login } = useAuthStore()

  // Countdown timer for waiting state
  useEffect(() => {
    if (loginState !== 'waiting') return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setLoginState('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [loginState])

  // Simulate successful auth after a few seconds (demo)
  useEffect(() => {
    if (loginState !== 'waiting') return

    const timer = setTimeout(() => {
      // Simulate success for demo
      setLoginState('success')
      setTimeout(() => {
        login(
          {
            id: '1',
            email,
            name: 'Juan García',
            companyName: 'Mi Empresa S.L.',
            companyNif: 'B12345678',
          },
          'demo-token-123'
        )
      }, 1500)
    }, 3000)

    return () => clearTimeout(timer)
  }, [loginState, email, login])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoginState('waiting')
    setTimeLeft(60)
  }

  const handleRetry = () => {
    setLoginState('email')
    setTimeLeft(60)
  }

  return (
    <div className="text-center">
      {/* Logo for mobile */}
      <div className="lg:hidden mb-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Veridico</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Email Input State */}
        {loginState === 'email' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-500 mb-8">
              Accede a tu cuenta de forma segura
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-5 h-5" />}
                required
              />

              <Button type="submit" fullWidth size="lg">
                <Smartphone className="w-5 h-5" />
                Continuar con mi móvil
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                <Shield className="w-4 h-4 text-success-500" />
                <span>Tus datos nunca salen de tu ordenador</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/setup"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                ¿Primera vez? Configurar acceso seguro →
              </Link>
            </div>
          </motion.div>
        )}

        {/* Waiting State */}
        {loginState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            {/* Pulse Animation */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-4 border-primary-500/30 rounded-full"
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: 'easeInOut',
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-primary-600" />
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Esperando confirmación...
            </h2>
            <p className="text-gray-500 mb-6">
              Abre la app Veridico en tu móvil
              <br />y confirma con tu huella o rostro
            </p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary-500"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 60) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
            <p className="text-sm text-gray-400">{timeLeft}s restantes</p>

            <div className="mt-8 space-y-2">
              <button
                onClick={handleRetry}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Reenviar notificación
              </button>
              <span className="text-gray-300 mx-2">·</span>
              <button
                onClick={() => setLoginState('email')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Usar código manual
              </button>
            </div>
          </motion.div>
        )}

        {/* Success State */}
        {loginState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <motion.svg
                className="w-10 h-10 text-success-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </motion.div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Acceso confirmado!
            </h2>
            <p className="text-gray-500">Cargando tu escritorio...</p>
          </motion.div>
        )}

        {/* Timeout State */}
        {loginState === 'timeout' && (
          <motion.div
            key="timeout"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-warning-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-warning-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              La solicitud ha expirado
            </h2>
            <p className="text-gray-500 mb-6">
              No recibimos confirmación de tu móvil a tiempo.
              <br />
              Esto puede pasar si:
            </p>

            <ul className="text-sm text-gray-600 text-left max-w-xs mx-auto mb-8 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                Tu móvil no tiene conexión a Internet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                Las notificaciones están desactivadas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                La app Veridico no está instalada
              </li>
            </ul>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="primary">
                Reintentar
              </Button>
              <Button
                onClick={() => setLoginState('email')}
                variant="secondary"
              >
                <Key className="w-4 h-4" />
                Usar código
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {loginState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-error-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-error-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso bloqueado por seguridad
            </h2>
            <p className="text-gray-500 mb-6">
              Se rechazó la solicitud de acceso desde el móvil vinculado a esta
              cuenta.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Si fuiste tú quien intentó acceder, vuelve a intentarlo. Si no
              reconoces este intento, tu cuenta está segura.
            </p>

            <Button onClick={handleRetry} fullWidth>
              Volver a intentar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
