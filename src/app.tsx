import {
  BookOpen,
  Building2,
  ChevronRight,
  CirclePercent,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Map,
  MapPin,
  Plane,
  Route,
  Share2,
  SlidersHorizontal,
  Table2,
  Target,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

import { DatePicker } from "@/components/shared/date-picker";
import {
  MultiSelect,
  type MultiSelectOption,
} from "@/components/shared/multi-select";
import { Select, type Option } from "@/components/shared/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const options: Option[] = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "pending", label: "Pendente" },
  { value: "blocked", label: "Bloqueado" },
];

const multiOptions: MultiSelectOption[] = [
  { value: "admin", label: "Administrador", shortLabel: "Admin" },
  { value: "manager", label: "Gerente" },
  { value: "seller", label: "Vendedor" },
  { value: "financial", label: "Financeiro" },
  { value: "support", label: "Suporte" },
];

const primarySidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Painel de visitas", icon: Target },
  { label: "Mapa de clientes", icon: Map },
  { label: "Geo referência", icon: MapPin },
  { label: "Base de conhecimento", icon: BookOpen },
];

const serviceSidebarItems = [
  { label: "Cadastros", icon: ClipboardList },
  { label: "Pedidos", icon: ClipboardCheck },
  { label: "Popular", icon: Table2 },
  { label: "Parâmetros", icon: SlidersHorizontal },
  { label: "Cadastro de Clientes", icon: UserPlus },
  { label: "Gerencial", icon: Building2 },
  { label: "Importações", icon: Plane },
  { label: "Precificação", icon: CirclePercent },
  { label: "Recursos", icon: Share2 },
  { label: "Pesquisas", icon: Gauge },
];

function SidebarNavSection({
  label,
  items,
}: {
  label: string;
  items: Array<{
    label: string;
    icon: typeof LayoutDashboard;
    active?: boolean;
  }>;
}) {
  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupLabel className="h-7 px-0 font-bold  text-[13px]  text-[#061447] group-data-[collapsible=icon]:hidden">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={item.active}
                className="h-8 rounded-lg px-2 text-[13px] font-medium text-[#061447] hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:font-bold data-[active=true]:text-[#061447]"
              >
                <item.icon className="text-primary" />
                <span>{item.label}</span>
                <ChevronRight className="ml-auto size-4 text-primary group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

const App = () => {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedOption, setSelectedOption] = useState<Option | undefined>();
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<
    MultiSelectOption[]
  >([]);

  return (
    <SidebarProvider
      style={
        {
          "--primary": "#16a34a",
          "--ring": "#16a34a",
          "--sidebar-width": "240px",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" className="border-r border-sidebar-border ">
        <SidebarHeader className="gap-5 px-4 pb-4 pt-7">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip="ExpForce"
                className="h-10 justify-center gap-2 hover:bg-transparent data-[active=true]:bg-transparent group-data-[collapsible=icon]:justify-start"
              >
                <div className="relative size-8 overflow-hidden rounded-full bg-primary">
                  <div className="absolute left-[-6px] top-2 h-2 w-10 rotate-12 rounded-full bg-white/90" />
                  <div className="absolute left-[-4px] top-4 h-1.5 w-9 rotate-12 rounded-full bg-white/80" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#173789] group-data-[collapsible=icon]:hidden">
                  ExP<span className="text-primary">force</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="flex items-center gap-3 rounded-xl px-1 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-lg">
              👨🏻‍💼
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-[10px] font-medium text-primary">
                LIPPAUS
              </p>
              <p className="text-[10px] font-bold text-[#061447]">120</p>
            </div>
            <ChevronRight className="size-4 text-primary group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNavSection label="Principal" items={primarySidebarItems} />
          <SidebarNavSection label="Serviços" items={serviceSidebarItems} />
        </SidebarContent>

        <SidebarFooter className="px-4 pb-4 group-data-[collapsible=icon]:hidden">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-[10px] text-muted-foreground hover:bg-primary/10 hover:text-primary">
                <Route />
                <span>Teste Playground</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <main className="min-h-screen bg-background p-8 text-foreground">
          <div className="mx-auto flex max-w-sm flex-col gap-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-semibold">Playground</h1>
                <p className="text-sm text-muted-foreground">
                  Teste os componentes antes de continuar a biblioteca.
                </p>
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">DatePicker</h2>
              <DatePicker
                label="Data de nascimento"
                value={date}
                onChange={setDate}
                fromDate={new Date(1900, 0, 1)}
                toDate={new Date()}
              />
              <p className="text-sm text-muted-foreground">
                Valor selecionado:{" "}
                {date ? date.toLocaleDateString("pt-BR") : "nenhum"}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">Select</h2>
              <Select
                label="Status"
                helpText="Selecione um status para testar busca, limpeza e popover."
                placeholder="Selecione um status"
                options={options}
                value={selectedOption}
                onChange={setSelectedOption}
                searchable
              />
              <p className="text-sm text-muted-foreground">
                Valor selecionado: {selectedOption?.label ?? "nenhum"}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">MultiSelect</h2>
              <MultiSelect
                label="Perfis"
                helpText="Selecione um ou mais perfis para testar badges e overflow."
                placeholder="Selecione perfis"
                options={multiOptions}
                value={selectedMultiOptions}
                onChange={setSelectedMultiOptions}
              />
              <p className="text-sm text-muted-foreground">
                Valores selecionados:{" "}
                {selectedMultiOptions.length > 0
                  ? selectedMultiOptions
                      .map((option) => option.label)
                      .join(", ")
                  : "nenhum"}
              </p>
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
