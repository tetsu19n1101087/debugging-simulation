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

export function PythonCodeViewer() {
  const [activeTab, setActiveTab] = useState(0);
  const [openItem, setOpenItem] = useState<string>('');
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [tabClickCounts, setTabClickCounts] = useState<Record<string, number>>(
    () => ({ [pythonFiles[0].fileName]: 1 })
  );
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());

  const currentFile = pythonFiles[activeTab];

  useEffect(() => {
    const savedLines = localStorage.getItem('experimentSelectedLines');
    if (savedLines) {
      setSelectedLines(new Set(JSON.parse(savedLines)));
    }
  }, []);

  const handleAccordionChange = (value: string) => {
    if (value && value !== openItem) {
      setClickCounts((prev) => ({
        ...prev,
        [value]: (prev[value] || 0) + 1,
      }));
    }
    setOpenItem(value);
  };

  const handleTabClick = (index: number, fileName: string) => {
    setActiveTab(index);
    setOpenItem('');

    setTabClickCounts((prev) => ({
      ...prev,
      [fileName]: (prev[fileName] || 0) + 1,
    }));
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
    if (
      Object.keys(clickCounts).length > 0 ||
      Object.keys(tabClickCounts).length > 0
    ) {
      localStorage.setItem('experimentClickData', JSON.stringify(clickCounts));
      localStorage.setItem(
        'experimentTabClickData',
        JSON.stringify(tabClickCounts)
      );
    }
  }, [clickCounts, tabClickCounts]);

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
