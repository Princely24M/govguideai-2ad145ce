import {
  BookOpen,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  FileText,
  HeartHandshake,
  IdCard,
  Plane,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  IdCard,
  Plane,
  BookOpen,
  Car,
  CarFront: CreditCard,
  HeartHandshake,
  Briefcase,
  Building2,
  FileText,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? FileText;
  return <Icon className={className} aria-hidden="true" />;
}
