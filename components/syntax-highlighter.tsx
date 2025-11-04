'use client';
import type { JSX } from 'react/jsx-runtime';

interface SyntaxHighlighterProps {
  code: string;
  className?: string;
}

export function PythonSyntaxHighlighter({
  code,
  className = '',
}: SyntaxHighlighterProps) {
  const highlightPython = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, lineIndex) => {
      const tokens: JSX.Element[] = [];
      let currentIndex = 0;

      // Python keywords
      const keywords =
        /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|raise|pass|break|continue|and|or|not|in|is|None|True|False|self|lambda|yield|assert|del|global|nonlocal|async|await)\b/g;

      // Strings (single and double quotes, f-strings)
      const strings = /(f?["'])((?:\\.|(?!\1).)*?)\1/g;

      // Comments
      const comments = /#.*/g;

      // Numbers
      const numbers = /\b\d+\.?\d*\b/g;

      // Function/method calls
      const functionCalls = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;

      // Create a list of all matches with their positions
      const matches: Array<{
        start: number;
        end: number;
        type: string;
        text: string;
      }> = [];

      // Find all keywords
      let match;
      while ((match = keywords.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'keyword',
          text: match[0],
        });
      }

      // Find all strings
      strings.lastIndex = 0;
      while ((match = strings.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'string',
          text: match[0],
        });
      }

      // Find all comments
      comments.lastIndex = 0;
      while ((match = comments.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'comment',
          text: match[0],
        });
      }

      // Find all numbers
      numbers.lastIndex = 0;
      while ((match = numbers.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'number',
          text: match[0],
        });
      }

      // Find all function calls
      functionCalls.lastIndex = 0;
      while ((match = functionCalls.exec(line)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[1].length,
          type: 'function',
          text: match[1],
        });
      }

      // Sort matches by start position
      matches.sort((a, b) => a.start - b.start);

      // Remove overlapping matches (keep the first one)
      const filteredMatches: typeof matches = [];
      let lastEnd = -1;
      for (const match of matches) {
        if (match.start >= lastEnd) {
          filteredMatches.push(match);
          lastEnd = match.end;
        }
      }

      // Build the highlighted line
      filteredMatches.forEach((match, index) => {
        // Add text before this match
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

        // Add the highlighted match
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

      // Add remaining text
      if (currentIndex < line.length) {
        tokens.push(
          <span key={`text-${lineIndex}-end`} className='text-foreground'>
            {line.substring(currentIndex)}
          </span>
        );
      }

      return (
        // preserve whitespace (indentation) using Tailwind's `whitespace-pre`
        <div key={lineIndex} className='leading-relaxed whitespace-pre'>
          {tokens.length > 0 ? (
            tokens
          ) : (
            <span className='text-foreground'>{line}</span>
          )}
        </div>
      );
    });
  };

  // Ensure whitespace (spaces/tabs) are preserved so code indentation is visible
  // Wrap in an overflow container so long lines can be scrolled horizontally.
  return (
    <div className={`font-mono text-sm ${className}`}>
      <div className='overflow-x-auto'>
        {/* inline-block + min-w-max lets the inner content determine width so
            the outer container can show a horizontal scrollbar when needed */}
        <div className='inline-block min-w-max'>{highlightPython(code)}</div>
      </div>
    </div>
  );
}
