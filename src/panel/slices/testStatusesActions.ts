import {createAsyncThunk} from '@reduxjs/toolkit';
import {loadTestStatuses} from './testStatuses';
import {getOption} from '../../options/utils/storage';

/**
 * Charge les statuts des tests depuis le storage
 */
export const loadTestStatusesFromStorage = createAsyncThunk(
	'testStatuses/loadFromStorage',
	async (_, {dispatch}) => {
		try {
			const persistence = await getOption('statePersistence');
			const key = `testStatuses_${persistence}`;
			
			const data = await browser.storage.session.get([key]);
			const statuses = data[key] || {};
			
			console.log('📂 [TEST STATUSES] Statuts chargés:', statuses);
			
			dispatch(loadTestStatuses(statuses));
			
			return statuses;
		} catch (error) {
			console.error('❌ [TEST STATUSES] Erreur chargement:', error);
			throw error;
		}
	}
);
