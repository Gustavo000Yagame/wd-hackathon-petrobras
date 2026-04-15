import { useState } from "react";
import { useSimulation } from "@/hooks/useSimulation";
import StepProgress from "@/components/StepProgress";
import CraneControl from "@/components/CraneControl";
import CornerModules from "@/components/CornerModules";
import SimulationCanvas from "@/components/SimulationCanvas";
import AlertLog from "@/components/AlertLog";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ArrowRight, ScanLine, Box, Package, Circle } from "lucide-react";

// Página principal da simulação de içamento de cargas
export default function Simulation() {
  // Hook que gerencia todo o estado e lógica da simulação
  const sim = useSimulation();

  // Estado local do resultado do scan (none → scanning → container/bigbag)
  const [scanResult, setScanResult] = useState<'none' | 'scanning' | 'container' | 'bigbag'>('none');

  // Simula o escaneamento da carga com delay de 2 segundos
  // Resultado aleatório: 50% container, 50% big bag
  const handleScan = () => {
    setScanResult('scanning');
    setTimeout(() => {
      const result = Math.random() > 0.5 ? 'container' : 'bigbag';
      setScanResult(result);
      sim.setCargoAndModules(result); // Atualiza módulos conforme tipo de carga
    }, 2000);
  };

  return (
    <div className="space-y-4">

      {/* === BARRA DE STATUS SUPERIOR === */}
      {/* Mostra estado da simulação (Ativo/Inativo), botão de scan e controles */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">

        {/* Lado esquerdo: indicador de status + scan */}
        <div className="flex items-center gap-3">
          {/* Indicador visual: verde pulsante quando ativo, cinza quando inativo */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
            sim.isRunning
              ? 'bg-green-500/15 text-green-700 border border-green-400/30'
              : 'bg-muted text-muted-foreground border'
          }`}>
            <Circle className={`w-3 h-3 fill-current ${sim.isRunning ? 'text-green-500 animate-pulse' : 'text-muted-foreground/50'}`} />
            {sim.isRunning ? 'Ativo' : 'Inativo'}
          </div>

          {/* Botão de escanear + badge do resultado (só aparece com simulação ativa) */}
          {sim.isRunning && (
            <div className="flex items-center gap-2">
              {/* Botão de scan: desabilitado enquanto escaneia */}
              <Button onClick={handleScan} variant="outline" size="sm" className="gap-2" disabled={scanResult === 'scanning'}>
                <ScanLine className="w-4 h-4" />
                {scanResult === 'scanning' ? 'Escaneando...' : 'Escanear Carga'}
              </Button>

              {/* Badge azul quando detecta Container */}
              {scanResult === 'container' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-700 text-xs font-semibold">
                  <Box className="w-3.5 h-3.5" /> Container
                </div>
              )}

              {/* Badge âmbar quando detecta Big Bag */}
              {scanResult === 'bigbag' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-700 text-xs font-semibold">
                  <Package className="w-3.5 h-3.5" /> Big Bag
                </div>
              )}

              {/* Indicador de "Analisando..." durante o scan */}
              {scanResult === 'scanning' && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border text-muted-foreground text-xs animate-pulse">
                  <ScanLine className="w-3.5 h-3.5 animate-spin" /> Analisando...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lado direito: botões de ação (Iniciar / Avançar / Reiniciar) */}
        <div className="flex gap-2">
          {!sim.isRunning ? (
            // Botão Iniciar: limpa scan anterior e começa simulação
            <Button onClick={() => { setScanResult('none'); sim.startSimulation(); }} className="gap-2">
              <Play className="w-4 h-4" /> Iniciar
            </Button>
          ) : (
            <>
              {/* Botão Avançar: só habilitado quando base está posicionada */}
              <Button
                onClick={sim.advanceStep}
                disabled={!sim.isPositioned}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" /> Avançar
              </Button>

              {/* Botão Reiniciar: reseta tudo incluindo resultado do scan */}
              <Button onClick={() => { setScanResult('none'); sim.reset(); }} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reiniciar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* === BANNERS DE SEGURANÇA === */}
      {/* Exibem avisos críticos sobre o estado do içamento */}

      {/* Banner VERMELHO: içamento bloqueado - módulos não travados (etapas 4-5) */}
      {sim.isRunning && !sim.allLocked && sim.currentStep >= 4 && sim.currentStep < 6 && !sim.modules.some(m => m.status === 'released') && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          IÇAMENTO BLOQUEADO: {sim.modules.filter(m => m.status !== 'locked').length} {scanResult === 'bigbag' ? 'gancho(s)' : 'modulo(s)'} nao travado(s)
        </div>
      )}

      {/* Banner VERDE: todos travados, içamento liberado (etapa >= 4) */}
      {sim.isRunning && sim.allLocked && sim.currentStep >= 4 && (
        <div className="p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          {scanResult === 'bigbag'
            ? 'GANCHO TRAVADO. Içamento liberado.'
            : `TODOS OS MODULOS TRAVADOS. ${sim.moduleCount}/${sim.moduleCount} confirmados. Içamento liberado.`}
        </div>
      )}

      {/* Banner VERDE: carga alocada com sucesso no destino (etapa >= 6 e módulos liberados) */}
      {sim.isRunning && sim.currentStep >= 6 && sim.modules.some(m => m.status === 'released') && (
        <div className="p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
          {scanResult === 'bigbag' ? 'Big Bag alocada com sucesso.' : 'Container alocado com sucesso.'}
        </div>
      )}

      {/* === GRID PRINCIPAL (3 colunas no desktop) === */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* COLUNA ESQUERDA: Progresso das etapas + Controle do guindaste */}
        <div className="lg:col-span-3 space-y-4">
          {/* Barra de progresso: mostra etapas com rótulos adaptados ao tipo de carga */}
          <StepProgress steps={sim.steps} stepLabels={
            scanResult === 'bigbag'
              ? { ...sim.stepLabels, pin_entry: 'Entrada de Gancho', locking: 'Fechamento de Gancho' }
              : sim.stepLabels
          } currentStep={sim.currentStep} />

          {/* Controle direcional: só habilitado na etapa 0 e após escanear */}
          <CraneControl
            onMove={sim.moveCrane}
            onConfirm={sim.confirmPositioning}
            disabled={!sim.isRunning || sim.currentStep !== 0 || (scanResult !== 'container' && scanResult !== 'bigbag')}
          />
        </div>

        {/* COLUNA CENTRAL: Canvas de visualização + Log de eventos */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Canvas: mostra guindaste, carga e módulos visualmente */}
          <SimulationCanvas
            cranePos={sim.cranePos}
            modules={sim.modules}
            isPositioned={sim.isPositioned}
            isLifted={sim.isLifted}
            cargoType={scanResult}
          />
          {/* Log: últimos 5 eventos/alertas da simulação */}
          <AlertLog alerts={sim.alerts} />
        </div>

        {/* COLUNA DIREITA: Painel de módulos/ganchos com botões Travar/Liberar */}
        <div className="lg:col-span-4">
          <CornerModules
            modules={sim.modules}
            onLock={sim.lockModules}
            onRelease={sim.releaseModules}
            canLock={sim.isRunning && sim.currentStep >= 3}      // Travar: a partir da etapa 3
            canRelease={sim.allLocked && sim.currentStep >= 6}   // Liberar: todos travados + etapa >= 6
            cargoType={scanResult}
          />
        </div>
      </div>
    </div>
  );
}
