import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Smartphone, QrCode, Check, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type SetupStep = 1 | 2 | 3

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState<SetupStep>(1)
  const [qrExpiry, setQrExpiry] = useState(300) // 5 minutes

  // QR Code expiry countdown
  useEffect(() => {
    if (currentStep !== 1) return

    const interval = setInterval(() => {
      setQrExpiry((prev) => {
        if (prev <= 1) {
          return 300 // Reset
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentStep])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div>
      {/* Back link */}
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step < currentStep
                  ? 'bg-success-500 text-white'
                  : step === currentStep
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step < currentStep ? <Check className="w-4 h-4" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-1 rounded ${
                  step < currentStep ? 'bg-success-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Download App & Scan QR */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Conecta tu móvil de forma segura
          </h1>
          <p className="text-gray-500 mb-8">
            Vincula tu móvil para acceder con autenticación biométrica
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* QR Code */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {/* Placeholder QR - Replace with actual QR generation */}
                <div className="relative">
                  <QrCode className="w-32 h-32 text-gray-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Código expira en:{' '}
                <span className="font-mono font-medium">
                  {formatTime(qrExpiry)}
                </span>
              </p>
            </div>

            {/* Instructions */}
            <div className="text-left space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Descarga la app Veridico Authenticator
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Disponible en App Store y Google Play
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Abre la app y escanea este código
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Se vinculará automáticamente con tu cuenta
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Configura tu huella o Face ID
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Para acceder de forma segura y rápida
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="text-[10px] leading-none opacity-80">
                  Descargar en
                </p>
                <p className="text-sm font-semibold">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Download className="w-5 h-5" />
              <div className="text-left">
                <p className="text-[10px] leading-none opacity-80">
                  Disponible en
                </p>
                <p className="text-sm font-semibold">Google Play</p>
              </div>
            </button>
          </div>

          {/* Demo: Continue button */}
          <Button onClick={() => setCurrentStep(2)} fullWidth size="lg">
            Ya he escaneado el código
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            ¿Problemas? Contacta soporte:{' '}
            <a
              href="mailto:ayuda@veridico.es"
              className="text-primary-600 hover:underline"
            >
              ayuda@veridico.es
            </a>
          </p>
        </motion.div>
      )}

      {/* Step 2: Biometric Setup */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-success-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Móvil vinculado correctamente!
          </h1>
          <p className="text-gray-500 mb-8">
            Ahora configura la autenticación biométrica en tu móvil
          </p>

          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 11c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm0 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm-2 8h4m-2-8v8"
                  />
                </svg>
              </div>
              <span className="text-gray-400">o</span>
              <div className="p-3 bg-white rounded-full shadow-sm">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Usa huella dactilar o reconocimiento facial
              <br />
              para aprobar el acceso de forma segura
            </p>
          </div>

          <Button onClick={() => setCurrentStep(3)} fullWidth size="lg">
            Continuar
          </Button>
        </motion.div>
      )}

      {/* Step 3: Complete */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <Check className="w-12 h-12 text-success-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Todo listo!
          </h1>
          <p className="text-gray-500 mb-8">
            Tu cuenta está configurada de forma segura.
            <br />
            Ya puedes acceder con tu móvil.
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-primary-900 mb-2">
              Así funcionará el acceso:
            </h3>
            <ol className="text-sm text-primary-700 text-left space-y-2">
              <li>1. Introduce tu email en este ordenador</li>
              <li>2. Recibirás una notificación en tu móvil</li>
              <li>3. Confirma con tu huella o rostro</li>
              <li>4. ¡Acceso instantáneo!</li>
            </ol>
          </div>

          <Link to="/login">
            <Button fullWidth size="lg">
              Ir a iniciar sesión
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
