import { ScrollArea } from '@/components/ui/scroll-area';

// Props do log de alertas/eventos
interface Props {
  alerts: string[]; // Lista de mensagens (mais recente primeiro)
}

// Componente que exibe o histórico de eventos da simulação
// Mostra no máximo 5 mensagens, com a mais recente em destaque
export default function AlertLog({ alerts }: Props) {
  // Não renderiza nada se não houver alertas
  if (alerts.length === 0) return null;

  return (
    <div className="panel">
      <div className="panel-header">Log de Eventos</div>
      {/* Área com scroll fixo para manter altura consistente */}
      <ScrollArea className="h-28">
        <div className="space-y-1">
          {alerts.map((a, i) => (
            // Primeira mensagem (mais recente) tem fundo destacado e texto em negrito
            <p key={i} className={`text-xs px-2 py-1 rounded ${i === 0 ? 'bg-muted font-medium' : 'text-muted-foreground'}`}>
              {a}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
