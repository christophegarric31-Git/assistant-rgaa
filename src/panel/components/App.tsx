import React from 'react';
import AuditProgress from './AuditProgress';
import AuditReport from './AuditReport';
import EnabledTests from './EnabledTests';
import Header from './Header';
import ReferencePage from './ReferencePage';

export default function App() {
	return (
		<div className="App">
			<div className="App-content">
				<Header />
				<AuditProgress />
				<AuditReport />
				<ReferencePage />
				<EnabledTests />
			</div>
		</div>
	);
}
