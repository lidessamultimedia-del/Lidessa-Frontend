// Íconos del sitio: wrappers delgados sobre lucide-react (línea fina,
// esquinas redondeadas) para que todo el proyecto use el mismo set. El
// tamaño por defecto queda en 16 para no tener que tocar cada `<Icon />`
// que ya asumía ese valor (Lucide por defecto usa 24).
import {
  Check as LucideCheck,
  X as LucideX,
  Sparkles as LucideSparkles,
  Info as LucideInfo,
  Link as LucideLink,
  MessageCircle as LucideMessageCircle,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  Phone as LucidePhone,
  GraduationCap as LucideGraduationCap,
  Users as LucideUsers,
  User as LucideUser,
  Clipboard as LucideClipboard,
  SlidersVertical as LucideSlidersVertical,
  Bell as LucideBell,
  Edit2 as LucideEdit2,
  Plus as LucidePlus,
  Send as LucideSend,
  Smile as LucideSmile,
  AlertTriangle as LucideAlertTriangle,
  BarChart2 as LucideBarChart2,
  Building2 as LucideBuilding2,
  Monitor as LucideMonitor,
  Inbox as LucideInbox,
  Briefcase as LucideBriefcase,
  FileText as LucideFileText,
  BookOpen as LucideBookOpen,
  Trash2 as LucideTrash2,
  Eye as LucideEye,
  Lock as LucideLock,
  Upload as LucideUpload,
  ChevronDown as LucideChevronDown,
  Search as LucideSearch,
  Download as LucideDownload,
  ClipboardCheck as LucideClipboardCheck,
  EllipsisVertical as LucideEllipsisVertical,
  HelpCircle as LucideHelpCircle,
  Paperclip as LucidePaperclip,
} from 'lucide-react'

function withDefaultSize(LucideIcon) {
  return function Icon({ size = 16, ...props }) {
    return <LucideIcon size={size} {...props} />
  }
}

export const Check = withDefaultSize(LucideCheck)
export const X = withDefaultSize(LucideX)
export const Sparkle = withDefaultSize(LucideSparkles)
export const Info = withDefaultSize(LucideInfo)
export const LinkIcon = withDefaultSize(LucideLink)
export const MessageCircle = withDefaultSize(LucideMessageCircle)
export const Mail = withDefaultSize(LucideMail)
export const MapPin = withDefaultSize(LucideMapPin)
export const Phone = withDefaultSize(LucidePhone)
export const GraduationCap = withDefaultSize(LucideGraduationCap)
export const Users = withDefaultSize(LucideUsers)
export const User = withDefaultSize(LucideUser)
export const Clipboard = withDefaultSize(LucideClipboard)
export const Sliders = withDefaultSize(LucideSlidersVertical)
export const Bell = withDefaultSize(LucideBell)
export const Edit2 = withDefaultSize(LucideEdit2)
export const Plus = withDefaultSize(LucidePlus)
export const Send = withDefaultSize(LucideSend)
export const Smile = withDefaultSize(LucideSmile)
export const AlertTriangle = withDefaultSize(LucideAlertTriangle)
export const BarChart2 = withDefaultSize(LucideBarChart2)
export const Building = withDefaultSize(LucideBuilding2)
export const Monitor = withDefaultSize(LucideMonitor)
export const Inbox = withDefaultSize(LucideInbox)
export const Briefcase = withDefaultSize(LucideBriefcase)
export const FileText = withDefaultSize(LucideFileText)
export const BookOpen = withDefaultSize(LucideBookOpen)
export const Trash = withDefaultSize(LucideTrash2)
export const Eye = withDefaultSize(LucideEye)
export const Lock = withDefaultSize(LucideLock)
export const Upload = withDefaultSize(LucideUpload)
export const ChevronDown = withDefaultSize(LucideChevronDown)
export const Search = withDefaultSize(LucideSearch)
export const Download = withDefaultSize(LucideDownload)
export const ClipboardCheck = withDefaultSize(LucideClipboardCheck)
export const MoreVertical = withDefaultSize(LucideEllipsisVertical)
export const HelpCircle = withDefaultSize(LucideHelpCircle)
export const Paperclip = withDefaultSize(LucidePaperclip)
