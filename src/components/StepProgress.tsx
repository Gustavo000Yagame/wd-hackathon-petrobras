import { SimStep } from '@/hooks/useSimulation';
import { Check } from 'lucide-react';

// Props do componente de progresso das etapas
interface Props {
  steps: SimStep[];                    // Lista de todas as etapas
  stepLabels: Record<SimStep, string>; // Rótulos em PT-BR de cada etapa
  currentStep: number;                 // Índice da etapa atual (0-6)
}

// Componente que exibe a sequência de operação como uma lista vertical de etapas
// Cada etapa pode estar: concluída (check verde), ativa (destaque), ou pendente (opaca)
export default function StepProgress({ steps, stepLabels, currentStep }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">Sequencia de Operação</div>
      <div className="flex flex-col gap-1">
        {steps.map((s, i) => {
          const done = i < currentStep;   // Etapas anteriores à atual = concluídas
          const active = i === currentStep; // Etapa atual = ativa/destacada
          return (
            <div
              key={s}
              className={`flex items-center gap-2 px-2 py-2 rounded text-sm ${
                active ? 'bg-primary/10 font-medium' : done ? 'opacity-60' : 'opacity-35'
              }`}
            >
              {/* Círculo numerado: mostra check quando concluído, número quando pendente */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                  done
                    ? 'bg-primary border-primary text-primary-foreground'   // Concluído: fundo primário
                    : active
                    ? 'border-primary text-primary'                         // Ativo: borda primária
                    : 'border-muted-foreground/30 text-muted-foreground'   // Pendente: cinza
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {/* Rótulo da etapa (ex: "Posicionamento", "Entrada do Pino") */}
              <span>{stepLabels[s]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
