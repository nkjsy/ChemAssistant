
import { GoogleGenAI, Type } from "@google/genai";
import { Molecule, ReactionResult, ElementType } from '../types';
import { autoLayoutMolecule } from './layoutService';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Identifies a molecule based on its atoms and bonds using Gemini.
 */
export const identifyMolecule = async (molecule: Molecule): Promise<string> => {
  const ai = getClient();

  const atomList = molecule.atoms.map(a => `${a.element} (id:${a.id})`).join(', ');
  const bondList = molecule.bonds.map(b => `${b.sourceAtomId}-${b.targetAtomId} (order:${b.order})`).join(', ');
  
  // Calculate formula locally as a fallback hint
  const counts: Record<string, number> = {};
  molecule.atoms.forEach(a => {
    counts[a.element] = (counts[a.element] || 0) + 1;
  });
  const formula = Object.entries(counts).map(([el, count]) => `${el}${count > 1 ? count : ''}`).join('');

  const systemInstruction = `
    You are an expert chemist.
    User provides a list of atoms and bonds representing a molecule.
    Your task is to identify the common name of this molecule.
    If it has a well-known common name (e.g., Water, Ethanol, Aspirin, Caffeine), use that.
    Otherwise, use the IUPAC name.
    If it's an invalid or disconnected structure, return "Unknown Structure".
    Return ONLY the name as a plain string, no markdown, no explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Atoms: ${atomList}\nBonds: ${bondList}\nFormula Hint: ${formula}`,
      config: {
        systemInstruction,
        responseMimeType: "text/plain",
      }
    });
    
    let name = response.text?.trim();
    // Fallback if AI returns nothing or error text
    if (!name || name.length > 50) return formula;
    return name;
  } catch (error) {
    console.error("Identification failed", error);
    return formula; // Fallback to formula
  }
};

/**
 * Generates a reaction prediction based on input molecules.
 */
export const simulateReaction = async (reactants: Molecule[]): Promise<ReactionResult> => {
  const ai = getClient();

  // Prepare the prompt input
  const reactantDescriptions = reactants.map(r => {
    // Count atoms to build a formula string if not present
    const counts: Record<string, number> = {};
    r.atoms.forEach(a => {
      counts[a.element] = (counts[a.element] || 0) + 1;
    });
    const formula = Object.entries(counts).map(([el, count]) => `${el}${count > 1 ? count : ''}`).join('');
    return `${r.name || 'Unknown Molecule'} (${formula})`;
  }).join(' + ');

  const systemInstruction = `
    You are an expert computational chemist. 
    Users will provide a list of reactant molecules.
    Your task is to:
    1. Predict the most likely chemical reaction.
    2. Balance the equation.
    3. Generate the structure of the product molecules (atoms and bonds).
    
    IMPORTANT: Return the atomic structure (graph) for the products so they can be visualized.
    For the structure of products:
    - Use standard element symbols (H, C, O, N, Cl, Na, S, F, P, Mg, K, Ca, Fe, Br, I).
    - Create a logical connectivity (bonds).
    - 'id' for atoms should be unique integers as strings (e.g., "1", "2").
    - 'order' for bonds is 1 (single), 2 (double), or 3 (triple).
    - Ensure every bond connects two existing atom IDs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Reactants: ${reactantDescriptions}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            equation: { type: Type.STRING, description: "The balanced chemical equation string" },
            explanation: { type: Type.STRING, description: "A brief 1-sentence explanation of the reaction" },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  atoms: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        element: { type: Type.STRING },
                      }
                    }
                  },
                  bonds: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING },
                        order: { type: Type.INTEGER }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Clean potential Markdown formatting (```json ... ```)
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?\s*/, "").replace(/\s*```$/, "");
    }

    const data = JSON.parse(text);

    // Map the raw AI response to our application Molecule type
    const products: Molecule[] = (data.products || []).map((p: any, index: number) => {
      // Validate atoms
      const validAtoms = (p.atoms || []).filter((a: any) => a.id && a.element);
      const atomIdSet = new Set(validAtoms.map((a: any) => a.id));

      // Validate bonds (ensure source and target exist)
      const validBonds = (p.bonds || []).filter((b: any) => 
        atomIdSet.has(b.source) && atomIdSet.has(b.target)
      );

      const rawMolecule = {
        id: `product-${index}-${Date.now()}`,
        name: p.name || "Product",
        // Initialize with basic coordinates, layout service will fix them
        atoms: validAtoms.map((a: any) => ({
          id: String(a.id),
          element: a.element as ElementType, 
          x: 0, 
          y: 0
        })),
        bonds: validBonds.map((b: any, bIndex: number) => ({
          id: `bond-${index}-${bIndex}`,
          sourceAtomId: String(b.source),
          targetAtomId: String(b.target),
          order: b.order || 1
        }))
      };

      // Apply auto-layout to ensure the molecule has a valid visual structure before returning
      // Using a standard 400x300 box for the initial layout
      return autoLayoutMolecule(rawMolecule, 400, 300);
    });

    return {
      equation: data.equation || "Reaction Complete",
      explanation: data.explanation || "The reactants formed new products.",
      products
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to simulate reaction. Please try again.");
  }
};
