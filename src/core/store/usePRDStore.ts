import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRDData, createEmptyPRD, PainPoint, Persona, Feature, SceneSurvey, MirrorReview } from '../types/prd';

interface PRDState {
  prd: PRDData;
  updateMeta: (meta: Partial<PRDData['meta']>) => void;
  addPainPoint: (pp: PainPoint) => void;
  updatePainPoint: (index: number, pp: PainPoint) => void;
  setValidation: (v: Partial<PRDData['validation']>) => void;
  addTargetMarket: (market: string) => void;
  addPersona: (p: Persona) => void;
  updatePersona: (index: number, p: Persona) => void;
  addFeature: (f: Feature) => void;
  updateFeature: (index: number, f: Feature) => void;
  setMvpScope: (scope: string) => void;
  addUserStory: (story: string) => void;
  setFinalPRD: (prd: string) => void;
  addSceneSurvey: (s: SceneSurvey) => void;
  updateSceneSurvey: (index: number, s: SceneSurvey) => void;
  clearSceneSurveys: () => void;
  addMirrorReview: (m: MirrorReview) => void;
  updateMirrorReview: (index: number, m: MirrorReview) => void;
  clearMirrorReview: () => void;
  clearValidation: () => void;
  clearUserGroups: () => void;
  clearRequirements: () => void;
  clearFinalPRD: () => void;
  resetPRD: () => void;
  updatePRD: (updater: (prd: PRDData) => PRDData) => void;
}

export const usePRDStore = create<PRDState>()(
  persist(
    (set) => ({
      prd: createEmptyPRD(),
      updateMeta: (meta) =>
        set((state) => ({
          prd: { ...state.prd, meta: { ...state.prd.meta, ...meta, updatedAt: new Date().toISOString() } },
        })),
      addPainPoint: (pp) =>
        set((state) => ({
          prd: { ...state.prd, painPoints: [...state.prd.painPoints, pp], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      updatePainPoint: (index, pp) =>
        set((state) => ({
          prd: { ...state.prd, painPoints: state.prd.painPoints.map((p, i) => (i === index ? pp : p)), meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setValidation: (v) =>
        set((state) => ({
          prd: { ...state.prd, validation: { ...state.prd.validation, ...v }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addTargetMarket: (market) =>
        set((state) => ({
          prd: { ...state.prd, userGroups: { ...state.prd.userGroups, targetMarket: market }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addPersona: (p) =>
        set((state) => ({
          prd: { ...state.prd, userGroups: { ...state.prd.userGroups, personas: [...state.prd.userGroups.personas, p] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      updatePersona: (index, p) =>
        set((state) => ({
          prd: { ...state.prd, userGroups: { ...state.prd.userGroups, personas: state.prd.userGroups.personas.map((x, i) => (i === index ? p : x)) }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addFeature: (f) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, features: [...state.prd.requirements.features, f] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      updateFeature: (index, f) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, features: state.prd.requirements.features.map((x, i) => (i === index ? f : x)) }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setMvpScope: (scope) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, mvpScope: scope }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addUserStory: (story) =>
        set((state) => ({
          prd: { ...state.prd, requirements: { ...state.prd.requirements, userStories: [...state.prd.requirements.userStories, story] }, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      setFinalPRD: (prd) =>
        set((state) => ({
          prd: { ...state.prd, finalPRD: prd, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addSceneSurvey: (s) =>
        set((state) => ({
          prd: { ...state.prd, sceneSurveys: [...state.prd.sceneSurveys, s], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      updateSceneSurvey: (index, s) =>
        set((state) => ({
          prd: { ...state.prd, sceneSurveys: state.prd.sceneSurveys.map((x, i) => (i === index ? s : x)), meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearSceneSurveys: () =>
        set((state) => ({
          prd: { ...state.prd, sceneSurveys: [], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      addMirrorReview: (m) =>
        set((state) => ({
          prd: { ...state.prd, mirrorReview: [...state.prd.mirrorReview, m], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      updateMirrorReview: (index, m) =>
        set((state) => ({
          prd: { ...state.prd, mirrorReview: state.prd.mirrorReview.map((x, i) => (i === index ? m : x)), meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearMirrorReview: () =>
        set((state) => ({
          prd: { ...state.prd, mirrorReview: [], meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearValidation: () =>
        set((state) => ({
          prd: { ...state.prd, validation: createEmptyPRD().validation, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearUserGroups: () =>
        set((state) => ({
          prd: { ...state.prd, userGroups: createEmptyPRD().userGroups, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearRequirements: () =>
        set((state) => ({
          prd: { ...state.prd, requirements: createEmptyPRD().requirements, meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      clearFinalPRD: () =>
        set((state) => ({
          prd: { ...state.prd, finalPRD: '', meta: { ...state.prd.meta, updatedAt: new Date().toISOString() } },
        })),
      resetPRD: () => set({ prd: createEmptyPRD() }),
      updatePRD: (updater) => set((state) => ({ prd: updater(state.prd) })),
    }),
    { name: 'productforge-prd' },
  ),
);
