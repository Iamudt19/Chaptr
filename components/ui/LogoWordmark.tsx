/**
 * LogoWordmark — renders the Chaptr script wordmark.
 * Uses Pacifico (Google Fonts, loaded via globals.css).
 * Transparent background, white text — works on any colour surface.
 */

interface LogoWordmarkProps {
  /** Tailwind height class, e.g. "h-8" or "h-14". Defaults to "h-8". */
  heightClass?: string;
  className?: string;
}

export default function LogoWordmark({ heightClass = 'h-8', className = '' }: LogoWordmarkProps) {
  return (
    <span className={`inline-flex items-center ${heightClass} ${className}`}>
      <svg
        viewBox="0 0 520 190"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="Chaptr"
        overflow="visible"
      >
        <text
          x="255"
          y="118"
          fontFamily="'Pacifico', cursive"
          fontSize="108"
          fill="#ffffff"
          textAnchor="middle"
        >
          Chaptr
        </text>
      </svg>
    </span>
  );
}
