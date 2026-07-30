import { useState } from "react";

import { DatePicker } from "@/components/shared/date-picker";

const App = () => {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto flex max-w-sm flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">DatePicker</h1>
          <p className="text-sm text-muted-foreground">
            Teste o componente antes de continuar a biblioteca.
          </p>
        </div>

        <DatePicker
          label="Data de nascimento"
          value={date}
          onChange={setDate}
          fromDate={new Date(1900, 0, 1)}
          toDate={new Date()}
        />

        <p className="text-sm text-muted-foreground">
          Valor selecionado: {date ? date.toLocaleDateString("pt-BR") : "nenhum"}
        </p>
      </div>
    </main>
  );
};

export default App;
