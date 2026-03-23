export function PoweredBy() {
  return (
    <div className="flex items-center justify-center gap-2 py-6 mt-4 select-none">
      <span className="text-xs text-gray-400 dark:text-gray-600 font-medium tracking-wide">
        Powered by
      </span>
      <a
        href="https://veridico.son.enterprises"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center opacity-40 hover:opacity-70 transition-opacity duration-200"
        aria-label="Veridico"
      >
        {/* Light mode logo — hidden in dark mode */}
        <img
          src="/logoblack.svg"
          alt="Veridico"
          className="h-5 w-auto dark:hidden"
          draggable={false}
        />
        {/* Dark mode logo — hidden in light mode */}
        <img
          src="/logowhite.svg"
          alt="Veridico"
          className="h-5 w-auto hidden dark:block"
          draggable={false}
        />
      </a>
    </div>
  )
}
