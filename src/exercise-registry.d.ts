/** Public equipment policy v1 contract for JS and TypeScript callers. */
export type EquipmentState = 'available' | 'unavailable' | 'unknown';
export type DoseUnit = 'reps' | 'seconds';
export type LoadType = 'external-kg' | 'per-hand-kg' | 'assistance-kg' | 'bodyweight';
export type ExerciseId = "squat" | "bench" | "deadlift" | "safety-bar-squat" | "front-squat" | "paused-squat" | "tempo-squat" | "competition-squat" | "close-grip-bench" | "spoto-press" | "paused-bench" | "tempo-bench" | "competition-bench" | "paused-deadlift" | "deficit-deadlift" | "competition-deadlift" | "romanian-deadlift" | "bulgarian-split-squat" | "reverse-lunge" | "seated-leg-curl" | "lying-leg-curl" | "weighted-plank" | "leg-press" | "pallof-press" | "ab-wheel" | "leg-extension" | "cable-crunch" | "back-extension" | "side-plank" | "hip-thrust" | "chest-supported-row" | "one-arm-dumbbell-row" | "incline-dumbbell-press" | "low-incline-dumbbell-press" | "dumbbell-floor-press" | "triceps-pushdown" | "overhead-triceps-extension" | "seated-cable-row" | "cable-fly" | "lat-pulldown" | "neutral-grip-lat-pulldown" | "assisted-pull-up" | "single-arm-cable-pushdown" | "seated-dumbbell-shoulder-press" | "seated-neutral-grip-dumbbell-press" | "machine-shoulder-press" | "chest-supported-cable-row" | "one-arm-cable-row" | "dumbbell-lateral-raise" | "cable-lateral-raise" | "machine-lateral-raise" | "reverse-pec-deck" | "rear-delt-dumbbell-fly" | "cable-rear-delt-fly" | "face-pull" | "cable-biceps-curl" | "hammer-curl" | "preacher-curl" | "incline-dumbbell-curl" | "rope-triceps-pushdown" | "overhead-cable-triceps-extension" | "dumbbell-triceps-extension" | "bench-press" | "triceps-cable-extension";
export type EquipmentId = "ab-wheel" | "assisted-pull-up" | "back-extension-support" | "band-anchor" | "bands" | "bar-pad" | "cable-row" | "cable-station" | "chain-attachments" | "chains" | "collars" | "curl-bar" | "deadlift-bar" | "deficit-platform" | "dual-cable" | "dumbbells" | "ez-bar" | "flat-bench" | "floor" | "incline-bench" | "lat-pulldown" | "lateral-raise-machine" | "leg-extension" | "leg-press" | "lifting-floor" | "lying-leg-curl" | "neutral-pulldown-handle" | "plates" | "preacher-bench" | "pulldown-bar" | "pushdown-bar" | "rack" | "rear-foot-support" | "reverse-pec-deck" | "rope" | "row-handle" | "safeties" | "safety-squat-bar" | "seated-leg-curl" | "shoulder-press-machine" | "single-handle" | "single-handle-pair" | "straight-bar" | "supported-plank-load" | "trap-bar" | "upright-bench";
export interface EquipmentInventory {
  version: 1;
  /** Change venueId when machines or their loading conventions change. */
  venueId: string;
  confirmedAt: string;
  source?: string;
  items: Partial<Record<EquipmentId, EquipmentState>>;
  /** Exact setup confirmations for names that historically allowed ambiguity. */
  setups?: Record<string, string>;
}
export interface Exercise {
  readonly id: ExerciseId;
  readonly label: string;
  readonly purpose: string;
  readonly required: readonly EquipmentId[];
  readonly doseUnit: DoseUnit;
  readonly loadType: LoadType;
  readonly setup: string;
  readonly alternatives: readonly ExerciseId[];
}
export interface ExerciseIdentity {
  exerciseId: string;
  variantId: string;
  loadType: LoadType;
  doseUnit: DoseUnit;
}
export interface Eligibility {
  eligible: boolean;
  exerciseId: string | null;
  reasons: string[];
}
export interface ExerciseMetadata extends Partial<ExerciseIdentity> {
  equipmentPolicyVersion?: 1;
  optional?: boolean;
  [key: string]: unknown;
}
export type Prescription = [string, number, number, number, number, ExerciseMetadata?];
export interface Session {
  id?: string;
  ex?: Prescription[];
  equipmentLimitations?: Array<{exercise:string; purpose:string; optional:boolean; reasons:string[]}>;
}
export const version: 1;
export const exercises: readonly Exercise[];
export const equipment: readonly EquipmentId[];
export function resolve(name: string): Exercise | null;
export function validInventory(inventory: unknown): inventory is EquipmentInventory;
export function eligibility(name: string, inventory?: EquipmentInventory): Eligibility;
export function identity(name: string, inventory?: EquipmentInventory): ExerciseIdentity | null;
export function select(names: string[], inventory?: EquipmentInventory, preferences?: Record<string,string>, purpose?: string): string | null;
export function audit(sessions: Session[], inventory?: EquipmentInventory): {
  eligible: boolean;
  issues: Array<Eligibility & {sessionId?:string;index:number;label:string}>;
  messages: string[];
};
export function assertStart(session: Session, inventory?: EquipmentInventory): true;
