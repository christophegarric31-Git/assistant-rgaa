import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {TestStatus} from '../../common/types';
import {getOption} from '../../options/utils/storage';

type TestStatusesState = {
	statuses: Record<string, TestStatus>;
};

const initialState: TestStatusesState = {
	statuses: {}
};

const testStatusesSlice = createSlice({
	name: 'testStatuses',
	initialState,
	reducers: {
		setTestStatus(
			state,
			action: PayloadAction<{
				id: string;
				status: TestStatus;
			}>
		) {
			const {id, status} = action.payload;
			state.statuses[id] = status;
		},

		clearTestStatus(state, action: PayloadAction<string>) {
			delete state.statuses[action.payload];
		},

		clearAllTestStatuses(state) {
			state.statuses = {};
		},

		// Action pour charger les statuts depuis le storage
		loadTestStatuses(state, action: PayloadAction<Record<string, TestStatus>>) {
			state.statuses = action.payload;
		}
	},
	selectors: {
		selectTestStatus(state, testId: string): TestStatus | null {
			return state.statuses[testId] || null;
		},

		selectAllTestStatuses(state) {
			return state.statuses;
		}
	}
});

const {actions, reducer, selectors} = testStatusesSlice;
export const {setTestStatus, clearTestStatus, clearAllTestStatuses, loadTestStatuses} = actions;
export const {selectTestStatus: selectManualTestStatus, selectAllTestStatuses} = selectors;
export default reducer;
