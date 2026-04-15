import { CornerModule, ModuleStatus, CargoType } from '@/hooks/useSimulation';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';

// Configuração visual de cada status do módulo
// cls: classes CSS para estilização | label: texto para container | labelBigbag: texto para big bag
const statusConfig: Record<ModuleStatus, { cls: string; label: string; labelBigbag: string }> = {
  idle: { cls: 'status-error border', label: 'Nao encaixado', labelBigbag: 'Nao encaixado' },
  aligned: { cls: 'status-process border', label: 'Alinhado', labelBigbag: 'Alinhado' },
  pin_entered: { cls: 'status-process border', label: 'Pino inserido', labelBigbag: 'Gancho inserido' },
  locked: { cls: 'status-locked border', label: 'Travado', labelBigbag: 'Gancho travado' },
  released: { cls: 'status-error border', label: 'Liberado', labelBigbag: 'Gancho liberado' },
};

// Props do componente
interface Props {
  modules: CornerModule[];  // Lista de módulos (4 para container, 1 para big bag)
  onLock: () => void;       // Callback para travar todos os módulos
  onRelease: () => void;    // Callback para liberar todos os módulos
  canLock: boolean;         // Se o botão Travar está habilitado
  canRelease: boolean;      // Se o botão Liberar está habilitado
  cargoType?: CargoType;    // Tipo de carga atual
}

// Painel que exibe o status de cada módulo/gancho e permite travar/liberar
export default function CornerModules({ modules, onLock, onRelease, canLock, canRelease, cargoType = 'container' }: Props) {
  const isBigBag = cargoType === 'bigbag';
  const allLocked = modules.every(m => m.status === 'locked'); // Verifica se todos estão travados
  const totalModules = modules.length;

  return (
    <div className="panel">
      {/* Título: muda conforme tipo de carga */}
      <div className="panel-header">{isBigBag ? 'Gancho Central' : 'Modulos de Canto'}</div>

      {/* Grid de módulos: 2 colunas para container, coluna única para big bag */}
      <div className={isBigBag ? '' : 'grid grid-cols-2 gap-3'}>
        {modules.map((m) => {
          const cfg = statusConfig[m.status]; // Configuração visual do status atual
          const isLocked = m.status === 'locked';
          const isReleased = m.status === 'released';
          return (
            <div key={m.id} className={`rounded-md p-3 relative ${cfg.cls}`}>
              {/* Cabeçalho do módulo: nome + LED de status */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold">{isBigBag ? 'Gancho Central' : `Modulo ${m.id}`}</p>
                {/* LED colorido: verde = travado, vermelho = liberado, cinza = aguardando */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    isLocked ? 'bg-green-500' : isReleased ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  title={isLocked ? 'Travado' : isReleased ? 'Liberado' : 'Aguardando'}
                />
              </div>

              {/* Label do status atual (adapta texto para big bag) */}
              <p className="text-xs font-medium mb-2">{isBigBag ? cfg.labelBigbag : cfg.label}</p>

              {/* Leitura dos sensores superior e inferior */}
              <div className="text-[11px] space-y-0.5 opacity-80">
                <p>Sensor sup.: {m.sensorTop ? 'Detectado' : 'Aguardando'}</p>
                <p>Sensor inf.: {m.sensorBottom ? 'Travado' : 'Aguardando'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botões de ação: Travar (verde) e Liberar (vermelho) */}
      <div className="mt-3 flex gap-2">
        <Button
          onClick={onLock}
          disabled={!canLock || allLocked}
          className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Lock className="w-4 h-4" /> Travar
        </Button>
        <Button
          onClick={onRelease}
          disabled={!canRelease}
          variant="outline"
          className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50"
          size="sm"
        >
          <Unlock className="w-4 h-4" /> Liberar
        </Button>
      </div>

      {/* Barra de resumo: mostra quantos módulos estão travados do total */}
      <div className="mt-3 p-2 rounded bg-muted text-center">
        <span className="text-xs text-muted-foreground">Status: </span>
        <span className={`text-xs font-semibold ${allLocked ? 'text-green-700' : 'text-red-600'}`}>
          {modules.filter(m => m.status === 'locked').length}/{totalModules} Travados
        </span>
      </div>
    </div>
  );
}
