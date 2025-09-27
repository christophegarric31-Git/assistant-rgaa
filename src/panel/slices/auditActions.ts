import {createAsyncThunk} from '@reduxjs/toolkit';
import {AuditEngine} from '../../audit/auditEngine';
import type {FullAuditResult, TestAuditResult} from '../../audit/types';
import type {RootState} from '../store';
import {
	addTestResult,
	completeAudit,
	setAuditError,
	setCurrentTest,
	startAudit,
	updateProgress
} from './audit';
import {selectInstructionsByTest} from './instructions';
import {selectAllCriteria, selectAllTests, selectAllThemes} from './reference';

/**
 * Lance un audit complet de tous les tests RGAA
 */
export const startFullAudit = createAsyncThunk<void, void, {state: RootState}>(
	'audit/startFullAudit',
	async (_, {dispatch, getState}) => {
		console.log("🚀 [AUDIT] Début de l'audit complet");

		const state = getState();
		const themes = selectAllThemes(state);
		const criteria = selectAllCriteria(state);
		const tests = selectAllTests(state);

		console.log('📚 [AUDIT] Thèmes trouvés:', Object.keys(themes));
		console.log('📋 [AUDIT] Critères trouvés:', Object.keys(criteria));
		console.log('🧪 [AUDIT] Tests trouvés:', Object.keys(tests));

		// Compter le nombre total de tests
		const totalTests = Object.keys(tests).length;
		console.log(`📊 [AUDIT] Nombre total de tests à auditer: ${totalTests}`);
		dispatch(startAudit({total: totalTests}));

		const results: TestAuditResult[] = [];
		let currentTest = 0;

		try {
			// Parcourir tous les tests dans l'ordre (par ID pour respecter l'ordre RGAA)
			const sortedTests = Object.values(tests).sort((a, b) =>
				a.id.localeCompare(b.id)
			);

			for (const test of sortedTests) {
				currentTest++;
				console.log(
					`🔍 [AUDIT] Test ${currentTest}/${totalTests}: ${test.id} - ${test.title}`
				);

				// Récupérer le critère et le thème associés
				const criterion = criteria[test.criterionId];
				const theme = themes[criterion.themeId];

				console.log(
					`📋 [AUDIT] Critère associé: ${criterion.id} - ${criterion.title}`
				);
				console.log(`🎯 [AUDIT] Thème associé: ${theme.id} - ${theme.title}`);

				dispatch(setCurrentTest(test.id));
				dispatch(updateProgress(currentTest));

				// Récupérer les instructions pour ce test
				const instructions = selectInstructionsByTest(state, test.id);
				console.log(
					`📖 [AUDIT] Instructions trouvées pour ${test.id}:`,
					instructions ? 'OUI' : 'NON'
				);

				if (instructions) {
					// Exécuter l'audit pour ce test
					console.log(`⚙️ [AUDIT] Lancement de l'audit pour ${test.id}`);
					const testResult = await AuditEngine.auditTest(
						test.id,
						test.title,
						criterion.id,
						criterion.title,
						theme.id,
						theme.title,
						instructions
					);

					console.log(
						`✅ [AUDIT] Audit terminé pour ${test.id} - Statut: ${testResult.overallStatus}`
					);
					results.push(testResult);
					dispatch(addTestResult(testResult));
				} else {
					console.log(
						`⚠️ [AUDIT] Pas d'instructions pour ${test.id} - Test ignoré`
					);
				}

				// Petite pause pour éviter de bloquer l'interface
				await new Promise((resolve) => setTimeout(resolve, 10));
			}

			// Créer le résultat final
			const summary = {
				total: results.length,
				ok: results.filter((r) => r.overallStatus === 'OK').length,
				fail: results.filter((r) => r.overallStatus === 'FAIL').length,
				na: results.filter((r) => r.overallStatus === 'NA').length
			};

			console.log('📈 [AUDIT] Résumé final:', summary);

			const fullResult: FullAuditResult = {
				version: state.reference.version,
				timestamp: new Date(),
				url: window.location.href,
				results,
				summary
			};

			console.log('🎉 [AUDIT] Audit complet terminé avec succès');
			dispatch(completeAudit(fullResult));
		} catch (error) {
			console.error("❌ [AUDIT] Erreur lors de l'audit complet:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Erreur inconnue lors de l'audit";
			dispatch(setAuditError(errorMessage));
		}
	}
);

/**
 * Exporte les résultats d'audit au format CSV
 */
export const exportAuditResults = createAsyncThunk<
	void,
	void,
	{state: RootState}
>('audit/exportAuditResults', async (_, {getState}) => {
	const state = getState();
	const auditResult = state.audit.lastAuditResult;
	const themes = selectAllThemes(state);
	const criteria = selectAllCriteria(state);

	if (!auditResult) {
		throw new Error("Aucun résultat d'audit à exporter");
	}

	// Créer le contenu CSV avec le nouveau format
	const csvHeaders =
		'Thème;Critère;Sous critère;Libellé du sous critère;Statut\n';
	const csvRows = auditResult.results
		.map((result) => {
			// Récupérer les informations complètes
			const theme = themes[result.themeId];
			const criterion = criteria[result.criterionId];

			// Nettoyer les titres (supprimer les balises HTML)
			const cleanThemeTitle =
				theme?.title?.replace(/<[^>]*>/g, '').trim() || result.themeTitle;
			const cleanCriterionTitle =
				criterion?.title?.replace(/<[^>]*>/g, '').trim() ||
				result.criterionTitle;
			const cleanTestTitle =
				result.testTitle?.replace(/<[^>]*>/g, '').trim() || result.testTitle;

			// Déterminer le statut en français
			let statusText = '';
			switch (result.overallStatus) {
				case 'OK':
					statusText = 'Conforme';
					break;
				case 'FAIL':
					statusText = 'Non conforme';
					break;
				case 'NA':
					statusText = 'Non applicable';
					break;
				default:
					statusText = result.overallStatus;
			}

			return `"${cleanThemeTitle}";"${result.criterionId}";"${result.testId}";"${cleanTestTitle}";"${statusText}"`;
		})
		.join('\n');

	const csvContent = csvHeaders + csvRows;

	// Créer et télécharger le fichier
	const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute(
		'download',
		`audit-rgaa-${new Date().toISOString().split('T')[0]}.csv`
	);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
});
