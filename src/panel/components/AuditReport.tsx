import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useAppSelector} from '../utils/hooks';
import {selectHasAuditResults, selectAuditResults} from '../slices/audit';
import CircularChart from './CircularChart';

const AuditReport = () => {
	const intl = useIntl();
	const hasAuditResults = useAppSelector(selectHasAuditResults);
	const auditResults = useAppSelector(selectAuditResults);
	
	// États pour la gestion des collapses et pagination
	const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
	const [expandedThemes, setExpandedThemes] = useState<Record<string, number>>({});

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

	// Grouper les résultats par thème
	const themesData = auditResults.reduce((acc, result) => {
		if (!acc[result.themeId]) {
			acc[result.themeId] = {
				themeTitle: result.themeTitle,
				results: []
			};
		}
		acc[result.themeId].results.push(result);
		return acc;
	}, {} as Record<string, {themeTitle: string; results: any[]}>);

	// Fonction pour gérer l'expansion des tests d'un thème
	const handleShowMoreTests = (themeId: string) => {
		const currentShown = expandedThemes[themeId] || 3;
		const totalTests = themesData[themeId].results.filter(r => r.overallStatus !== 'NA').length;
		const nextShown = Math.min(currentShown + 3, totalTests);
		setExpandedThemes(prev => ({...prev, [themeId]: nextShown}));
	};

	return (
		<>
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
									<span className="AuditReport-metricLabel">Total évalué :</span>
									<span className="AuditReport-metricValue">{conformTests + nonConformTests}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Section Détails par Thème - Collapsible */}
					<div className="AuditReport-details">
						<details 
							className="AuditReport-detailsCollapse"
							open={isDetailsExpanded}
							onToggle={(e) => setIsDetailsExpanded((e.target as HTMLDetailsElement).open)}
						>
							<summary className="AuditReport-detailsSummary">
								<h3 className="AuditReport-detailsTitle">Détails par thème</h3>
								<span className="AuditReport-detailsToggle" aria-hidden="true">
									{isDetailsExpanded ? '▼' : '▶'}
								</span>
							</summary>
							
							<div className="AuditReport-themesList">
								{Object.entries(themesData).map(([themeId, themeData]) => {
									const themeConformTests = themeData.results.filter(r => r.overallStatus === 'OK').length;
									const themeNonConformTests = themeData.results.filter(r => r.overallStatus === 'FAIL').length;
									const themeConformityRate = themeConformTests + themeNonConformTests > 0 
										? Math.round((themeConformTests / (themeConformTests + themeNonConformTests)) * 100)
										: 0;

									const applicableTests = themeData.results.filter(r => r.overallStatus !== 'NA');
									const currentlyShown = expandedThemes[themeId] || 3;
									const testsToShow = applicableTests.slice(0, currentlyShown);

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
												{testsToShow.map((result) => (
													<div key={result.testId} className="AuditReport-testItem">
														<span className="AuditReport-testId">{result.testId}</span>
														<span className="AuditReport-testTitle">
															{result.testTitle.replace(/<[^>]*>/g, '').substring(0, 50)}...
														</span>
														<span className={`AuditReport-testStatus AuditReport-testStatus--${result.overallStatus.toLowerCase()}`}>
															{result.overallStatus === 'OK' ? 'PASSED' : 'FAILED'}
														</span>
													</div>
												))}
												{currentlyShown < applicableTests.length && (
													<button 
														className="AuditReport-moreTests"
														onClick={() => handleShowMoreTests(themeId)}
														aria-label={`Afficher ${Math.min(3, applicableTests.length - currentlyShown)} tests supplémentaires pour ${themeData.themeTitle.replace(/<[^>]*>/g, '')}`}
													>
														+{Math.min(3, applicableTests.length - currentlyShown)} autres tests évalués
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</details>
					</div>
				</div>
			</section>

			{/* Section Audit Détaillé */}
			<section className="AuditReport AuditReport--detailed" aria-labelledby="detailed-audit-title">
				<div className="AuditReport-container">
					<h2 id="detailed-audit-title" className="AuditReport-title">
						Audit détaillé
					</h2>
					<div className="AuditReport-detailedContent">
						<p className="AuditReport-detailedDescription">
							Consultez ci-dessous la liste complète des critères RGAA avec leurs résultats détaillés.
							Chaque test affiche son statut et les détails de vérification.
						</p>
					</div>
				</div>
			</section>
		</>
	);
};

export default AuditReport;
