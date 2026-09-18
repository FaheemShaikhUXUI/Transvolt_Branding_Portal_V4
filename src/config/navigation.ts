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
  Layers,
  FolderTree,
} from "lucide-react"

export const navigationConfig = [
  {
    title: "Dashboard",
    href: "/",
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
    title: "Graphics Library",
    href: "/graphics-library",
    icon: Layers,
  },
  {
    title: "Graphics Library V2",
    href: "/graphics-library-v2",
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
