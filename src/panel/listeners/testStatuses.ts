import type {AppStartListening} from '../middlewares/listener';
import {setTestStatus, clearTestStatus, clearAllTestStatuses} from '../slices/testStatuses';
import {getOption} from '../../options/utils/storage';

export const addTestStatusesListeners = (startListening: AppStartListening) => {
	// Persister les statuts quand ils changent
	startListening({
		actionCreator: setTestStatus,
		effect: async ({payload}, api) => {
			try {
				const persistence = await getOption('statePersistence');
				const key = `testStatuses_${persistence}`;
				
				// Récupérer les statuts existants
				const existing = await browser.storage.session.get([key]);
				const currentStatuses = existing[key] || {};
				
				// Ajouter le nouveau statut
				currentStatuses[payload.id] = payload.status;
				
				// Sauvegarder
				await browser.storage.session.set({
					[key]: currentStatuses
				});
				
				console.log('💾 [TEST STATUSES] Statut sauvegardé:', payload);
			} catch (error) {
				console.error('❌ [TEST STATUSES] Erreur sauvegarde:', error);
			}
		}
	});

	// Persister la suppression d'un statut
	startListening({
		actionCreator: clearTestStatus,
		effect: async ({payload}, api) => {
			try {
				const persistence = await getOption('statePersistence');
				const key = `testStatuses_${persistence}`;
				
				// Récupérer les statuts existants
				const existing = await browser.storage.session.get([key]);
				const currentStatuses = existing[key] || {};
				
				// Supprimer le statut
				delete currentStatuses[payload];
				
				// Sauvegarder
				await browser.storage.session.set({
					[key]: currentStatuses
				});
				
				console.log('🗑️ [TEST STATUSES] Statut supprimé:', payload);
			} catch (error) {
				console.error('❌ [TEST STATUSES] Erreur suppression:', error);
			}
		}
	});

	// Persister la suppression de tous les statuts
	startListening({
		actionCreator: clearAllTestStatuses,
		effect: async (_, api) => {
			try {
				const persistence = await getOption('statePersistence');
				const key = `testStatuses_${persistence}`;
				
				// Supprimer tous les statuts
				await browser.storage.session.remove([key]);
				
				console.log('🗑️ [TEST STATUSES] Tous les statuts supprimés');
			} catch (error) {
				console.error('❌ [TEST STATUSES] Erreur suppression globale:', error);
			}
		}
	});
};
