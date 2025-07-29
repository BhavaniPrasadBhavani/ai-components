import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { SessionsService } from '../sessions/sessions.service';
import { ChatMessage } from '../sessions/session.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    private sessionsService: SessionsService,
  ) {}

  /**
   * Streams AI-generated React component code using OpenAI gpt-4o-mini via GitHub Models API
   * Requires a GitHub token with access to GitHub Models marketplace
   * Note: o1-mini is not available in GitHub Models, using gpt-4o-mini which is highly capable
   */
  async streamComponentGeneration(
    sessionId: string,
    userId: string,
    prompt: string,
  ) {
    try {
      const session = await this.sessionsService.findOne(sessionId, userId);

    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert React component generator specialized in creating production-ready, error-free components. Your code must work perfectly in browser environments with Babel transpilation.

## CRITICAL REQUIREMENTS - MUST FOLLOW:

### 1. BABEL COMPATIBILITY RULES (ESSENTIAL):
- NEVER use method calls directly on template literals inside JSX: ❌ className={\`base \${prop}\`.trim()}
- ALWAYS compute className in a variable first: ✅ const cls = \`base \${prop || ''}\`.trim(); then use className={cls}
- NEVER chain methods on template literals inside JSX curly braces
- ALWAYS handle undefined props with || '' or default parameters

### 2. PROP HANDLING (MANDATORY):
- Use destructuring with defaults: { label = 'Default', className = '', disabled = false, ...props }
- ALWAYS provide fallbacks for optional props: prop || '' or prop ?? ''
- NEVER assume props exist without checking

### 3. COMPONENT STRUCTURE TEMPLATE:
\`\`\`tsx
import React from 'react';

interface ComponentNameProps {
  // Required props first
  label: string;
  // Optional props with ? and defaults
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  label = 'Default Label',
  className = '',
  disabled = false,
  onClick = () => {},
  ...props 
}) => {
  // 1. ALWAYS compute className in a variable (BABEL SAFE)
  const componentClassName = \`base-class \${className}\`.trim();
  
  // 2. Handle any other computed values here
  
  return (
    <button 
      className={componentClassName}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};

export default ComponentName;
\`\`\`

### 4. CSS REQUIREMENTS:
- Use regular CSS class selectors (.button-class)
- NO CSS modules or imports
- Include hover, focus, and disabled states
- Use modern CSS properties (flexbox, grid)
- Ensure accessibility (focus outlines, proper contrast)

### 5. TYPESCRIPT REQUIREMENTS:
- Proper interface definitions
- Extend appropriate HTML element props when needed
- Use React.FC<PropsType> typing
- Include proper event handler types

### 6. ACCESSIBILITY REQUIREMENTS:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- High contrast colors
- Screen reader compatibility

### 7. EXAMPLE GENERATION FOR BUTTON:
\`\`\`tsx
import React from 'react';

interface GradientButtonProps {
  label: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  label = 'Button',
  className = '',
  disabled = false,
  onClick = () => {},
  variant = 'primary',
  ...props 
}) => {
  // SAFE: Compute className in variable (Babel compatible)
  const buttonClassName = \`gradient-button gradient-button--\${variant} \${className}\`.trim();
  
  return (
    <button 
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      {...props}
    >
      {label}
    </button>
  );
};

export default GradientButton;
\`\`\`

\`\`\`css
.gradient-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  position: relative;
  overflow: hidden;
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.gradient-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.gradient-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.gradient-button--primary {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.gradient-button--secondary {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}
\`\`\`

## RESPONSE FORMAT:
Always respond with exactly this format:

\`\`\`tsx
[Your component code following all rules above]
\`\`\`

\`\`\`css
[Your CSS code with proper selectors and states]
\`\`\`

Remember: The most common error is template literal method chaining in JSX. ALWAYS use variables for computed values!`,
      },
      ...session.chat_history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const apiKey = this.configService.get<string>('LLM_API_KEY');
    const baseURL = this.configService.get<string>('LLM_BASE_URL') || 'https://models.inference.ai.azure.com';
    
    if (!apiKey) {
      throw new BadRequestException('LLM API key not configured');
    }

    // Create GitHub Models client (which provides access to OpenAI models)
    const githubModels = createOpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    // Stream response from OpenAI gpt-4o-mini model via GitHub Models
    // Note: o1-mini is not available in GitHub Models, using gpt-4o-mini instead
    const result = await streamText({
      model: githubModels('gpt-4o-mini'),
      messages,
      temperature: 0.3, // Adjusted temperature for gpt-4o-mini
      maxTokens: 4000,
    });

    this.logger.log(`Successfully initiated stream generation for session: ${sessionId}`);
    return result.textStream;
    
    } catch (error) {
      this.logger.error(`Failed to generate component for session ${sessionId}:`, error);
      throw new BadRequestException(`Failed to generate component: ${error.message}`);
    }
  }

  extractCodeFromResponse(response: string): { tsx: string; css: string } {
    const tsxMatch = response.match(/```tsx\n([\s\S]*?)\n```/);
    const cssMatch = response.match(/```css\n([\s\S]*?)\n```/);

    return {
      tsx: tsxMatch ? tsxMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
    };
  }
}
