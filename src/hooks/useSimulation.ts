import { useState, useCallback } from 'react';

// === TIPOS DE DADOS ===

// Status de cada módulo/gancho durante a simulação
export type ModuleStatus = 'idle' | 'aligned' | 'pin_entered' | 'locked' | 'released';

// Etapas da simulação em ordem sequencial
export type SimStep = 'positioning' | 'descending' | 'pin_entry' | 'locking' | 'confirmation' | 'lifting' | 'destination';

// Tipo de carga identificada pelo scanner
export type CargoType = 'none' | 'scanning' | 'container' | 'bigbag';

// Estrutura de um módulo de canto (container) ou gancho central (big bag)
export interface CornerModule {
  id: number;           // Identificador único do módulo
  label: string;        // Rótulo descritivo (ex: "Modulo 1 (Sup. Esq.)")
  status: ModuleStatus; // Estado atual do módulo
  sensorTop: boolean;   // Sensor superior: detecta alinhamento
  sensorBottom: boolean; // Sensor inferior: detecta travamento
}

// Posição X/Y do guindaste no canvas (0-100%)
export interface CranePosition {
  x: number;
  y: number;
}

// === CONFIGURAÇÕES FIXAS ===

// Sequência fixa de etapas da operação
const STEPS: SimStep[] = ['positioning', 'descending', 'pin_entry', 'locking', 'confirmation', 'lifting', 'destination'];

// Rótulos em PT-BR para cada etapa (padrão para container)
const STEP_LABELS: Record<SimStep, string> = {
  positioning: 'Posicionamento',
  descending: 'Descida e Guia',
  pin_entry: 'Entrada do Pino',
  locking: 'Giro e Travamento',
  confirmation: 'Confirmação',
  lifting: 'Içamento Seguro',
  destination: 'Destino',
};

// === MÓDULOS POR TIPO DE CARGA ===

// Container usa 4 módulos de canto (um em cada quina)
const containerModules = (): CornerModule[] => [
  { id: 1, label: 'Modulo 1 (Sup. Esq.)', status: 'idle', sensorTop: false, sensorBottom: false },
  { id: 2, label: 'Modulo 2 (Sup. Dir.)', status: 'idle', sensorTop: false, sensorBottom: false },
  { id: 3, label: 'Modulo 3 (Inf. Esq.)', status: 'idle', sensorTop: false, sensorBottom: false },
  { id: 4, label: 'Modulo 4 (Inf. Dir.)', status: 'idle', sensorTop: false, sensorBottom: false },
];

// Big Bag usa apenas 1 gancho central
const bigbagModules = (): CornerModule[] => [
  { id: 1, label: 'Gancho Central', status: 'idle', sensorTop: false, sensorBottom: false },
];

// === HOOK PRINCIPAL DA SIMULAÇÃO ===
export function useSimulation() {
  // --- Estado da simulação ---
  const [currentStep, setCurrentStep] = useState<number>(0);            // Índice da etapa atual (0-6)
  const [modules, setModules] = useState<CornerModule[]>(containerModules()); // Lista de módulos/ganchos ativos
  const [cranePos, setCranePos] = useState<CranePosition>({ x: 50, y: 20 }); // Posição do guindaste no canvas
  const [isPositioned, setIsPositioned] = useState(false);               // Se a base está posicionada corretamente
  const [isLifted, setIsLifted] = useState(false);                       // Se a carga está sendo içada
  const [alerts, setAlerts] = useState<string[]>([]);                    // Histórico de alertas/eventos
  const [isRunning, setIsRunning] = useState(false);                     // Se a simulação está em execução
  const [cargoType, setCargoType] = useState<CargoType>('none');         // Tipo de carga atual

  // --- Valores derivados ---
  const step = STEPS[currentStep];                                        // Nome da etapa atual
  const allLocked = modules.length > 0 && modules.every(m => m.status === 'locked'); // Se todos módulos estão travados
  const moduleCount = modules.length;                                     // Quantidade total de módulos

  // Adiciona uma mensagem ao log de alertas (máximo 5 mensagens)
  const addAlert = useCallback((msg: string) => {
    setAlerts(prev => [msg, ...prev].slice(0, 5));
  }, []);

  // Define o tipo de carga e atualiza os módulos correspondentes
  // Big Bag → 1 gancho central | Container → 4 módulos de canto
  const setCargoAndModules = useCallback((cargo: CargoType) => {
    setCargoType(cargo);
    if (cargo === 'bigbag') {
      setModules(bigbagModules());
    } else if (cargo === 'container') {
      setModules(containerModules());
    }
  }, []);

  // Move o guindaste em uma direção (apenas na etapa de posicionamento)
  const moveCrane = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    // Só permite mover na etapa 0 (Posicionamento)
    if (currentStep !== 0) {
      addAlert('Mova o guindaste apenas na etapa de Posicionamento.');
      return;
    }
    // Atualiza posição com incremento de 5%, limitando entre 0-100%
    setCranePos(prev => {
      const delta = 5;
      switch (dir) {
        case 'up': return { ...prev, y: Math.max(0, prev.y - delta) };
        case 'down': return { ...prev, y: Math.min(100, prev.y + delta) };
        case 'left': return { ...prev, x: Math.max(0, prev.x - delta) };
        case 'right': return { ...prev, x: Math.min(100, prev.x + delta) };
      }
    });
  }, [currentStep, addAlert]);

  // Confirma o posicionamento da base sobre o container
  // A base precisa estar dentro da zona central (40-60% em X e Y)
  const confirmPositioning = useCallback(() => {
    if (cranePos.x >= 40 && cranePos.x <= 60 && cranePos.y >= 40 && cranePos.y <= 60) {
      setIsPositioned(true);
      setCurrentStep(1); // Avança para "Descida e Guia"
      addAlert('Base posicionada corretamente sobre o container.');
    } else {
      addAlert('Posicione a base no centro do container (use as setas).');
    }
  }, [cranePos, addAlert]);

  // Trava todos os módulos/ganchos (só permitido a partir da etapa 3 - Travamento)
  const lockModules = useCallback(() => {
    if (currentStep < 3) {
      addAlert('Avance ate a etapa de Travamento primeiro.');
      return;
    }
    // Atualiza status de todos para 'locked' e ativa sensor inferior
    setModules(prev => prev.map(m => ({ ...m, status: 'locked' as ModuleStatus, sensorBottom: true })));
    addAlert(`Travas acionadas. ${cargoType === 'bigbag' ? 'Gancho travado.' : 'Todos os modulos travados.'}`);
  }, [currentStep, cargoType, addAlert]);

  // Libera/destrava todos os módulos (ex: ao chegar no destino)
  const releaseModules = useCallback(() => {
    if (!allLocked) {
      addAlert('Os modulos nao estao travados.');
      return;
    }
    // Atualiza status para 'released' e desativa sensor inferior
    setModules(prev => prev.map(m => ({ ...m, status: 'released' as ModuleStatus, sensorBottom: false })));
    // Mensagem diferente dependendo se já chegou ao destino (etapa >= 6)
    if (currentStep >= 6) {
      addAlert(cargoType === 'bigbag' ? 'Big Bag alocada com sucesso.' : 'Container alocado com sucesso.');
    } else {
      addAlert('Travas liberadas. Modulos destravados.');
    }
  }, [allLocked, currentStep, cargoType, addAlert]);

  // Avança para a próxima etapa da simulação
  // Contém validações de segurança em cada transição
  const advanceStep = useCallback(() => {
    // Validação: simulação deve estar ativa
    if (!isRunning) {
      addAlert('Inicie a simulação primeiro.');
      return;
    }

    // Validação: base deve estar posicionada antes de avançar
    if (!isPositioned) {
      addAlert('BLOQUEADO: Centralize a base sobre o container antes de avançar.');
      return;
    }

    const nextStep = currentStep + 1;
    // Validação: não ultrapassar a última etapa
    if (nextStep >= STEPS.length) {
      addAlert('Simulação completa!');
      return;
    }

    const target = STEPS[nextStep]; // Próxima etapa alvo

    // Validação: não pular a etapa de descida
    if (target === 'pin_entry' && currentStep < 1) {
      addAlert('Complete a descida primeiro.');
      return;
    }

    // Validação: pinos/ganchos devem estar inseridos antes de travar
    if (target === 'locking' && !modules.every(m => m.status === 'pin_entered' || m.status === 'locked')) {
      addAlert(cargoType === 'bigbag' ? 'O gancho deve estar inserido antes de travar.' : 'Todos os pinos devem estar inseridos antes de travar.');
      return;
    }

    // Validação: todos devem estar travados para confirmar
    if (target === 'confirmation' && !allLocked) {
      addAlert(cargoType === 'bigbag' ? 'O gancho deve estar travado para confirmar. Use o botao Travar.' : 'Todos os modulos devem estar travados para confirmar. Use o botao Travar.');
      return;
    }

    // Validação: içamento só com todos travados
    if (target === 'lifting' && !allLocked) {
      addAlert(`BLOQUEADO: Icamento so e permitido com ${moduleCount}/${moduleCount} modulos travados.`);
      return;
    }

    // === EFEITOS DE CADA ETAPA ===

    // Descida: alinha módulos e ativa sensor superior
    if (target === 'descending') {
      setModules(prev => prev.map(m => ({ ...m, status: 'aligned', sensorTop: true })));
    }
    // Entrada do pino/gancho: centraliza a base automaticamente e insere pinos
    if (target === 'pin_entry') {
      setCranePos({ x: 50, y: 50 }); // Alinha a base no centro
      setModules(prev => prev.map(m => ({ ...m, status: 'pin_entered' })));
    }
    // Içamento: ativa animação de subida
    if (target === 'lifting') {
      setIsLifted(true);
    }
    // Destino: desativa animação (carga chegou)
    if (target === 'destination') {
      setIsLifted(false);
    }

    setCurrentStep(nextStep);
    addAlert(`Etapa: ${STEP_LABELS[target]}`);
  }, [currentStep, isPositioned, isRunning, modules, allLocked, moduleCount, cargoType, addAlert]);

  // Inicia uma nova simulação do zero
  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setCurrentStep(0);
    setModules(containerModules()); // Começa com módulos de container (padrão)
    setCranePos({ x: 50, y: 20 }); // Posição inicial do guindaste (topo central)
    setIsPositioned(false);
    setIsLifted(false);
    setCargoType('none');           // Sem carga até escanear
    setAlerts([]);
    addAlert('Simulação iniciada. Use as setas para posicionar a base.');
  }, [addAlert]);

  // Reseta tudo para o estado inicial (simulação parada)
  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStep(0);
    setModules(containerModules());
    setCranePos({ x: 50, y: 20 });
    setIsPositioned(false);
    setIsLifted(false);
    setCargoType('none');
    setAlerts([]);
  }, []);

  // Retorna todos os estados e funções para uso nos componentes
  return {
    currentStep,       // Índice da etapa atual
    step,              // Nome da etapa atual
    steps: STEPS,      // Lista de todas as etapas
    stepLabels: STEP_LABELS, // Rótulos das etapas
    modules,           // Módulos/ganchos ativos
    cranePos,          // Posição do guindaste
    isPositioned,      // Base posicionada?
    isLifted,          // Carga sendo içada?
    isRunning,         // Simulação ativa?
    allLocked,         // Todos travados?
    alerts,            // Log de alertas
    cargoType,         // Tipo de carga
    moduleCount,       // Quantidade de módulos
    moveCrane,         // Função: mover guindaste
    confirmPositioning, // Função: confirmar posição
    advanceStep,       // Função: avançar etapa
    lockModules,       // Função: travar módulos
    releaseModules,    // Função: liberar módulos
    startSimulation,   // Função: iniciar simulação
    reset,             // Função: resetar tudo
    setCargoAndModules, // Função: definir tipo de carga
  };
}
