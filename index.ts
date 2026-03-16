#!/usr/bin/env node

import { startServer, GitHubServerOptions } from './server/index.js';
import { getI18n } from './i18n/index.js';
import { initializeI18n } from './i18n/index.js';
import { loadConfig } from './utils/config.js';

// Re-export config utilities
export * from './utils/config.js';

// Export i18n module
export * from './i18n/index.js';

// Re-export server components
export * from './server/index.js';

// Re-export repository API
export * from './api/repos/repository.js';
export * from './api/repos/types.js';

// Re-export admin API
export * from './api/admin/admin.js';
export * from './api/admin/types.js';

// Re-export issues API
export * from './api/issues/issues.js';
export * from './api/issues/types.js';

// Re-export actions API
export * from './api/actions/actions.js';
export * from './api/actions/types.js';

// Re-export users API
export * from './api/users/users.js';
export * from './api/users/types.js';

// Default CLI entry point
// ES 모듈 환경에서 실행 여부 확인 - NPX 환경 포함
const isDirectRun = process.argv[1] === import.meta.url || 
                    process.argv[1]?.endsWith('/index.js') || 
                    process.argv[1]?.endsWith('\\index.js') ||
                    process.argv[1]?.includes('@ddukbg/github-enterprise-mcp') ||
                    process.argv[0]?.includes('node') ||  // node 명령어로 직접 실행 
                    process.env.npm_execpath?.includes('npx'); // npx로 실행

// 항상 실행되는 디버그 로그 (런타임 진단용)
if (process.env.DEBUG_MCP) {
}

if (isDirectRun) {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  
  // 디버깅용 로그
  
  // Parse language argument
  let language: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--language' && i + 1 < args.length) {
      language = args[i + 1];
      break;
    } else if (args[i].startsWith('--language=')) {
      language = args[i].split('=')[1];
      break;
    }
  }
  
  const options: GitHubServerOptions = {
    config: {
      // 환경 변수에서 설정 불러오기
      baseUrl: process.env.GITHUB_ENTERPRISE_URL || process.env.GITHUB_API_URL,
      token: process.env.GITHUB_TOKEN,
      debug: process.env.DEBUG === 'true' || false,
      language: (language || process.env.LANGUAGE || 'en') as 'en' | 'ko'
    }
  };
  
  // 디버깅용 로그
  
  // Improved argument parsing
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    // Handle --option=value format
    if (arg.includes('=')) {
      let [key, value] = arg.split('=', 2);
      
      if (key === '--baseUrl' || key === '--github-api-url' || key === '--github-enterprise-url') {
        options.config!.baseUrl = value;
      }
      else if (key === '--token') {
        options.config!.token = value;
      }
      else if (key === '--transport') {
        if (value === 'http' || value === 'stdio') {
          options.transport = value;
        } else {
          console.warn(`Unsupported transport type: ${value}. Setting to 'stdio'.`);
          options.transport = 'stdio';
        }
      }
      else if (key === '--debug') {
        options.config!.debug = value !== 'false';
      }
      
      continue;
    }
    
    // Handle --option value format
    if (arg === '--baseUrl' && i + 1 < args.length) {
      options.config!.baseUrl = args[++i];
    }
    else if (arg === '--github-api-url' && i + 1 < args.length) {
      options.config!.baseUrl = args[++i];
    }
    else if (arg === '--github-enterprise-url' && i + 1 < args.length) {
      options.config!.baseUrl = args[++i];
    }
    else if (arg === '--token' && i + 1 < args.length) {
      options.config!.token = args[++i];
    }
    else if (arg === '--transport' && i + 1 < args.length) {
      const transportValue = args[++i];
      if (transportValue === 'http' || transportValue === 'stdio') {
        options.transport = transportValue;
      } else {
        console.warn(`Unsupported transport type: ${transportValue}. Setting to 'stdio'.`);
        options.transport = 'stdio';
      }
    }
    else if (arg === '--debug') {
      options.config!.debug = true;
    }
    else if (arg === '--help') {
      // Get i18n instance if available, or fall back to English
      let helpText;
      try {
        helpText = `
MCP GitHub Enterprise Server

Usage:
  npx @ddukbg/github-enterprise-mcp [options]

Options:
  --baseUrl <url>              GitHub Enterprise API base URL
                               (default: https://api.github.com)
  --github-api-url <url>       GitHub API URL (same as --baseUrl)
  --github-enterprise-url <url> GitHub Enterprise URL (same as --baseUrl)
  --token <token>              GitHub personal access token
  --transport <type>           Transport type (stdio or http)
                               (default: stdio)
  --debug                      Enable debug mode
  --language <lang>            Language (en or ko, default: en)
  --help                       Show this help

Environment Variables:
  GITHUB_ENTERPRISE_URL        GitHub Enterprise API URL
  GITHUB_API_URL               GitHub API URL
  GITHUB_TOKEN                 GitHub personal access token
  DEBUG=true                   Enable debug mode
  LANGUAGE                     Language (en or ko, default: en)
        `;
      } catch (e) {
        // Fallback if i18n is not initialized
        helpText = `
MCP GitHub Enterprise Server

Usage:
  npx @ddukbg/github-enterprise-mcp [options]

Options:
  --baseUrl <url>              GitHub Enterprise API base URL
                               (default: https://api.github.com)
  --github-api-url <url>       GitHub API URL (same as --baseUrl)
  --github-enterprise-url <url> GitHub Enterprise URL (same as --baseUrl)
  --token <token>              GitHub personal access token
  --transport <type>           Transport type (stdio or http)
                               (default: stdio)
  --debug                      Enable debug mode
  --language <lang>            Language (en or ko, default: en)
  --help                       Show this help

Environment Variables:
  GITHUB_ENTERPRISE_URL        GitHub Enterprise API URL
  GITHUB_API_URL               GitHub API URL
  GITHUB_TOKEN                 GitHub personal access token
  DEBUG=true                   Enable debug mode
  LANGUAGE                     Language (en or ko, default: en)
        `;
      }
      
      console.log(helpText);
      process.exit(0);
    }
  }

  // 설정 상태 확인

  if (options.config?.baseUrl) {
  } else {
  }
  

  // Initialize i18n with loaded config
  const config = loadConfig(options.config);
  initializeI18n(config);
  
  // Start server
  startServer(options).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} 
