import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { GlobalConfig } from '@n8n/config';
import { User } from '@n8n/db';
import { Service } from '@n8n/di';

import { createWorkflowDetailsTool } from './tools/get-workflow-details.tool';
import { createSearchWorkflowsTool } from './tools/search-workflows.tool';
import { createListPromptsTool } from './tools/list-prompts.tool';
import { createGetPromptTool } from './tools/get-prompt.tool';
import { createRenderPromptTool } from './tools/render-prompt.tool';
import { createSearchPromptsTool } from './tools/search-prompts.tool';

import { CredentialsService } from '@/credentials/credentials.service';
import { DataTableService } from '@/modules/data-table/data-table.service';
import { UrlService } from '@/services/url.service';
import { Telemetry } from '@/telemetry';
import { WorkflowFinderService } from '@/workflows/workflow-finder.service';
import { WorkflowService } from '@/workflows/workflow.service';

@Service()
export class McpService {
	constructor(
		private readonly workflowFinderService: WorkflowFinderService,
		private readonly workflowService: WorkflowService,
		private readonly urlService: UrlService,
		private readonly credentialsService: CredentialsService,
		private readonly globalConfig: GlobalConfig,
		private readonly telemetry: Telemetry,
		private readonly dataTableService: DataTableService,
	) {}

	getServer(user: User) {
		const server = new McpServer({
			name: 'n8n MCP Server',
			version: '1.0.0',
		});

		// Workflow tools
		const workflowSearchTool = createSearchWorkflowsTool(
			user,
			this.workflowService,
			this.telemetry,
		);
		server.registerTool(
			workflowSearchTool.name,
			workflowSearchTool.config,
			workflowSearchTool.handler,
		);

		const workflowDetailsTool = createWorkflowDetailsTool(
			user,
			this.urlService.getWebhookBaseUrl(),
			this.workflowFinderService,
			this.credentialsService,
			{
				webhook: this.globalConfig.endpoints.webhook,
				webhookTest: this.globalConfig.endpoints.webhookTest,
			},
			this.telemetry,
		);
		server.registerTool(
			workflowDetailsTool.name,
			workflowDetailsTool.config,
			workflowDetailsTool.handler,
		);

		// Prompts tools
		const listPromptsTool = createListPromptsTool(
			user,
			this.dataTableService,
			this.telemetry,
		);
		server.registerTool(
			listPromptsTool.name,
			listPromptsTool.config,
			listPromptsTool.handler,
		);

		const getPromptTool = createGetPromptTool(
			user,
			this.dataTableService,
			this.telemetry,
		);
		server.registerTool(
			getPromptTool.name,
			getPromptTool.config,
			getPromptTool.handler,
		);

		const renderPromptTool = createRenderPromptTool(
			user,
			this.dataTableService,
			this.telemetry,
		);
		server.registerTool(
			renderPromptTool.name,
			renderPromptTool.config,
			renderPromptTool.handler,
		);

		const searchPromptsTool = createSearchPromptsTool(
			user,
			this.dataTableService,
			this.telemetry,
		);
		server.registerTool(
			searchPromptsTool.name,
			searchPromptsTool.config,
			searchPromptsTool.handler,
		);

		return server;
	}
}
