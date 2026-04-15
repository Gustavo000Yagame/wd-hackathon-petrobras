import { CornerModule, CranePosition, CargoType } from '@/hooks/useSimulation';

// Props do componente de visualização da simulação
interface Props {
  cranePos: CranePosition;   // Posição atual do guindaste (x, y em %)
  modules: CornerModule[];   // Lista de módulos/ganchos
  isPositioned: boolean;     // Se a base está centralizada
  isLifted: boolean;         // Se a carga está sendo içada
  cargoType?: CargoType;     // Tipo de carga (container ou bigbag)
}

// Retorna a cor do módulo baseado no seu status
// Verde = travado, Vermelho = liberado, Amarelo = alinhado/pino inserido, Cinza = ocioso
const moduleColor = (status: string) => {
  switch (status) {
    case 'locked': return '#16a34a';     // Verde: travado com segurança
    case 'released': return '#dc2626';   // Vermelho: liberado/destravado
    case 'pin_entered':
    case 'aligned': return '#ca8a04';    // Amarelo: em processo (alinhado ou pino inserido)
    default: return '#9ca3af';           // Cinza: ocioso/aguardando
  }
};

// Componente de visualização gráfica da simulação
// Mostra o guindaste, a carga e os pontos de encaixe dos módulos
export default function SimulationCanvas({ cranePos, modules, isPositioned, isLifted, cargoType = 'none' }: Props) {
  const isBigBag = cargoType === 'bigbag';
  const cargoLabel = isBigBag ? 'Big Bag' : 'Container';

  return (
    <div className="panel flex-1 min-h-[260px]">
      <div className="panel-header">Visualização</div>

      {/* === INDICADORES LED === */}
      {/* Barras coloridas que mostram o status de cada módulo/gancho */}
      <div className="flex gap-3 mb-3">
        {modules.map((m) => {
          const isLocked = m.status === 'locked';
          const isReleased = m.status === 'released';
          // Verde = travado, Vermelho = liberado, Cinza = aguardando
          const bgColor = isLocked ? 'bg-green-500' : isReleased ? 'bg-red-500' : 'bg-gray-300';
          const label = isLocked ? 'TRAVADO' : isReleased ? 'LIBERADO' : 'AGUARDANDO';
          return (
            <div key={m.id} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-6 rounded ${bgColor} transition-colors duration-300`} />
              <span className="text-[9px] text-muted-foreground font-medium">
                {/* Big Bag mostra "GANCHO", Container mostra "M1", "M2", etc. */}
                {isBigBag ? 'GANCHO' : `M${m.id}`} - {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* === CANVAS PRINCIPAL === */}
      <div className="relative w-full aspect-[4/3] bg-muted/50 rounded border border-border overflow-hidden">

        {/* Área da carga (container ou big bag) - retângulo tracejado central */}
        <div className={`absolute border-2 border-dashed rounded ${isBigBag ? 'border-amber-400/40' : 'border-muted-foreground/30'}`} style={{ left: '25%', top: '25%', width: '50%', height: '50%' }}>

          {/* Rótulo central da carga ("Container" ou "Big Bag") */}
          {(cargoType === 'container' || cargoType === 'bigbag') && (
            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider ${isBigBag ? 'text-amber-500/60' : 'text-muted-foreground/50'}`}>
              {cargoLabel}
            </span>
          )}

          {isBigBag ? (
            /* Big Bag: ponto central único representando o gancho */
            <div
              className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ top: '50%', left: '50%', backgroundColor: moduleColor(modules[0]?.status || 'idle') }}
            />
          ) : (
            /* Container: 4 pontos nas quinas representando os módulos de canto */
            [{t: '0', l: '0', idx: 0}, {t: '0', l: '100%', idx: 1}, {t: '100%', l: '0', idx: 2}, {t: '100%', l: '100%', idx: 3}].map(({ t, l, idx }) => (
              <div
                key={idx}
                className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
                style={{ top: t, left: l, backgroundColor: moduleColor(modules[idx]?.status || 'idle') }}
              />
            ))
          )}
        </div>

        {/* Zona alvo: área onde a base deve ser posicionada (desaparece após posicionar) */}
        {!isPositioned && (
          <div className="absolute border border-primary/20 rounded bg-primary/5" style={{ left: '35%', top: '35%', width: '30%', height: '30%' }} />
        )}

        {/* === BASE DO GUINDASTE === */}
        {/* Move-se conforme cranePos; sobe para o topo quando está içando */}
        <div
          className={`absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isLifted ? 'animate-bounce' : ''}`}
          style={{ left: `${cranePos.x}%`, top: isLifted ? '8%' : `${cranePos.y}%` }}
        >
          {/* Cabo do guindaste (linha vertical acima da base) */}
          <div className="absolute left-1/2 bottom-full w-px h-8 bg-muted-foreground/20 -translate-x-1/2" />
          {/* Bloco da base: muda de cor quando posicionada corretamente */}
          <div className={`w-full h-full border rounded flex items-center justify-center text-[10px] font-bold ${
            isPositioned ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/40 bg-muted text-muted-foreground'
          }`}>
            BASE
          </div>
        </div>
      </div>
    </div>
  );
}
