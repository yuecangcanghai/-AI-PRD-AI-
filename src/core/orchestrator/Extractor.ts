import { usePRDStore } from '../store/usePRDStore';
import { StructuredCard, CardField } from '../types/chat';

interface ExtractedData {
  type: string;
  data: Record<string, unknown>;
}

const CARD_REGEX = /<!-- CARD -->\s*([\s\S]*?)\s*<!-- \/CARD -->/;

export class Extractor {
  extract(fullText: string): { cleanText: string; extracted: ExtractedData[] } {
    const extracted: ExtractedData[] = [];
    const regex = /<!-- EXTRACT:(\w+) -->\s*([\s\S]*?)\s*<!-- \/EXTRACT -->/g;

    let match;

    while ((match = regex.exec(fullText)) !== null) {
      const type = match[1];
      const jsonStr = match[2].trim();
      try {
        const data = JSON.parse(jsonStr);
        extracted.push({ type, data });
      } catch {
        // skip malformed extractions
      }
    }

    let cleanText = fullText.replace(regex, '').trim();
    cleanText = cleanText.replace(/<!-- STAGE_COMPLETE -->/g, '').trim();
    cleanText = cleanText.replace(CARD_REGEX, '').trim();

    return { cleanText, extracted };
  }

  // Parse an interactive form card emitted in efficient mode. Returns null when absent or malformed.
  extractCard(fullText: string): StructuredCard | null {
    const match = CARD_REGEX.exec(fullText);
    if (!match) return null;
    try {
      const raw = JSON.parse(match[1].trim());
      if (!Array.isArray(raw.fields) || raw.fields.length === 0) return null;
      const fields: CardField[] = raw.fields.map((f: Record<string, unknown>) => ({
        key: String(f.key || ''),
        label: String(f.label || ''),
        type: (['text', 'textarea', 'select', 'number'].includes(String(f.type)) ? f.type : 'text') as CardField['type'],
        value: '',
        options: Array.isArray(f.options) ? (f.options as string[]) : undefined,
        required: Boolean(f.required),
      }));
      return {
        type: String(raw.type || 'dimension'),
        title: String(raw.title || '请填写以下信息'),
        fields,
        submitted: false,
      };
    } catch {
      return null;
    }
  }

  isStageComplete(text: string): boolean {
    return text.includes('<!-- STAGE_COMPLETE -->');
  }

  applyToStore(extracted: ExtractedData[]): void {
    const prdStore = usePRDStore.getState();

    for (const item of extracted) {
      switch (item.type) {
        case 'pain_point':
          prdStore.addPainPoint({
            description: String(item.data.description || ''),
            frequency: String(item.data.frequency || ''),
            severity: String(item.data.severity || ''),
            affectedPeople: String(item.data.affectedPeople || ''),
            currentSolutions: (item.data.currentSolutions as string[]) || [],
            scene: String(item.data.scene || ''),
          });
          break;

        case 'validation':
          prdStore.setValidation({
            conclusion: String(item.data.conclusion || ''),
            isUniversal: Boolean(item.data.isUniversal),
            existingSolutions: (item.data.existingSolutions as Array<{ name: string; weakness: string }>) || [],
            marketGap: String(item.data.marketGap || ''),
            feasibilityScore: Number(item.data.feasibilityScore || 0),
          });
          break;

        case 'persona':
          prdStore.addPersona({
            name: String(item.data.name || ''),
            age: String(item.data.age || ''),
            occupation: String(item.data.occupation || ''),
            needs: String(item.data.needs || ''),
            scenario: String(item.data.scenario || ''),
            willingnessToPay: String(item.data.willingnessToPay || ''),
          });
          break;

        case 'target_market':
          prdStore.addTargetMarket(String(item.data.targetMarket || ''));
          break;

        case 'feature':
          prdStore.addFeature({
            name: String(item.data.name || ''),
            priority: (item.data.priority as 'P0' | 'P1' | 'P2' | 'P3') || 'P1',
            solvesPainPoint: String(item.data.solvesPainPoint || ''),
            complexity: (item.data.complexity as '低' | '中' | '高') || '中',
            description: String(item.data.description || ''),
          });
          break;

        case 'mvp_scope':
          prdStore.setMvpScope(String(item.data.mvpScope || ''));
          break;

        case 'user_story':
          prdStore.addUserStory(String(item.data.story || ''));
          break;

        case 'final_prd':
          prdStore.setFinalPRD(String(item.data.finalPRD || ''));
          break;
      }
    }
  }
}
