import { Metadata } from "next"
import { MediaAuditContent } from "./media-audit-content"

export const metadata: Metadata = {
  title: "Auditoria de Mídia | Admin",
  description: "Visualização interna da mídia de cada produto",
  robots: { index: false, follow: false },
}

export default function MediaAuditPage() {
  return <MediaAuditContent />
}
