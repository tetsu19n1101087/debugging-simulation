'use client';

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { PythonSyntaxHighlighter } from './syntax-highlighter';
import pythonFiles from './python-files';

type ClickLog = {
  type: string;
  location: string;
  timestamp: number;
  sessionId: string;
};

export function PythonCodeViewer() {
  const [activeTab, setActiveTab] = useState(0);
  const [openItem, setOpenItem] = useState<string>('');
  const [clickLogs, setClickLogs] = useState<ClickLog[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());

  const currentFile = pythonFiles[activeTab];

  useEffect(() => {
    const savedLines = localStorage.getItem('experimentSelectedLines');
    if (savedLines) {
      setSelectedLines(new Set(JSON.parse(savedLines)));
    }
    const savedLogs = localStorage.getItem('experimentClickLogs');
    if (savedLogs) {
      try {
        const parsed: ClickLog[] = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) setClickLogs(parsed);
      } catch {
        // ignore parse error
      }
    }
    const savedSession = localStorage.getItem('experimentSessionId');
    if (savedSession) {
      setSessionId(savedSession);
    }
  }, []);

  const addClickLog = (type: string, location: string) => {
    const sid = ensureSessionId() as string;
    const entry: ClickLog = {
      type,
      location,
      timestamp: Date.now(),
      sessionId: sid,
    };
    setClickLogs((prev) => [...prev, entry]);
  };

  const generateSessionId = () => {
    if (
      typeof crypto !== 'undefined' &&
      typeof (crypto as any).randomUUID === 'function'
    ) {
      return (crypto as any).randomUUID();
    }
    // fallback
    return `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  };

  const ensureSessionId = () => {
    if (!sessionId) {
      const sid = generateSessionId();
      try {
        localStorage.setItem('experimentSessionId', sid);
      } catch {
        // ignore
      }
      setSessionId(sid);
      return sid;
    }
    return sessionId;
  };

  const handleAccordionChange = (value: string) => {
    if (value && value !== openItem) {
      // アコーディオンを開いた時のみログを記録
      addClickLog('accordion', value);
    }
    setOpenItem(value);
  };

  const handleTabClick = (index: number, fileName: string) => {
    setActiveTab(index);
    setOpenItem('');
    addClickLog('tab', fileName);
  };

  const handleLineSelect = (sectionId: string, lineNumber: number) => {
    const lineId = `${sectionId}-line-${lineNumber}`;
    setSelectedLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) {
        newSet.delete(lineId);
      } else {
        newSet.add(lineId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (clickLogs.length > 0) {
      localStorage.setItem('experimentClickLogs', JSON.stringify(clickLogs));
    }
  }, [clickLogs]);

  useEffect(() => {
    if (selectedLines.size > 0) {
      localStorage.setItem(
        'experimentSelectedLines',
        JSON.stringify(Array.from(selectedLines))
      );
    }
  }, [selectedLines]);

  return (
    <div className='container mx-auto p-6 max-w-5xl'>
      <Card className='bg-card border-border'>
        <div className='border-b border-border bg-muted/30'>
          <div className='flex items-center gap-2 px-4 py-2'>
            <div className='flex gap-1.5'>
              <div className='h-3 w-3 rounded-full bg-destructive/80' />
              <div className='h-3 w-3 rounded-full bg-yellow-500/80' />
              <div className='h-3 w-3 rounded-full bg-green-500/80' />
            </div>
          </div>
          <div className='flex gap-1 px-2'>
            {pythonFiles.map((file, index) => (
              <button
                key={file.fileName}
                onClick={() => handleTabClick(index, file.fileName)}
                className={`px-4 py-2 font-mono text-sm transition-colors ${
                  activeTab === index
                    ? 'bg-card text-foreground border-t-2 border-primary'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {file.fileName}
              </button>
            ))}
          </div>
        </div>

        <div className='p-6'>
          {currentFile.imports.length > 0 && (
            <div className='mb-6'>
              <PythonSyntaxHighlighter
                code={currentFile.imports.join('\n')}
                sectionId={`${currentFile.fileName}-imports`}
                onLineSelect={handleLineSelect}
                selectedLines={selectedLines}
                showCheckboxes={false}
              />
              <div className='mt-4' />
            </div>
          )}

          {currentFile.fileName === 'main.py' ? (
            // For main.py: show everything expanded (no accordion)
            <>
              {currentFile.classes.map((cls) => (
                <div key={cls.id} className='mb-6'>
                  <PythonSyntaxHighlighter
                    code={cls.signature}
                    sectionId={`${cls.id}-signature`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                    showCheckboxes={false}
                  />
                  {cls.methods.map((method) => (
                    <div key={method.id} className='ml-4 mb-4'>
                      <PythonSyntaxHighlighter
                        code={method.signature}
                        sectionId={`${method.id}-signature`}
                        onLineSelect={handleLineSelect}
                        selectedLines={selectedLines}
                        showCheckboxes={false}
                      />
                      <div className='ml-4 mt-2'>
                        <PythonSyntaxHighlighter
                          code={method.body.join('\n')}
                          sectionId={method.id}
                          onLineSelect={handleLineSelect}
                          selectedLines={selectedLines}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {currentFile.functions.map((func) => (
                <div key={func.id} className='mb-6'>
                  <div className='font-mono text-sm text-muted-foreground'>
                    {func.signature}
                  </div>
                  <div className='ml-4 mt-2'>
                    <PythonSyntaxHighlighter
                      code={func.body.join('\n')}
                      sectionId={func.id}
                      onLineSelect={handleLineSelect}
                      selectedLines={selectedLines}
                    />
                  </div>
                </div>
              ))}

              {currentFile.footer.length > 0 && (
                <div className='mt-6'>
                  <PythonSyntaxHighlighter
                    code={currentFile.footer.join('\n')}
                    sectionId={`${currentFile.fileName}-footer`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                  />
                </div>
              )}
            </>
          ) : (
            // Non-main files keep accordion behavior
            <>
              {currentFile.classes.map((cls) => (
                <div key={cls.id} className='mb-6'>
                  <PythonSyntaxHighlighter
                    code={cls.signature}
                    sectionId={`${cls.id}-signature`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                    showCheckboxes={false}
                  />

                  <Accordion
                    type='single'
                    collapsible
                    value={openItem}
                    onValueChange={handleAccordionChange}
                    className='ml-4'
                  >
                    {cls.methods.map((method) => (
                      <AccordionItem
                        key={method.id}
                        value={method.id}
                        className='border-border'
                      >
                        <AccordionTrigger className='hover:bg-accent/50 px-3 py-2 rounded text-left'>
                          <PythonSyntaxHighlighter
                            code={method.signature}
                            sectionId={`${method.id}-signature`}
                            onLineSelect={handleLineSelect}
                            selectedLines={selectedLines}
                            showCheckboxes={false}
                          />
                        </AccordionTrigger>
                        <AccordionContent className='px-3 pb-2'>
                          <div className='ml-4'>
                            <PythonSyntaxHighlighter
                              code={method.body.join('\n')}
                              sectionId={method.id}
                              onLineSelect={handleLineSelect}
                              selectedLines={selectedLines}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}

              {currentFile.functions.map((func) => (
                <div key={func.id} className='mb-6'>
                  <Accordion
                    type='single'
                    collapsible
                    value={openItem}
                    onValueChange={handleAccordionChange}
                  >
                    <AccordionItem value={func.id} className='border-border'>
                      <AccordionTrigger className='hover:bg-accent/50 px-3 py-2 rounded text-left font-mono'>
                        <span className='text-muted-foreground font-mono text-sm'>
                          {func.signature}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className='px-3 pb-2'>
                        <div className='ml-4'>
                          <PythonSyntaxHighlighter
                            code={func.body.join('\n')}
                            sectionId={func.id}
                            onLineSelect={handleLineSelect}
                            selectedLines={selectedLines}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}

              {currentFile.footer.length > 0 && (
                <div className='mt-6'>
                  <PythonSyntaxHighlighter
                    code={currentFile.footer.join('\n')}
                    sectionId={`${currentFile.fileName}-footer`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
