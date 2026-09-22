// -
import "./styles.css";

// ─── Custom Layout & Display Components ─────────────────────────────────────────
export { PageContainer } from "./components/PageContainer";
export { TablePageContainer } from "./components/TablePageContainer";
export { PageHeader } from "./components/PageHeader";
export { SectionHeader } from "./components/SectionHeader";
export { ContentCard } from "./components/ContentCard";
export { StatCard } from "./components/StatCard";
export { KPIGrid } from "./components/KPIGrid";
export { MiniStat } from "./components/MiniStat";
export { AIInsightCard } from "./components/AIInsightCard";
export { AISuggestionsDialog, type AISuggestion } from "./components/AISuggestionsDialog";
export { DataTable, type Column, type DataTableProps } from "./components/DataTable";
export { Pagination, type PaginationProps } from "./components/Pagination";
export { SearchBar } from "./components/SearchBar";
export { FilterChips } from "./components/FilterChips";
export { LoadingState } from "./components/LoadingState";
export { ProgressCard, type ProgressCardProps } from "./components/ProgressCard";
export { MoneyDisplay, type MoneyDisplayProps } from "./components/MoneyDisplay";
export { MaskedValue, type MaskedValueProps } from "./components/MaskedValue";
export { ScoreGauge, type ScoreGaugeProps } from "./components/ScoreGauge";
export { FinAILogo, type FinAILogoProps } from "./components/FinAILogo";
export { StatusBadge } from "./components/StatusBadge";
export { TransactionTypeBadge, type TransactionType } from "./components/TransactionTypeBadge";
export { ConfirmDialog } from "./components/ConfirmDialog";
export { ActivityStep, type ActivityStepData, type StepStatus } from "./components/ActivityStep";
export {
  ConfirmationCard,
  type ConfirmationCardData,
  type ConfirmationStatus,
} from "./components/ConfirmationCard";
export { MarkdownContent, type MarkdownContentProps } from "./components/MarkdownContent";
export { cn } from "./lib/utils";
export { ChartCard } from "./components/ChartCard";
export { FormDialog } from "./components/FormDialog";
export {
  FormDialogField,
  type FormField,
  type FieldType,
  type InputField,
  type TextareaField,
  type SelectField,
} from "./components/FormDialogField";

// ─── Chart Components ────────────────────────────────────────────────────────
export { CashFlowChart, ExpenseBarChart, CategoryPie, TrendLine, CHART_COLORS } from "./charts";

// ─── Layout Components ───────────────────────────────────────────────────────
export { AppShell, Sidebar, TopBar, DashboardTabs } from "./layouts";

// ─── UI Primitives (from @yuva-devlab/ui) ──────────────────────────────────
export {
  Button,
  buttonVariants,
  Input,
  Progress,
  Badge,
  badgeVariants,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  Calendar,
  DatePicker,
  type DatePickerProps,
  SearchableSelect,
  type SearchableSelectOption,
  type SearchableSelectProps,
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Label,
  Separator,
  Skeleton,
  Switch,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Toaster,
  toast,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  Toggle,
  toggleVariants,
  useIsMobile,
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  StatusChip,
  type StatusChipProps,
  ConfigProvider,
  type ConfigProviderProps,
  ThemeProvider,
  type ThemeProviderProps,
  useConfig,
  useTheme,
} from "@yuva-devlab/ui";
