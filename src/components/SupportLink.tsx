import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { supportLink, supportWhatsapp } from "@/lib/config";

/** "Questions? WhatsApp us": renders nothing until the owner's number is set (NEXT_PUBLIC_WHATSAPP). */
export function SupportLink({ topic, children = "WhatsApp us", className = "" }: { topic?: string; children?: React.ReactNode; className?: string }) {
  if (!supportWhatsapp) return null;
  return (
    <a href={supportLink(topic)} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 ${className}`}>
      <WhatsAppIcon className="size-4 text-[#25D366]" />{children}
    </a>
  );
}
