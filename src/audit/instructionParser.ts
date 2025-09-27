import type {AuditInstruction} from './types';

/**
 * Parse les instructions RGAA pour extraire les étapes automatisables
 */
export class InstructionParser {
	/**
	 * Parse une instruction RGAA et retourne les étapes automatisables
	 */
	static parseInstructions(instructionHtml: string): AuditInstruction[] {
		console.log('📖 [PARSER] Début du parsing des instructions HTML');
		console.log('📖 [PARSER] HTML reçu:', instructionHtml.substring(0, 200) + '...');
		
		const instructions: AuditInstruction[] = [];
		
		// Extraire les listes ordonnées (<ol>) et leurs éléments (<li>)
		const olRegex = /<ol[^>]*>(.*?)<\/ol>/gs;
		const liRegex = /<li[^>]*>(.*?)<\/li>/gs;
		
		const olMatch = instructionHtml.match(olRegex);
		console.log('📖 [PARSER] Liste ordonnée trouvée:', olMatch ? 'OUI' : 'NON');
		
		if (!olMatch) {
			console.log('⚠️ [PARSER] Aucune liste ordonnée trouvée dans les instructions');
			return instructions;
		}
		
		const olContent = olMatch[0];
		console.log('📖 [PARSER] Contenu de la liste:', olContent.substring(0, 300) + '...');
		
		let stepNumber = 1;
		let liMatch;
		
		while ((liMatch = liRegex.exec(olContent)) !== null) {
			const stepText = liMatch[1];
			console.log(`📖 [PARSER] Étape ${stepNumber}:`, stepText.substring(0, 100) + '...');
			
			const instruction = this.parseStep(stepText, stepNumber);
			if (instruction) {
				console.log(`✅ [PARSER] Instruction automatisable trouvée pour l'étape ${stepNumber}:`, instruction);
				instructions.push(instruction);
			} else {
				console.log(`⚠️ [PARSER] Étape ${stepNumber} non automatisable (manuelle)`);
			}
			stepNumber++;
		}
		
		console.log(`📖 [PARSER] Parsing terminé - ${instructions.length} instruction(s) automatisable(s) trouvée(s)`);
		return instructions;
	}
	
	/**
	 * Parse une étape individuelle pour déterminer si elle est automatisable
	 */
	private static parseStep(stepText: string, stepNumber: number): AuditInstruction | null {
		const cleanText = this.cleanHtml(stepText);
		
		// Déterminer le type de vérification basé sur le contenu
		const checkType = this.determineCheckType(cleanText);
		
		if (checkType === 'manual') {
			return null; // Skip les étapes manuelles
		}
		
		// Extraire les sélecteurs et attributs
		const selector = this.extractSelector(cleanText);
		const attributes = this.extractAttributes(cleanText);
		
		return {
			step: stepNumber,
			text: cleanText,
			selector,
			attributes,
			checkType
		};
	}
	
	/**
	 * Détermine le type de vérification basé sur le texte
	 */
	private static determineCheckType(text: string): AuditInstruction['checkType'] {
		const lowerText = text.toLowerCase();
		
		// Vérifications de présence d'éléments
		if (lowerText.includes('retrouver') || lowerText.includes('vérifier la présence')) {
			return 'presence';
		}
		
		// Vérifications d'attributs
		if (lowerText.includes('attribut') || lowerText.includes('aria-') || lowerText.includes('alt') || lowerText.includes('title')) {
			return 'attribute';
		}
		
		// Vérifications de contenu
		if (lowerText.includes('contenu') || lowerText.includes('texte') || lowerText.includes('vide')) {
			return 'content';
		}
		
		// Vérifications de structure
		if (lowerText.includes('structure') || lowerText.includes('hiérarchie') || lowerText.includes('ordre')) {
			return 'structure';
		}
		
		// Déterminer si c'est "porteuse d'information" -> manuel
		if (lowerText.includes('porteuse d\'information') || lowerText.includes('décorative') || lowerText.includes('pertinent')) {
			return 'manual';
		}
		
		return 'manual';
	}
	
	/**
	 * Extrait le sélecteur CSS de l'instruction
	 */
	private static extractSelector(text: string): string | undefined {
		// Rechercher les balises HTML dans le texte
		const tagRegex = /<(\w+)(?:\s[^>]*)?>/g;
		const tags: string[] = [];
		let match;
		
		while ((match = tagRegex.exec(text)) !== null) {
			const tagName = match[1].toLowerCase();
			if (!tags.includes(tagName)) {
				tags.push(tagName);
			}
		}
		
		if (tags.length === 0) return undefined;
		
		// Construire le sélecteur basé sur les balises trouvées
		if (tags.includes('img')) {
			return 'img:not(a img, button img)';
		}
		if (tags.includes('area')) {
			return 'area[href]:not([nohref])';
		}
		if (tags.includes('input')) {
			return 'input[type="image"]';
		}
		if (tags.includes('svg')) {
			return 'svg';
		}
		if (tags.includes('object')) {
			return 'object[type*="image"]';
		}
		if (tags.includes('embed')) {
			return 'embed[type*="image"]';
		}
		if (tags.includes('canvas')) {
			return 'canvas';
		}
		if (tags.includes('a')) {
			return 'a[href]';
		}
		if (tags.includes('h1')) {
			return 'h1';
		}
		if (tags.includes('h2')) {
			return 'h2';
		}
		if (tags.includes('h3')) {
			return 'h3';
		}
		if (tags.includes('h4')) {
			return 'h4';
		}
		if (tags.includes('h5')) {
			return 'h5';
		}
		if (tags.includes('h6')) {
			return 'h6';
		}
		if (tags.includes('form')) {
			return 'form';
		}
		if (tags.includes('label')) {
			return 'label';
		}
		if (tags.includes('table')) {
			return 'table';
		}
		if (tags.includes('th')) {
			return 'th';
		}
		if (tags.includes('td')) {
			return 'td';
		}
		
		return tags[0];
	}
	
	/**
	 * Extrait les attributs à vérifier
	 */
	private static extractAttributes(text: string): string[] {
		const attributes: string[] = [];
		const lowerText = text.toLowerCase();
		
		// Liste des attributs courants à vérifier
		const commonAttributes = [
			'alt', 'title', 'aria-label', 'aria-labelledby', 'aria-describedby',
			'role', 'aria-hidden', 'href', 'src', 'type', 'for', 'id', 'name',
			'placeholder', 'required', 'disabled', 'readonly', 'tabindex'
		];
		
		for (const attr of commonAttributes) {
			if (lowerText.includes(attr)) {
				attributes.push(attr);
			}
		}
		
		return attributes;
	}
	
	/**
	 * Nettoie le HTML pour obtenir le texte brut
	 */
	private static cleanHtml(html: string): string {
		return html
			.replace(/<[^>]*>/g, '') // Supprimer les balises HTML
			.replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
			.replace(/&quot;/g, '"') // Remplacer les guillemets
			.replace(/&amp;/g, '&') // Remplacer les ampersands
			.replace(/&lt;/g, '<') // Remplacer les <
			.replace(/&gt;/g, '>') // Remplacer les >
			.replace(/\s+/g, ' ') // Normaliser les espaces
			.trim();
	}
}

