// -
import "./styles.css";

// ─── Custom Layout & Display Components ─────────────────────────────────────────
export { PageContainer } from "./components/PageContainer";
export { PageHeader } from "./components/PageHeader";
export { SectionHeader } from "./components/SectionHeader";
export { ContentCard } from "./components/ContentCard";
export { StatCard } from "./components/StatCard";
export { KPIGrid } from "./components/KPIGrid";
export { MiniStat } from "./components/MiniStat";
export { AIInsightCard } from "./components/AIInsightCard";
export { AISuggestionsDialog, type AISuggestion } from "./components/AISuggestionsDialog";
export { DataTable } from "./components/DataTable";
export { SearchBar } from "./components/SearchBar";
export { FilterChips } from "./components/FilterChips";
export { EmptyState } from "./components/EmptyState";
export { LoadingState } from "./components/LoadingState";
export { ErrorState } from "./components/ErrorState";
export { ProgressCard } from "./components/ProgressCard";
export { MoneyDisplay } from "./components/MoneyDisplay";
export { PercentageBadge } from "./components/PercentageBadge";
export { StatusBadge } from "./components/StatusBadge";
export { ConfirmDialog } from "./components/ConfirmDialog";
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

// ─── UI Primitives ──────────────────────────────────────────────────────────
export { Button, buttonVariants } from "./primitives/button";
export { Input } from "./primitives/input";
export { Progress } from "./primitives/progress";
export { Badge, badgeVariants } from "./primitives/badge";
export { Avatar, AvatarImage, AvatarFallback } from "./primitives/avatar";
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./primitives/accordion";
export {
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
} from "./primitives/select";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./primitives/tabs";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./primitives/table";
export { Calendar } from "./primitives/calendar";
export { DatePicker } from "./primitives/date-picker";
export {
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
} from "./primitives/dialog";
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./primitives/drawer";
export {
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
} from "./primitives/sheet";
export { Popover, PopoverTrigger, PopoverContent } from "./primitives/popover";
export { Checkbox } from "./primitives/checkbox";
export { Label } from "./primitives/label";
export { Separator } from "./primitives/separator";
export { Skeleton } from "./primitives/skeleton";
export { Slider } from "./primitives/slider";
export { Switch } from "./primitives/switch";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./primitives/tooltip";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./primitives/card";
export {
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
} from "./primitives/alert-dialog";
export { Toaster } from "./primitives/sonner";
export { toast } from "sonner";
export {
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
} from "./primitives/dropdown-menu";
export { Toggle } from "./primitives/toggle";
export { toggleVariants } from "./primitives/toggle.variants";
export { ToggleGroup, ToggleGroupItem } from "./primitives/toggle-group";
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
  NavigationMenuIndicator,
} from "./primitives/navigation-menu";
export { navigationMenuTriggerStyle } from "./primitives/navigation-menu";
export { useIsMobile } from "./hooks/use-mobile";
