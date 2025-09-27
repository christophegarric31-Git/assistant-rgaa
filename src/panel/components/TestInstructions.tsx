import classNames from 'classnames';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {selectAuditResults} from '../slices/audit';
import {useAppSelector} from '../utils/hooks';

type TestInstructionsProps = {
	id: string;
	instructions: string;
	isOpen: boolean;
	onToggleRequest: (toggled: boolean) => void;
};

function TestInstructions({
	id,
	isOpen,
	onToggleRequest,
	instructions
}: TestInstructionsProps) {
	const auditResults = useAppSelector(selectAuditResults);
	const testAuditResult = auditResults.find((result) => result.testId === id);

	const containerClass = classNames('TestInstructions', 'TestSection', {
		'is-open': isOpen
	});
	const textClass = classNames('TestSection-body', {
		'u-hidden': !isOpen
	});

	const toggle = () => onToggleRequest(!isOpen);

	return (
		<div className={containerClass}>
			<h3 className="TestSection-header">
				<button
					type="button"
					className="TestSection-title TestSection-toggle InvisibleButton"
					onClick={toggle}
					aria-expanded={isOpen}
					aria-controls={`TestInstructions-${id}`}
				>
					<FormattedMessage id="Test.instructions" />
				</button>
			</h3>

			<div
				id={`TestInstructions-${id}`}
				className={textClass}
				// biome-ignore lint/security/noDangerouslySetInnerHtml :
				dangerouslySetInnerHTML={{
					__html: instructions
				}}
			/>

			{testAuditResult && (
				<div className="TestAuditResults">
					<h4>Résultats de l'audit automatique</h4>
					<div
						className={`TestAuditStatus TestAuditStatus--${testAuditResult.overallStatus.toLowerCase()}`}
					>
						<span className="TestAuditStatus-icon">
							{testAuditResult.overallStatus === 'OK' && '✅'}
							{testAuditResult.overallStatus === 'FAIL' && '❌'}
							{testAuditResult.overallStatus === 'NA' && '⚠️'}
						</span>
						<span className="TestAuditStatus-text">
							{testAuditResult.overallStatus === 'OK' && 'Conforme'}
							{testAuditResult.overallStatus === 'FAIL' && 'Non conforme'}
							{testAuditResult.overallStatus === 'NA' && 'Non applicable'}
						</span>
					</div>

					{testAuditResult.results.length > 0 && (
						<div className="TestAuditDetails">
							<h5>Détails des vérifications :</h5>
							<ul>
								{testAuditResult.results.map((result, index) => (
									<li
										key={`${result.testId}-${index}`}
										className={`TestAuditDetail TestAuditDetail--${result.status.toLowerCase()}`}
									>
										<div className="TestAuditDetail-header">
											<span className="TestAuditDetail-icon">
												{result.status === 'OK' && '✅'}
												{result.status === 'FAIL' && '❌'}
												{result.status === 'NA' && '⚠️'}
											</span>
											<span className="TestAuditDetail-message">
												{result.message}
											</span>
										</div>
										{result.details && (
											<div className="TestAuditDetail-details">
												<details>
													<summary>Voir les détails</summary>
													<pre>{result.details}</pre>
												</details>
											</div>
										)}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default TestInstructions;
