import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Props do controle direcional do guindaste
interface Props {
  onMove: (dir: 'up' | 'down' | 'left' | 'right') => void; // Callback para mover o guindaste
  onConfirm: () => void;  // Callback para confirmar posicionamento (botão central)
  disabled: boolean;       // Desabilita controles (ex: fora da etapa de posicionamento)
}

// Componente de controle direcional do guindaste
// Layout em grid 3x3 simulando um D-pad com botão central de confirmação
export default function CraneControl({ onMove, onConfirm, disabled }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">Controle do Guindaste</div>

      {/* Grid 3x3: setas direcionais + botão central de confirmação */}
      <div className="grid grid-cols-3 gap-1 w-fit mx-auto">
        {/* Linha 1: vazio | cima | vazio */}
        <div />
        <Button size="icon" variant="outline" onClick={() => onMove('up')} disabled={disabled} className="h-10 w-10">
          <ChevronUp className="w-4 h-4" />
        </Button>
        <div />

        {/* Linha 2: esquerda | confirmar (centro) | direita */}
        <Button size="icon" variant="outline" onClick={() => onMove('left')} disabled={disabled} className="h-10 w-10">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={onConfirm} disabled={disabled} className="h-10 w-10">
          <Crosshair className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => onMove('right')} disabled={disabled} className="h-10 w-10">
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Linha 3: vazio | baixo | vazio */}
        <div />
        <Button size="icon" variant="outline" onClick={() => onMove('down')} disabled={disabled} className="h-10 w-10">
          <ChevronDown className="w-4 h-4" />
        </Button>
        <div />
      </div>

      {/* Instrução para o operador */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Centralize a base e pressione o centro para confirmar
      </p>
    </div>
  );
}
