import React from 'react';
import {useIntl} from 'react-intl';
import {
	selectAuditProgress,
	selectCurrentTest,
	selectIsAuditRunning
} from '../slices/audit';
import {useAppSelector} from '../utils/hooks';

const AuditProgress = () => {
	const intl = useIntl();
	const isRunning = useAppSelector(selectIsAuditRunning);
	const progress = useAppSelector(selectAuditProgress);
	const currentTest = useAppSelector(selectCurrentTest);

	// Logs visibles pour debug
	console.log('🔍 [AUDIT PROGRESS] État:', {isRunning, progress, currentTest});

	if (!isRunning) {
		return null;
	}

	const percentage =
		progress.total > 0
			? Math.round((progress.current / progress.total) * 100)
			: 0;

	return (
		<div className="AuditProgress">
			<div className="AuditProgress-header">
				<h3>Audit automatique en cours...</h3>
			</div>

			<div className="AuditProgress-bar">
				<div className="AuditProgress-fill" style={{width: `${percentage}%`}} />
			</div>

			<div className="AuditProgress-info">
				<span className="AuditProgress-current">
					Test {progress.current} sur {progress.total}
				</span>
				{currentTest && (
					<span className="AuditProgress-test">{currentTest}</span>
				)}
			</div>

			{/* Debug info visible */}
			<div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
				Debug: {isRunning ? 'En cours' : 'Arrêté'} | Progression:{' '}
				{progress.current}/{progress.total} | Test actuel:{' '}
				{currentTest || 'Aucun'}
			</div>
		</div>
	);
};

export default AuditProgress;
