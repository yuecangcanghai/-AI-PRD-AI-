import { usePRDStore } from '../store/usePRDStore';
import { StructuredCard, CardField } from '../types/chat';

interface ExtractedData {
  type: string;
  data: Record<string, unknown>;
}

// Tolerant of whitespace variations inside the comment markers: models routinely emit
// `<!--CARD-->` or `<!-- CARD  -->` instead of the exact form we ask for, and a strict
// pattern would silently drop the card while leaving raw JSON in the visible text.
const CARD_REGEX = /<!--\s*CARD\s*-->\s*([\s\S]*?)\s*<!--\s*\/CARD\s*-->/;

// Matches the whole card block including a Markdown code fence wrapped around it, so
// stripping the card from the visible text never leaves orphan ``` lines behind.
const CARD_BLOCK_REGEX =
  /(?:```[a-zA-Z]*[ \t]*\r?\n?)?<!--\s*CARD\s*-->[\s\S]*?<!--\s*\/CARD\s*-->(?:[ \t]*\r?\n?```)?/g;

// Matches an unterminated card block at the very end of the text. During streaming the
// closing marker has not arrived yet, and without this the raw JSON flashes in the bubble.
const PARTIAL_CARD_TAIL_REGEX = /(?:```[a-zA-Z]*[ \t]*\r?\n?)?<!--\s*CARD\s*-->[\s\S]*$/;

// Models sometimes fence the JSON payload inside the card markers. Unwrap before parsing.
function stripCodeFence(payload: string): string {
  return payload
    .replace(/^```[a-zA-Z]*[ \t]*\r?\n?/, '')
    .replace(/\r?\n?[ \t]*```$/, '')
    .trim();
}

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
    cleanText = cleanText.replace(CARD_BLOCK_REGEX, '').trim();
    cleanText = cleanText.replace(PARTIAL_CARD_TAIL_REGEX, '').trim();

    return { cleanText, extracted };
  }

  // Parse an interactive form card emitted in efficient mode. Returns null when absent or malformed.
  // A malformed card is never silent: extract() has already removed the block from the visible
  // text, so failing quietly would make the card vanish with no trace of why.
  extractCard(fullText: string): StructuredCard | null {
    const match = CARD_REGEX.exec(fullText);
    if (!match) return null;
    const payload = stripCodeFence(match[1]);
    try {
      const raw = JSON.parse(payload);
      if (!Array.isArray(raw.fields) || raw.fields.length === 0) {
        console.warn('[Extractor] Card block has no usable `fields` array, discarding:', payload);
        return null;
      }
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
    } catch (err) {
      console.warn('[Extractor] Failed to parse card JSON, discarding card:', err, payload);
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
            rawSurface: item.data.rawSurface ? String(item.data.rawSurface) : undefined,
            sceneSurvey: item.data.sceneSurvey ? String(item.data.sceneSurvey) : undefined,
            deepWhy: item.data.deepWhy ? String(item.data.deepWhy) : undefined,
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

        case 'scene_survey':
          prdStore.addSceneSurvey({
            interviewee: String(item.data.interviewee || ''),
            time: String(item.data.time || ''),
            place: String(item.data.place || ''),
            observedBehavior: String(item.data.observedBehavior || ''),
            stuckPoint: String(item.data.stuckPoint || ''),
            copingStrategy: String(item.data.copingStrategy || ''),
            directQuote: item.data.directQuote ? String(item.data.directQuote) : undefined,
          });
          break;

        case 'mirror_review':
          prdStore.addMirrorReview({
            featureName: String(item.data.featureName || ''),
            userSaid: String(item.data.userSaid || ''),
            realGoal: String(item.data.realGoal || ''),
            simplerPath: String(item.data.simplerPath || ''),
            verdict: (item.data.verdict as '保留' | '替换' | '删除') || '保留',
            rationale: String(item.data.rationale || ''),
          });
          break;
      }
    }
  }
}
