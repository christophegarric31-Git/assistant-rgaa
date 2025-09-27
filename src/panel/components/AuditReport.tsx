import React from 'react';
import {useIntl} from 'react-intl';
import {useAppSelector} from '../utils/hooks';
import {selectHasAuditResults, selectAuditResults} from '../slices/audit';
import CircularChart from './CircularChart';

const AuditReport = () => {
	const intl = useIntl();
	const hasAuditResults = useAppSelector(selectHasAuditResults);
	const auditResults = useAppSelector(selectAuditResults);

	if (!hasAuditResults) {
		return null;
	}

	// Calculer les statistiques
	const totalTests = auditResults.length;
	const conformTests = auditResults.filter(result => result.overallStatus === 'OK').length;
	const nonConformTests = auditResults.filter(result => result.overallStatus === 'FAIL').length;
	const notApplicableTests = auditResults.filter(result => result.overallStatus === 'NA').length;

	// Calculer le taux de conformité : C / (C + NC)
	const conformityRate = conformTests + nonConformTests > 0 
		? Math.round((conformTests / (conformTests + nonConformTests)) * 100)
		: 0;

	return (
		<section className="AuditReport" aria-labelledby="audit-report-title">
			<div className="AuditReport-container">
				<h2 id="audit-report-title" className="AuditReport-title">
					Résultats de l'audit
				</h2>

				{/* Section Score Global */}
				<div className="AuditReport-summary">
					<div className="AuditReport-scoreCard">
						<div className="AuditReport-scoreHeader">
							<h3 className="AuditReport-scoreTitle">Score global</h3>
							<div className="AuditReport-circularChart">
								<CircularChart 
									percentage={conformityRate}
									size={120}
									strokeWidth={8}
								/>
							</div>
						</div>
						
						<div className="AuditReport-metrics">
							<div className="AuditReport-metric">
								<span className="AuditReport-metricLabel">Tests réussis :</span>
								<span className="AuditReport-metricValue">{conformTests}</span>
							</div>
							<div className="AuditReport-metric">
								<span className="AuditReport-metricLabel">Tests échoués :</span>
								<span className="AuditReport-metricValue">{nonConformTests}</span>
							</div>
							<div className="AuditReport-metric">
								<span className="AuditReport-metricLabel">Non applicables :</span>
								<span className="AuditReport-metricValue">{notApplicableTests}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Section Détails par Thème */}
				<div className="AuditReport-details">
					<h3 className="AuditReport-detailsTitle">Détails par thème</h3>
					<div className="AuditReport-themesList">
						{/* Grouper les résultats par thème */}
						{Object.entries(
							auditResults.reduce((acc, result) => {
								if (!acc[result.themeId]) {
									acc[result.themeId] = {
										themeTitle: result.themeTitle,
										results: []
									};
								}
								acc[result.themeId].results.push(result);
								return acc;
							}, {} as Record<string, {themeTitle: string; results: any[]}>)
						).map(([themeId, themeData]) => {
							const themeConformTests = themeData.results.filter(r => r.overallStatus === 'OK').length;
							const themeNonConformTests = themeData.results.filter(r => r.overallStatus === 'FAIL').length;
							const themeConformityRate = themeConformTests + themeNonConformTests > 0 
								? Math.round((themeConformTests / (themeConformTests + themeNonConformTests)) * 100)
								: 0;

							return (
								<div key={themeId} className="AuditReport-themeCard">
									<div className="AuditReport-themeHeader">
										<h4 className="AuditReport-themeTitle">
											{themeData.themeTitle.replace(/<[^>]*>/g, '')}
										</h4>
										<div className="AuditReport-themeScore">
											<CircularChart 
												percentage={themeConformityRate}
												size={60}
												strokeWidth={4}
											/>
										</div>
									</div>
									<div className="AuditReport-themeDescription">
										Vérification de la conformité RGAA
									</div>
									<div className="AuditReport-themeTests">
										{themeData.results.slice(0, 3).map((result, index) => (
											<div key={result.testId} className="AuditReport-testItem">
												<span className="AuditReport-testId">{result.testId}</span>
												<span className="AuditReport-testTitle">
													{result.testTitle.replace(/<[^>]*>/g, '').substring(0, 50)}...
												</span>
												<span className={`AuditReport-testStatus AuditReport-testStatus--${result.overallStatus.toLowerCase()}`}>
													{result.overallStatus === 'OK' ? 'PASSED' : 
													 result.overallStatus === 'FAIL' ? 'FAILED' : 'N/A'}
												</span>
											</div>
										))}
										{themeData.results.length > 3 && (
											<div className="AuditReport-moreTests">
												+{themeData.results.length - 3} autres tests
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
};

export default AuditReport;
