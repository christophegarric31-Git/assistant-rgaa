import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {TestStatus} from '../../common/types';

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
export const {setTestStatus, clearTestStatus, clearAllTestStatuses} = actions;
export const {selectTestStatus: selectManualTestStatus, selectAllTestStatuses} = selectors;
export default reducer;
