import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import type {
	AuditStatus,
	FullAuditResult,
	TestAuditResult
} from '../../audit/types';

interface AuditState {
	isRunning: boolean;
	currentTest: string | null;
	progress: {
		current: number;
		total: number;
	};
	results: TestAuditResult[];
	lastAuditResult: FullAuditResult | null;
	error: string | null;
}

const initialState: AuditState = {
	isRunning: false,
	currentTest: null,
	progress: {
		current: 0,
		total: 0
	},
	results: [],
	lastAuditResult: null,
	error: null
};

const auditSlice = createSlice({
	name: 'audit',
	initialState,
	reducers: {
		startAudit: (state, action: PayloadAction<{total: number}>) => {
			state.isRunning = true;
			state.currentTest = null;
			state.progress = {
				current: 0,
				total: action.payload.total
			};
			state.results = [];
			state.error = null;
		},

		setCurrentTest: (state, action: PayloadAction<string>) => {
			state.currentTest = action.payload;
		},

		updateProgress: (state, action: PayloadAction<number>) => {
			state.progress.current = action.payload;
		},

		addTestResult: (state, action: PayloadAction<TestAuditResult>) => {
			state.results.push(action.payload);
		},

		completeAudit: (state, action: PayloadAction<FullAuditResult>) => {
			state.isRunning = false;
			state.currentTest = null;
			state.lastAuditResult = action.payload;
		},

		setAuditError: (state, action: PayloadAction<string>) => {
			state.isRunning = false;
			state.currentTest = null;
			state.error = action.payload;
		},

		clearAuditResults: (state) => {
			state.results = [];
			state.lastAuditResult = null;
			state.error = null;
		},

		resetAudit: () => initialState
	}
});

export const {
	startAudit,
	setCurrentTest,
	updateProgress,
	addTestResult,
	completeAudit,
	setAuditError,
	clearAuditResults,
	resetAudit
} = auditSlice.actions;

export default auditSlice.reducer;

// Sélecteurs
export const selectIsAuditRunning = (state: {audit: AuditState}) =>
	state.audit.isRunning;
export const selectCurrentTest = (state: {audit: AuditState}) =>
	state.audit.currentTest;
export const selectAuditProgress = (state: {audit: AuditState}) =>
	state.audit.progress;
export const selectAuditResults = (state: {audit: AuditState}) =>
	state.audit.results;
export const selectLastAuditResult = (state: {audit: AuditState}) =>
	state.audit.lastAuditResult;
export const selectAuditError = (state: {audit: AuditState}) =>
	state.audit.error;
export const selectHasAuditResults = (state: {audit: AuditState}) =>
	state.audit.results.length > 0;

// Sélecteur pour obtenir le statut d'un critère spécifique
// Combine les résultats d'audit automatique avec l'état des checkboxes manuelles
export const selectCriterionStatus = (
	state: {audit: AuditState; tests: {enabledIds: string[]}; reference: any},
	criterionId: string
) => {
	// Récupérer les résultats d'audit automatique pour ce critère
	const auditResults = state.audit.results.filter(
		(result) => result.criterionId === criterionId
	);

	// Récupérer les tests activés manuellement pour ce critère
	const enabledTestIds = state.tests.enabledIds;
	const testsForCriterion = Object.values(state.reference.tests).filter(
		(test: any) => test.criterionId === criterionId
	);
	const enabledTestsForCriterion = testsForCriterion.filter((test: any) =>
		enabledTestIds.includes(test.id)
	);

	// Si aucun test n'est activé (ni automatique ni manuel), retourner null
	if (auditResults.length === 0 && enabledTestsForCriterion.length === 0) {
		return null;
	}

	// Priorité aux résultats d'audit automatique s'ils existent
	if (auditResults.length > 0) {
		const hasFail = auditResults.some((r) => r.overallStatus === 'FAIL');
		const hasOK = auditResults.some((r) => r.overallStatus === 'OK');

		if (hasFail) return 'NC';
		if (hasOK) return 'C';
		return 'NA';
	}

	// Sinon, utiliser l'état des checkboxes manuelles
	// Si des tests sont activés manuellement, considérer comme "en cours" (NC par défaut)
	return enabledTestsForCriterion.length > 0 ? 'NC' : null;
};

// Sélecteur pour obtenir le statut d'un test spécifique
// Combine les résultats d'audit automatique avec les statuts manuels
export const selectTestStatus = (
	state: {audit: AuditState; tests: {enabledIds: string[]}},
	testId: string
) => {
	// Priorité aux résultats d'audit automatique s'ils existent
	const auditResult = state.audit.results.find((r) => r.testId === testId);
	if (auditResult) {
		// Convertir les statuts d'audit automatique vers les statuts manuels
		switch (auditResult.overallStatus) {
			case 'OK':
				return 'C';
			case 'FAIL':
				return 'NC';
			case 'NA':
				return 'NA';
			default:
				return 'NC';
		}
	}

	// Si le test est activé manuellement mais n'a pas de résultat d'audit,
	// considérer comme "Non conforme" par défaut
	const isManuallyEnabled = state.tests.enabledIds.includes(testId);
	return isManuallyEnabled ? 'NC' : null;
};

// Action pour définir le statut d'un test
export const setTestStatus = (payload: {id: string; status: string}) => ({
	type: 'audit/setTestStatus',
	payload
});

// Action pour réinitialiser les résultats
export const resetResults = () => ({
	type: 'audit/resetResults'
});
