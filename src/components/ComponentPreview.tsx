'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';

export default function ComponentPreview() {
  const { activeSession } = useAppStore();

  const iframeContent = useMemo(() => {
    if (!activeSession?.generated_code?.tsx && !activeSession?.generated_code?.css) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: system-ui, -apple-system, sans-serif;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              color: #6b7280;
            }
            .placeholder {
              text-align: center;
              max-width: 400px;
            }
            .placeholder svg {
              width: 64px;
              height: 64px;
              margin: 0 auto 16px;
              opacity: 0.6;
            }
          </style>
        </head>
        <body>
          <div class="placeholder">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <h3>Component Preview</h3>
            <p>Your generated component will appear here. Start chatting to create your first component!</p>
          </div>
        </body>
        </html>
      `;
    }

    const tsxCode = activeSession.generated_code.tsx;
    const cssCode = activeSession.generated_code.css;

    // Debug logging
    console.log('🔍 ComponentPreview Debug:', {
      hasSession: !!activeSession,
      hasTsx: !!tsxCode,
      hasCss: !!cssCode,
      tsxPreview: tsxCode?.substring(0, 100) + '...',
      cssPreview: cssCode?.substring(0, 100) + '...'
    });

    // Transform TSX code to remove CSS module imports and use direct class names
    const transformedTsxCode = tsxCode
      .replace(/import\s+.*?from\s+['"].*\.module\.css['"];?\s*\n?/g, '')
      .replace(/import\s+.*?from\s+['"].*\.css['"];?\s*\n?/g, '')
      .replace(/import\s+React.*?from\s+['"]react['"];?\s*\n?/g, '')
      .replace(/styles\./g, '')
      .replace(/className={styles\.([^}]+)}/g, 'className="$1"')
      .replace(/className=\{`[^`]*\$\{styles\.([^}]+)\}[^`]*`\}/g, 'className="$1"')
      .replace(/export\s+default\s+/g, '');

    console.log('🔧 Transformed TSX:', transformedTsxCode.substring(0, 200) + '...');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: system-ui, -apple-system, sans-serif;
            background: #ffffff;
          }
          ${cssCode}
        </style>
        <script src="https://unpkg.com/react@18/umd/react.development.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js'"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js'"></script>
        <script src="https://unpkg.com/@babel/standalone@7.23.5/babel.min.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.5/babel.min.js'"></script>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { useState, useEffect, useRef } = React;
          
          try {
            console.log('🚀 Loading component code...');
            
${transformedTsxCode}

            console.log('✅ Component code executed successfully');
            
            // Find the component constructor function
            const componentNames = Object.keys(window).filter(key => 
              key.charAt(0) === key.charAt(0).toUpperCase() && 
              typeof window[key] === 'function' &&
              key !== 'React' && key !== 'ReactDOM' && key !== 'Babel'
            );
            
            console.log('🔍 Found components:', componentNames);
            
            let ComponentToRender = null;
            
            // Try specific component names first
            if (typeof BlueGradientButton !== 'undefined') {
              ComponentToRender = BlueGradientButton;
            } else if (typeof GradientButton !== 'undefined') {
              ComponentToRender = GradientButton;
            } else if (componentNames.length > 0) {
              ComponentToRender = window[componentNames[componentNames.length - 1]];
            }
            
            if (ComponentToRender) {
              console.log('✅ Component found, attempting to render...');
              const container = document.getElementById('root');
              const root = ReactDOM.createRoot(container);
              
              // Try to render with sample props
              try {
                root.render(React.createElement(ComponentToRender, {
                  label: 'Click Me!',
                  onClick: () => alert('Button clicked!'),
                  children: 'Sample Text',
                  text: 'Sample Text',
                  title: 'Sample Title',
                  className: ''
                }));
                console.log('✅ Component rendered successfully with props');
              } catch (propsError) {
                console.warn('⚠️ Failed to render with props, trying without props:', propsError.message);
                try {
                  root.render(React.createElement(ComponentToRender));
                  console.log('✅ Component rendered successfully without props');
                } catch (noPropsError) {
                  console.error('❌ Failed to render component:', noPropsError);
                  document.getElementById('root').innerHTML = 
                    '<div style="padding: 20px; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">Error rendering component: ' + noPropsError.message + '</div>';
                }
              }
            } else {
              console.error('❌ No component found');
              document.getElementById('root').innerHTML = 
                '<div style="padding: 20px; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">Error: No valid React component found. Available: ' + componentNames.join(', ') + '</div>';
            }
          } catch (error) {
            console.error('❌ Component render error:', error);
            document.getElementById('root').innerHTML = 
              '<div style="padding: 20px; color: #ef4444; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">Error: ' + error.message + '<br><br>Check console for details.</div>';
          }
        </script>
        </script>
      </body>
      </html>
    `;
  }, [activeSession?.generated_code]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Component Preview</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span>Live Preview</span>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-gray-100 p-4">
        <div className="h-full bg-white rounded-lg shadow-sm border overflow-hidden">
          <iframe
            srcDoc={iframeContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Component Preview"
          />
        </div>
      </div>
    </div>
  );
}
