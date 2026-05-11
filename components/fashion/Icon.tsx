// Icon.tsx — Thin 1.5px stroke icons, Dash-style commercial e-commerce
// Faithful replica from FASHION.zip

interface IconProps {
  name: string
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 18, className = "", color = "currentColor", strokeWidth = 1.5 }: IconProps) {
  const s = size
  const common = {
    width: s, height: s, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className,
  }
  switch (name) {
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>
    case "bag":
      return <svg {...common}><path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
    case "heart":
      return <svg {...common}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
    case "heart-fill":
      return <svg {...common} fill={color}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>
    case "whatsapp":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M17.6 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.9-.4-1.7-.9-2.4-1.6-.6-.7-1.1-1.4-1.5-2.2-.1-.2 0-.4.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4 0-.2 0-.3-.1-.4 0-.1-.6-1.4-.8-2-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.4.1-.6.3-.7.7-1.1 1.6-1.1 2.5 0 1.1.4 2.2 1.1 3.2 1.4 2 3.4 3.5 5.7 4.2.4.1.7.1 1.1.2.4 0 .7 0 1.1-.1.5-.1 1.5-.6 1.7-1.2.2-.5.2-1 .1-1.4 0-.1-.2-.2-.5-.3zm-5.6 7.6h0c-1.8 0-3.6-.5-5.1-1.4l-3.7 1 1-3.6c-1-1.6-1.5-3.4-1.5-5.3 0-5.5 4.5-10 10-10 2.7 0 5.2 1 7.1 2.9 1.9 1.9 2.9 4.4 2.9 7.1.1 5.5-4.4 10-9.7 10z"/></svg>
    case "arrow-right":
      return <svg {...common}><line x1="4" y1="12" x2="20" y2="12"/><polyline points="13 5 20 12 13 19"/></svg>
    case "arrow-left":
      return <svg {...common}><line x1="20" y1="12" x2="4" y2="12"/><polyline points="11 5 4 12 11 19"/></svg>
    case "chevron-down":
      return <svg {...common}><polyline points="6 9 12 15 18 9"/></svg>
    case "chevron-right":
      return <svg {...common}><polyline points="9 18 15 12 9 6"/></svg>
    case "chevron-left":
      return <svg {...common}><polyline points="15 18 9 12 15 6"/></svg>
    case "menu":
      return <svg {...common}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    case "x":
      return <svg {...common}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    case "sun":
      return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    case "ruler":
      return <svg {...common}><rect x="2" y="9" width="20" height="6" rx="0.5"/><path d="M6 9v3M10 9v3M14 9v3M18 9v3"/></svg>
    case "facebook":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>
    case "pinterest":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9.2-.8 1.2-5.2 1.2-5.2s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.6-4.4-3.1 0-5 2.3-5 4.8 0 .9.4 2 .8 2.5.1.1.1.2.1.3-.1.4-.3 1.1-.3 1.2-.1.2-.2.3-.4.2-1.4-.7-2.2-2.7-2.2-4.3 0-3.5 2.6-6.8 7.4-6.8 3.9 0 6.9 2.8 6.9 6.5 0 3.9-2.4 7-5.8 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.3-1.4 3.1A10 10 0 1 0 12 2z"/></svg>
    case "instagram":
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill={color}/></svg>
    case "tiktok":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M19.6 7.2a5.3 5.3 0 0 1-3.1-1V15a5.4 5.4 0 1 1-5.4-5.4v3a2.4 2.4 0 1 0 2.4 2.4V2h2.9a5.3 5.3 0 0 0 3.2 4.3v.9z"/></svg>
    case "linkedin":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.4c0-1 0-2.4-1.5-2.4-1.5 0-1.7 1.1-1.7 2.3V18h-2.6V9.7h2.5v1.1h0a2.8 2.8 0 0 1 2.5-1.4c2.6 0 3.1 1.7 3.1 4V18z"/></svg>
    case "youtube":
      return <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}><path d="M23 7.2s-.2-1.5-.9-2.2c-.8-.9-1.8-.9-2.2-1C16.5 3.7 12 3.7 12 3.7s-4.5 0-7.9.3c-.5 0-1.4 0-2.2 1C1.2 5.7 1 7.2 1 7.2S.8 9 .8 10.7v1.6c0 1.8.2 3.5.2 3.5s.2 1.5.9 2.2c.8.9 1.9.8 2.4.9 1.7.2 7.7.3 7.7.3s4.5 0 7.9-.3c.5 0 1.4 0 2.2-1 .7-.7.9-2.2.9-2.2s.2-1.7.2-3.5v-1.6c0-1.8-.2-3.5-.2-3.5zM9.7 14.3V8.4l5.8 3-5.8 2.9z"/></svg>
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="1"/><polyline points="3 7 12 13 21 7"/></svg>
    case "map-pin":
      return <svg {...common}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></svg>
    case "phone":
      return <svg {...common}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z"/></svg>
    case "plus":
      return <svg {...common}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    case "minus":
      return <svg {...common}><line x1="5" y1="12" x2="19" y2="12"/></svg>
    case "trash":
      return <svg {...common}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
    case "check":
      return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>
    case "filter":
      return <svg {...common}><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
    case "grid":
      return <svg {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
    case "list":
      return <svg {...common}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
    case "star":
      return <svg {...common} fill={color}><polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.5 5.8 21 7 14 2 9.3 9 8.5 12 2"/></svg>
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>
  }
}
