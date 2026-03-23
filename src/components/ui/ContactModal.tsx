import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useContactModal } from '@/stores/contactModalStore'

const WA_URL =
  'https://wa.me/34692257776?text=Hola%20Denilson,%20quiero%20Veridico%20para%20mi%20negocio%20hoy%20mismo'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function ContactModal() {
  const { isOpen, closeContactModal } = useContactModal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={closeContactModal}
          />

          {/* Modal */}
          <motion.div
            key="contact-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

              {/* Top accent strip */}
              <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

              <div className="relative p-6 sm:p-8">

                {/* Close button */}
                <button
                  onClick={closeContactModal}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 leading-snug mb-2 pr-6">
                  Implementa Veridico en tu negocio hoy mismo
                </h2>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Activa todas las funcionalidades y adapta Veridico a tu empresa
                  contactando ahora.
                </p>

                {/* WhatsApp CTA */}
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeContactModal}
                  className="flex items-center justify-center gap-2.5 w-full px-5 py-3.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.97] shadow-md hover:shadow-lg hover:brightness-105"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <WhatsAppIcon className="w-5 h-5 flex-shrink-0" />
                  Contactar por WhatsApp
                </a>

                {/* Dismiss */}
                <button
                  onClick={closeContactModal}
                  className="mt-3 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
