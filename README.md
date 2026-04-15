#  Simulação de Içamento de Cargas

Sistema interativo de simulação do processo de içamento de cargas por guindaste, com suporte a **Container** (4 módulos de canto) e **Big Bag** (1 gancho central).

Desenvolvido com React + TypeScript + Tailwind CSS + shadcn/ui.

---

## 📋 Como Usar a Simulação

### Passo a Passo

1. **Iniciar** —> Clique no botão `Iniciar` para ativar a simulação.
2. **Escanear Carga** —> Clique em `Escanear Carga` para identificar o tipo (Container ou Big Bag). O resultado é aleatório.
3. **Posicionar o Guindaste** —> Use as setas direcionais para mover a base até a zona central (destacada no canvas). Pressione o botão central (mira) para confirmar.
4. **Avançar Etapas** —> Clique em `Avançar` para progredir pelas etapas da operação:
   - **Posicionamento** → Centralizar a base sobre a carga
   - **Descida e Guia** → Base desce e módulos se alinham
   - **Entrada do Pino / Gancho** → Pinos ou gancho se inserem automaticamente e a base se alinha
   - **Giro e Travamento / Fechamento de Gancho** → Clique em `Travar` no painel de módulos
   - **Confirmação** → Sistema confirma que todos estão travados
   - **Içamento Seguro** → Carga é levantada (animação no canvas)
   - **Destino** → Carga chega ao destino
5. **Liberar** —> Na etapa final, clique em `Liberar` para soltar a carga.
6. **Reiniciar** —> Clique em `Reiniciar` a qualquer momento para recomeçar do zero.

### Regras de Segurança

- O controle do guindaste só funciona **após escanear** a carga.
- Não é possível avançar etapas sem **posicionar a base** corretamente.
- O **içamento é bloqueado** se algum módulo/gancho não estiver travado.
- A **liberação** só é permitida após chegar ao destino com todos travados.

---

## 🧩 Arquitetura dos Componentes

```
Simulation.tsx (Página Principal)
├── useSimulation.ts (Hook - Lógica e Estado)
├── StepProgress.tsx (Barra de Progresso)
├── CraneControl.tsx (Controle Direcional)
├── SimulationCanvas.tsx (Visualização Gráfica)
├── AlertLog.tsx (Log de Eventos)
└── CornerModules.tsx (Painel de Módulos/Gancho)
```

---

## 📁 Descrição dos Arquivos

### `src/hooks/useSimulation.ts`
**O cérebro da simulação.** Hook customizado que gerencia:
- **Estado completo**: etapa atual, posição do guindaste, módulos, tipo de carga, alertas
- **Lógica de negócio**: mover guindaste, validar posicionamento, avançar etapas com verificações de segurança, travar/liberar módulos
- **Tipos exportados**: `ModuleStatus`, `SimStep`, `CargoType`, `CornerModule`, `CranePosition`

### `src/pages/Simulation.tsx`
**Página principal.** Monta o layout e conecta todos os componentes:
- Barra de status superior (Ativo/Inativo + botão de scan)
- Banners de segurança (vermelho = bloqueado, verde = liberado)
- Grid responsivo de 3 colunas (progresso | canvas | módulos)
- Gerencia o estado do scan localmente (`scanResult`)

### `src/components/SimulationCanvas.tsx`
**Visualização gráfica.** Renderiza:
- Indicadores LED coloridos no topo (verde/vermelho/cinza por módulo)
- Área da carga (retângulo tracejado)
- Pontos de encaixe: 4 cantos (container) ou 1 central (big bag)
- Base do guindaste com cabo e animação de içamento
- Zona alvo para posicionamento

### `src/components/CornerModules.tsx`
**Painel de módulos/gancho.** Exibe:
- Cards de status por módulo (sensores superior e inferior)
- LED de status individual (verde/vermelho/cinza)
- Botões `Travar` (verde) e `Liberar` (vermelho)
- Contador de módulos travados (ex: "3/4 Travados")
- Adapta rótulos para Big Bag ("Gancho inserido" vs "Pino inserido")

### `src/components/CraneControl.tsx`
**Controle direcional.** D-pad com:
- 4 botões de seta (cima, baixo, esquerda, direita)
- Botão central de confirmação (ícone de mira)
- Desabilitado fora da etapa de posicionamento ou antes do scan

### `src/components/StepProgress.tsx`
**Barra de progresso.** Lista vertical das 7 etapas:
- ✅ Check verde = etapa concluída
- 🔵 Destaque = etapa atual
- ⚪ Opaco = etapa pendente
- Rótulos adaptáveis (ex: "Entrada de Gancho" para Big Bag)

### `src/components/AlertLog.tsx`
**Log de eventos.** Histórico das últimas 5 mensagens:
- Mensagem mais recente em destaque (fundo + negrito)
- Área com scroll fixo (altura de 112px)
- Não renderiza se não houver alertas

---

## 🔄 Diferenças: Container vs Big Bag

| Aspecto | Container | Big Bag |
|---------|-----------|---------|
| Módulos | 4 (cantos) | 1 (gancho central) |
| Visualização | 4 pontos nas quinas | 1 ponto central |
| Etapa 3 | "Entrada do Pino" | "Entrada de Gancho" |
| Etapa 4 | "Giro e Travamento" | "Fechamento de Gancho" |
| Status | "Pino inserido" | "Gancho inserido" |
| Grid módulos | 2 colunas | Coluna única |

---

## 🛠️ Tecnologias

- **React 18** + **TypeScript 5**
- **Vite 5** (build e dev server)
- **Tailwind CSS v3** (estilização)
- **shadcn/ui** (componentes base)
- **Lucide React** (ícones)
