import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {AuditStatus, FullAuditResult, TestAuditResult} from '../../audit/types';

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
export const selectIsAuditRunning = (state: {audit: AuditState}) => state.audit.isRunning;
export const selectCurrentTest = (state: {audit: AuditState}) => state.audit.currentTest;
export const selectAuditProgress = (state: {audit: AuditState}) => state.audit.progress;
export const selectAuditResults = (state: {audit: AuditState}) => state.audit.results;
export const selectLastAuditResult = (state: {audit: AuditState}) => state.audit.lastAuditResult;
export const selectAuditError = (state: {audit: AuditState}) => state.audit.error;
export const selectHasAuditResults = (state: {audit: AuditState}) => state.audit.results.length > 0;

// Sélecteur pour obtenir le statut d'un critère spécifique
export const selectCriterionStatus = (state: {audit: AuditState}, criterionId: string) => {
	const results = state.audit.results.filter(result => result.criterionId === criterionId);
	if (results.length === 0) return null;
	
	const hasFail = results.some(r => r.overallStatus === 'FAIL');
	const hasOK = results.some(r => r.overallStatus === 'OK');
	
	if (hasFail) return 'NC';
	if (hasOK) return 'C';
	return 'NA';
};

// Sélecteur pour obtenir le statut d'un test spécifique
export const selectTestStatus = (state: {audit: AuditState}, testId: string) => {
	const result = state.audit.results.find(r => r.testId === testId);
	return result ? result.overallStatus : null;
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