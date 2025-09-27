import type {AuditInstruction, AuditResult, TestAuditResult} from './types';
import {InstructionParser} from './instructionParser';

/**
 * Moteur d'audit automatique pour les tests RGAA
 */
export class AuditEngine {
	/**
	 * Exécute l'audit pour un test donné
	 */
	static async auditTest(
		testId: string,
		testTitle: string,
		criterionId: string,
		criterionTitle: string,
		themeId: string,
		themeTitle: string,
		instructionsHtml: string
	): Promise<TestAuditResult> {
		console.log(`🔍 [AUDIT] Début de l'audit du test ${testId}`, {
			testTitle,
			criterionId,
			criterionTitle,
			themeId,
			themeTitle
		});
		
		const instructions = InstructionParser.parseInstructions(instructionsHtml);
		console.log(`📋 [AUDIT] Instructions parsées pour ${testId}:`, instructions);
		
		const results: AuditResult[] = [];
		
		// Si aucune instruction automatisable, marquer comme N/A
		if (instructions.length === 0) {
			console.log(`⚠️ [AUDIT] Aucune instruction automatisable pour ${testId}`);
			return {
				testId,
				testTitle,
				criterionId,
				criterionTitle,
				themeId,
				themeTitle,
				results: [{
					testId,
					status: 'NA',
					message: 'Aucune instruction automatisable trouvée'
				}],
				overallStatus: 'NA'
			};
		}
		
		// Exécuter chaque instruction
		for (let i = 0; i < instructions.length; i++) {
			const instruction = instructions[i];
			console.log(`⚙️ [AUDIT] Exécution instruction ${i + 1}/${instructions.length} pour ${testId}:`, instruction);

			const result = await this.executeInstruction(testId, instruction, testTitle);
			console.log(`📊 [AUDIT] Résultat instruction ${i + 1} pour ${testId}:`, result);

			results.push(result);
		}
		
		// Déterminer le statut global
		const overallStatus = this.determineOverallStatus(results);
		console.log(`✅ [AUDIT] Audit terminé pour ${testId} - Statut global: ${overallStatus}`);
		
		return {
			testId,
			testTitle,
			criterionId,
			criterionTitle,
			themeId,
			themeTitle,
			results,
			overallStatus
		};
	}
	
	/**
	 * Exécute une instruction d'audit
	 */
	private static async executeInstruction(
		testId: string,
		instruction: AuditInstruction,
		testTitle: string
	): Promise<AuditResult> {
		console.log(`🔧 [AUDIT] Exécution instruction pour ${testId} - Type: ${instruction.checkType}`, instruction);

		try {
			let result: AuditResult;

			switch (instruction.checkType) {
				case 'presence':
					console.log(`🔍 [AUDIT] Vérification présence pour ${testId}`);
					result = this.checkPresence(testId, instruction, testTitle);
					break;
				case 'attribute':
					console.log(`🏷️ [AUDIT] Vérification attributs pour ${testId}`);
					result = this.checkAttributes(testId, instruction, testTitle);
					break;
				case 'content':
					console.log(`📝 [AUDIT] Vérification contenu pour ${testId}`);
					result = this.checkContent(testId, instruction, testTitle);
					break;
				case 'structure':
					console.log(`🏗️ [AUDIT] Vérification structure pour ${testId}`);
					result = this.checkStructure(testId, instruction, testTitle);
					break;
				default:
					console.log(`⚠️ [AUDIT] Type de vérification non supporté pour ${testId}: ${instruction.checkType}`);
					result = {
						testId,
						status: 'NA',
						message: `Test ${testId}: ${this.getTestContext(testTitle)} - Vérification manuelle requise`
					};
			}

			console.log(`✅ [AUDIT] Instruction terminée pour ${testId}:`, result);
			return result;

		} catch (error) {
			console.error(`❌ [AUDIT] Erreur lors de l'exécution pour ${testId}:`, error);
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Erreur lors de l'exécution: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
			};
		}
	}
	
	/**
	 * Extrait le contexte du test à partir du titre
	 */
	private static getTestContext(testTitle: string): string {
		// Supprimer les balises HTML et extraire le texte principal
		const cleanTitle = testTitle.replace(/<[^>]*>/g, '').trim();
		
		// Extraire la partie principale (avant le point d'interrogation)
		const mainPart = cleanTitle.split('?')[0];
		
		// Limiter à 100 caractères pour éviter des messages trop longs
		return mainPart.length > 100 ? mainPart.substring(0, 100) + '...' : mainPart;
	}

	/**
	 * Vérifie la présence d'éléments
	 */
	private static checkPresence(testId: string, instruction: AuditInstruction, testTitle: string): AuditResult {
		if (!instruction.selector) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Impossible de déterminer les éléments à vérifier`
			};
		}
		
		const elements = document.querySelectorAll(instruction.selector);
		
		if (elements.length === 0) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Aucun élément HTML correspondant trouvé sur la page`,
				details: `Recherche: ${instruction.selector}`
			};
		}
		
		const elementTypes = Array.from(new Set(Array.from(elements).map(el => el.tagName.toLowerCase())));
		
		return {
			testId,
			status: 'OK',
			message: `Test ${testId}: ${this.getTestContext(testTitle)} - ✅ ${elements.length} élément(s) trouvé(s)`,
			details: `Types d'éléments: ${elementTypes.join(', ')} | Sélecteur: ${instruction.selector}`
		};
	}
	
	/**
	 * Vérifie les attributs des éléments
	 */
	private static checkAttributes(testId: string, instruction: AuditInstruction, testTitle: string): AuditResult {
		if (!instruction.selector) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Impossible de déterminer les éléments à vérifier`
			};
		}
		
		const elements = document.querySelectorAll(instruction.selector);
		
		if (elements.length === 0) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Aucun élément HTML correspondant trouvé sur la page`,
				details: `Recherche: ${instruction.selector}`
			};
		}
		
		const results: string[] = [];
		let hasFailures = false;
		let totalElements = 0;
		let elementsWithIssues = 0;
		
		for (const element of elements) {
			totalElements++;
			const elementResults: string[] = [];
			let elementHasIssues = false;
			
			for (const attribute of instruction.attributes || []) {
				const value = element.getAttribute(attribute);
				
				if (value === null) {
					elementResults.push(`❌ ${attribute} manquant`);
					hasFailures = true;
					elementHasIssues = true;
				} else if (value.trim() === '') {
					elementResults.push(`⚠️ ${attribute} vide`);
					hasFailures = true;
					elementHasIssues = true;
				} else {
					elementResults.push(`✅ ${attribute} présent`);
				}
			}
			
			if (elementHasIssues) {
				elementsWithIssues++;
				results.push(`❌ ${element.tagName.toLowerCase()}: ${elementResults.join(', ')}`);
			} else {
				results.push(`✅ ${element.tagName.toLowerCase()}: ${elementResults.join(', ')}`);
			}
		}
		
		const summary = hasFailures 
			? `Test ${testId}: ${this.getTestContext(testTitle)} - ❌ ${elementsWithIssues}/${totalElements} élément(s) avec problème(s)`
			: `Test ${testId}: ${this.getTestContext(testTitle)} - ✅ ${totalElements} élément(s) conforme(s)`;
		
		return {
			testId,
			status: hasFailures ? 'FAIL' : 'OK',
			message: summary,
			details: results.join('\n')
		};
	}
	
	/**
	 * Vérifie le contenu des éléments
	 */
	private static checkContent(testId: string, instruction: AuditInstruction, testTitle: string): AuditResult {
		if (!instruction.selector) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Impossible de déterminer les éléments à vérifier`
			};
		}
		
		const elements = document.querySelectorAll(instruction.selector);
		
		if (elements.length === 0) {
			return {
				testId,
				status: 'NA',
				message: `Test ${testId}: ${this.getTestContext(testTitle)} - Aucun élément HTML correspondant trouvé sur la page`,
				details: `Recherche: ${instruction.selector}`
			};
		}
		
		const results: string[] = [];
		let hasEmptyContent = false;
		let totalElements = 0;
		let elementsWithIssues = 0;
		
		for (const element of elements) {
			totalElements++;
			const textContent = element.textContent?.trim() || '';
			const innerHTML = element.innerHTML.trim();
			
			if (textContent === '' && innerHTML === '') {
				elementsWithIssues++;
				results.push(`❌ ${element.tagName.toLowerCase()}: contenu vide`);
				hasEmptyContent = true;
			} else {
				results.push(`✅ ${element.tagName.toLowerCase()}: contenu présent`);
			}
		}
		
		const summary = hasEmptyContent 
			? `Test ${testId}: ${this.getTestContext(testTitle)} - ❌ ${elementsWithIssues}/${totalElements} élément(s) avec contenu vide`
			: `Test ${testId}: ${this.getTestContext(testTitle)} - ✅ ${totalElements} élément(s) avec contenu valide`;
		
		return {
			testId,
			status: hasEmptyContent ? 'FAIL' : 'OK',
			message: summary,
			details: results.join('\n')
		};
	}
	
	/**
	 * Vérifie la structure des éléments
	 */
	private static checkStructure(testId: string, instruction: AuditInstruction, testTitle: string): AuditResult {
		// Pour les vérifications de structure, on peut implémenter des règles spécifiques
		// Par exemple, vérifier la hiérarchie des titres, la présence de landmarks, etc.
		
		if (instruction.text.toLowerCase().includes('hiérarchie') || instruction.text.toLowerCase().includes('titre')) {
			return this.checkHeadingHierarchy(testId, testTitle);
		}
		
		return {
			testId,
			status: 'NA',
			message: `Test ${testId}: ${this.getTestContext(testTitle)} - Vérification de structure non implémentée`
		};
	}
	
	/**
	 * Vérifie la hiérarchie des titres
	 */
	private static checkHeadingHierarchy(testId: string, testTitle: string): AuditResult {
		const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
		const headingLevels: number[] = [];
		
		for (const heading of headings) {
			const level = parseInt(heading.tagName.charAt(1));
			headingLevels.push(level);
		}
		
		// Vérifier qu'il y a au moins un h1
		const hasH1 = headingLevels.includes(1);
		
		// Vérifier la progression logique
		let hasHierarchyIssue = false;
		let previousLevel = 0;
		
		for (const level of headingLevels) {
			if (level > previousLevel + 1) {
				hasHierarchyIssue = true;
				break;
			}
			previousLevel = level;
		}
		
		const issues: string[] = [];
		if (!hasH1) issues.push('Aucun titre h1 trouvé');
		if (hasHierarchyIssue) issues.push('Problème de hiérarchie des titres');
		
		return {
			testId,
			status: issues.length > 0 ? 'FAIL' : 'OK',
			message: issues.length > 0 ? issues.join(', ') : 'Hiérarchie des titres correcte',
			details: `${headingLevels.length} titre(s) trouvé(s): ${headingLevels.join(', ')}`
		};
	}
	
	/**
	 * Détermine le statut global basé sur les résultats individuels
	 */
	private static determineOverallStatus(results: AuditResult[]): 'OK' | 'FAIL' | 'NA' {
		if (results.length === 0) return 'NA';
		
		const hasFail = results.some(r => r.status === 'FAIL');
		const hasOK = results.some(r => r.status === 'OK');
		
		if (hasFail) return 'FAIL';
		if (hasOK) return 'OK';
		return 'NA';
	}
}

