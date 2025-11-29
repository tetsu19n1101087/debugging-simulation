'use client';
import type { JSX } from 'react/jsx-runtime';

interface SyntaxHighlighterProps {
  code: string;
  className?: string;
  sectionId?: string;
  onLineSelect?: (sectionId: string, lineNumber: number) => void;
  selectedLines?: Set<string>;
  showCheckboxes?: boolean;
}

export function PythonSyntaxHighlighter({
  code,
  className = '',
  sectionId,
  onLineSelect,
  selectedLines = new Set(),
  showCheckboxes = true,
}: SyntaxHighlighterProps) {
  const highlightPython = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
      const tokens: JSX.Element[] = [];
      let currentIndex = 0;

      const lineId = sectionId ? `${sectionId}-line-${lineIndex}` : '';
      const isSelected = selectedLines.has(lineId);

      const keywords =
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|raise|pass|break|continue|and|or|not|in|is|None|True|False|self|lambda|yield|assert|del|global|nonlocal|async|await)\b/g;

      const strings = /(f?["'])((?:\\.|(?!\1).)*?)\1/g;

      const comments = /#.*/g;

      const numbers = /\b\d+\.?\d*\b/g;

      const functionCalls = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;

      const matches: Array<{
        start: number;
        end: number;
        type: string;
        text: string;
      }> = [];

      let match;
      while ((match = keywords.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'keyword',
          text: match[0],
        });
      }

      strings.lastIndex = 0;
      while ((match = strings.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'string',
          text: match[0],
        });
      }

      comments.lastIndex = 0;
      while ((match = comments.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'comment',
          text: match[0],
        });
      }

      numbers.lastIndex = 0;
      while ((match = numbers.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'number',
          text: match[0],
        });
      }

      functionCalls.lastIndex = 0;
      while ((match = functionCalls.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[1].length,
          type: 'function',
          text: match[1],
        });
      }

      matches.sort((a, b) => a.start - b.start);

      const filteredMatches: typeof matches = [];
      let lastEnd = -1;
      for (const match of matches) {
        if (match.start >= lastEnd) {
          filteredMatches.push(match);
          lastEnd = match.end;
        }
      }

      filteredMatches.forEach((match, index) => {
        if (match.start > currentIndex) {
          tokens.push(
            <span
              key={`text-${lineIndex}-${index}`}
              className='text-foreground'
            >
              {line.substring(currentIndex, match.start)}
            </span>
          );
        }

        const colorClass =
          match.type === 'keyword'
            ? 'text-purple-400'
            : match.type === 'string'
            ? 'text-orange-400'
            : match.type === 'comment'
            ? 'text-green-500'
            : match.type === 'number'
            ? 'text-cyan-400'
            : match.type === 'function'
            ? 'text-yellow-300'
            : 'text-foreground';

        tokens.push(
          <span key={`match-${lineIndex}-${index}`} className={colorClass}>
            {match.text}
          </span>
        );

        currentIndex = match.end;
      });

      if (currentIndex < line.length) {
        tokens.push(
          <span key={`text-${lineIndex}-end`} className='text-foreground'>
            {line.substring(currentIndex)}
          </span>
        );
      }

      return (
        <div
          key={lineIndex}
          className={`flex items-center group hover:bg-accent/30 ${
            isSelected ? 'bg-primary/20' : ''
          }`}
        >
          {onLineSelect && sectionId ? (
            showCheckboxes ? (
              <button
                onClick={() => onLineSelect(sectionId, lineIndex)}
                className={`shrink-0 w-6 h-6 mr-2 rounded border-2 transition-all ${
                  isSelected
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                } flex items-center justify-center`}
                aria-label={`行 ${lineIndex + 1} を選択`}
              >
                {isSelected && (
                  <svg
                    className='w-4 h-4 text-primary-foreground'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path d='M5 13l4 4L19 7' />
                  </svg>
                )}
              </button>
            ) : (
              <div className='shrink-0 w-6 h-6 mr-2' />
            )
          ) : null}
          <div className='leading-relaxed whitespace-pre flex-1'>
            {tokens.length > 0 ? (
              tokens
            ) : (
              <span className='text-foreground'>{line}</span>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className={`font-mono text-sm ${className}`}
      // リガチャ（例: '==' が一つに見える）を無効化して文字間を少し広げる
      style={{
        fontVariantLigatures: 'none',
        WebkitFontFeatureSettings: '"liga" 0',
        fontFeatureSettings: '"liga" 0',
        letterSpacing: '0.02em',
      }}
    >
      <div className='overflow-x-auto'>
        <div className='inline-block min-w-max'>{highlightPython(code)}</div>
      </div>
    </div>
  );
}
