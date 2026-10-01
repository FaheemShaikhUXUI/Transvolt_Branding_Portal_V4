import {
  Palette,
  FileText,
  MonitorPlay,
  Monitor,
  Printer,
  IdCard,
  Car,
  Zap,
  Image as ImageIcon,
  LayoutDashboard,
  Type,
  Compass,
  Network,
  FolderTree,
  Sparkles,
  Music2,
} from "lucide-react"

export const navigationConfig = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Logo & Color",
    href: "/logo-color",
    icon: Palette,
  },
  {
    title: "Typography",
    href: "/typography",
    icon: Type,
  },
  {
    title: "Graphics Drive",
    href: "/graphics-drive",
    icon: FolderTree,
  },
  {
    title: "Letterhead",
    href: "/letterhead",
    icon: FileText,
  },
  {
    title: "ID Cards & Business Cards",
    href: "/id-business-cards",
    icon: IdCard,
  },
  {
    title: "Digital Assets",
    href: "/digital-assets",
    icon: Monitor,
  },
  {
    title: "Printing Assets",
    href: "/printing-assets",
    icon: Printer,
  },
  {
    title: "Presentation",
    href: "/presentation",
    icon: MonitorPlay,
  },
  {
    title: "Photos and Videos Repository",
    href: "/photos",
    icon: ImageIcon,
  },
  {
    title: "Vehicle Branding",
    href: "/vehicle-branding",
    icon: Car,
  },
  {
    title: "Charger Branding",
    href: "/charger-branding",
    icon: Zap,
  },
  {
    title: "Eva Design Tool",
    href: "/eva-design-tool",
    icon: Sparkles,
  },
  {
    title: "Generate Audio",
    href: "/generate-audio",
    icon: Music2,
  },
  {
    title: "Organization Chart",
    href: "/organization-chart",
    icon: Network,
    tag: "Hold",
  },
  {
    title: "Brand Philosophy",
    href: "/brand-philosophy",
    icon: Compass,
  },
]
