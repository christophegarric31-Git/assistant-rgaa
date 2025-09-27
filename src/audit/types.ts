export type AuditStatus = 'OK' | 'FAIL' | 'NA';

export interface AuditResult {
	testId: string;
	status: AuditStatus;
	message: string;
	details?: string;
}

export interface AuditInstruction {
	step: number;
	text: string;
	selector?: string;
	attributes?: string[];
	checkType: 'presence' | 'attribute' | 'content' | 'structure' | 'manual';
}

export interface TestAuditResult {
	testId: string;
	testTitle: string;
	criterionId: string;
	criterionTitle: string;
	themeId: string;
	themeTitle: string;
	results: AuditResult[];
	overallStatus: AuditStatus;
}

export interface FullAuditResult {
	version: string;
	timestamp: Date;
	url: string;
	results: TestAuditResult[];
	summary: {
		total: number;
		ok: number;
		fail: number;
		na: number;
	};
}
