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
import { Table, type ColumnDef } from "@/components/shared/table";
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

type CustomerRow = {
  id: number;
  client: string;
  city: string;
  seller: string;
  status: "Ativo" | "Pendente" | "Bloqueado";
  revenue: number;
  visits: number;
  enabled: boolean;
};

const tableData: CustomerRow[] = [
  {
    id: 1021,
    client: "Mercado Santa Luzia",
    city: "Curitiba",
    seller: "Ana Paula",
    status: "Ativo",
    revenue: 42800,
    visits: 18,
    enabled: true,
  },
  {
    id: 1022,
    client: "Distribuidora Vale Norte",
    city: "Londrina",
    seller: "Rafael Lima",
    status: "Pendente",
    revenue: 17650,
    visits: 7,
    enabled: false,
  },
  {
    id: 1023,
    client: "Padaria Bom Trigo",
    city: "Maringa",
    seller: "Camila Rocha",
    status: "Ativo",
    revenue: 23890,
    visits: 11,
    enabled: true,
  },
  {
    id: 1024,
    client: "Super Nova Center",
    city: "Ponta Grossa",
    seller: "Bruno Alves",
    status: "Bloqueado",
    revenue: 9100,
    visits: 3,
    enabled: false,
  },
  {
    id: 1025,
    client: "Casa Verde Alimentos",
    city: "Joinville",
    seller: "Ana Paula",
    status: "Ativo",
    revenue: 51840,
    visits: 22,
    enabled: true,
  },
];

const tableColumns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "id",
    header: "Codigo",
    sortable: true,
    localSortable: true,
    headerStyle: { minWidth: 90 },
  },
  {
    accessorKey: "client",
    header: "Cliente",
    headerDescription: "Clique nos cabecalhos ordenaveis para testar sorting local.",
    sortable: true,
    localSortable: true,
    ellipsis: true,
    headerStyle: { minWidth: 220 },
    cellStyle: { maxWidth: 220 },
  },
  {
    accessorKey: "city",
    header: "Cidade",
    sortable: true,
    localSortable: true,
    headerStyle: { minWidth: 150 },
  },
  {
    accessorKey: "seller",
    header: "Vendedor",
    headerStyle: { minWidth: 160 },
  },
  {
    accessorKey: "status",
    header: "Status",
    headerStyle: { minWidth: 130 },
    cell: ({ value }) => (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {value}
      </span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Receita",
    sortable: true,
    localSortable: true,
    headerStyle: { minWidth: 130, textAlign: "right" },
    cellStyle: { textAlign: "right" },
    cell: ({ value }) =>
      typeof value === "number"
        ? value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "-",
  },
  {
    accessorKey: "visits",
    header: "Visitas",
    sortable: true,
    localSortable: true,
    headerStyle: { minWidth: 100, textAlign: "center" },
    cellStyle: { textAlign: "center" },
  },
  {
    accessorKey: "enabled",
    header: "Habilitado",
    booleanIcon: true,
    headerStyle: { minWidth: 120, textAlign: "center" },
  },
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
  const [tablePage, setTablePage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<CustomerRow>>(new Set());

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
        <main className="min-h-screen bg-background p-4 text-foreground md:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div>
                <h1 className="text-2xl font-semibold">Playground</h1>
                <p className="text-sm text-muted-foreground">
                  Teste os componentes antes de continuar a biblioteca.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
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

            <section className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">DataTable</h2>
                  <p className="text-sm text-muted-foreground">
                    Teste selecao, ordenacao local, coluna fixa, ellipsis, boolean icon e paginacao.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Linhas selecionadas: {selectedRows.size}
                </p>
              </div>

              <Table
                columns={tableColumns}
                data={tableData}
                className="h-[420px] rounded-lg border"
                enableRowSelection
                selectedRows={selectedRows}
                onRowSelectionChange={setSelectedRows}
                frozenColumns={1}
                totalCount={340}
                currentPage={tablePage}
                onPageChange={setTablePage}
              />
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default App;
