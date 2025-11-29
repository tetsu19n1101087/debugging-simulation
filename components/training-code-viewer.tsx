'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { PythonSyntaxHighlighter } from './syntax-highlighter';
import { trainingPythonFiles } from './python-files';

export function TrainingCodeViewer() {
  const [activeTab, setActiveTab] = useState(0);
  const [openItem, setOpenItem] = useState<string>('');
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());

  const currentFile = (trainingPythonFiles as any)[activeTab];

  const handleAccordionChange = (value: string) => {
    setOpenItem(value);
  };

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setOpenItem('');
  };

  const handleLineSelect = (sectionId: string, lineNumber: number) => {
    const lineId = `${sectionId}-line-${lineNumber}`;
    setSelectedLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) newSet.delete(lineId);
      else newSet.add(lineId);
      return newSet;
    });
  };

  return (
    <div className='container mx-auto p-6 max-w-5xl'>
      <Card className='bg-card border-border pt-0'>
        <div className='border-b border-border bg-muted/30'>
          <div className='flex items-center gap-2 px-4 py-2'>
            <div className='flex gap-1.5'>
              <div className='h-3 w-3 rounded-full bg-destructive/80' />
              <div className='h-3 w-3 rounded-full bg-yellow-500/80' />
              <div className='h-3 w-3 rounded-full bg-green-500/80' />
            </div>
          </div>
          <div className='flex gap-1 px-2'>
            {trainingPythonFiles.map((file, index) => (
              <button
                key={file.fileName}
                onClick={() => handleTabClick(index)}
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
            <>
              {currentFile.classes.map((cls: any) => (
                <div key={cls.id} className='mb-6'>
                  <PythonSyntaxHighlighter
                    code={cls.signature}
                    sectionId={`${cls.name}-signature`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                    showCheckboxes={false}
                  />
                  {cls.methods.map((method: any) => (
                    <div key={method.id} className='ml-4 mb-4'>
                      <PythonSyntaxHighlighter
                        code={method.signature}
                        sectionId={`${cls.name}.${method.name}-signature`}
                        onLineSelect={handleLineSelect}
                        selectedLines={selectedLines}
                        showCheckboxes={false}
                      />
                      <div className='ml-4 mt-2'>
                        <PythonSyntaxHighlighter
                          code={method.body.join('\n')}
                          sectionId={`${cls.name}.${method.name}`}
                          onLineSelect={handleLineSelect}
                          selectedLines={selectedLines}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {currentFile.functions.map((func: any) => (
                <div key={func.id} className='mb-6'>
                  <PythonSyntaxHighlighter
                    code={func.signature}
                    sectionId={`${func.name}-signature`}
                    onLineSelect={handleLineSelect}
                    selectedLines={selectedLines}
                    showCheckboxes={false}
                  />
                  <div className='mt-2'>
                    <PythonSyntaxHighlighter
                      code={func.body.join('\n')}
                      sectionId={`${func.name}`}
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
            <>
              {currentFile.classes.map((cls: any) => (
                <div key={cls.id} className='mb-6'>
                  <PythonSyntaxHighlighter
                    code={cls.signature}
                    sectionId={`${cls.name}-signature`}
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
                    {cls.methods.map((method: any) => (
                      <AccordionItem
                        key={method.id}
                        value={`${cls.name}.${method.name}`}
                        className='border-border'
                      >
                        <AccordionTrigger className='hover:bg-accent/50 px-3 py-2 rounded text-left'>
                          <PythonSyntaxHighlighter
                            code={method.signature}
                            sectionId={`${cls.name}.${method.name}-signature`}
                            onLineSelect={handleLineSelect}
                            selectedLines={selectedLines}
                            showCheckboxes={false}
                          />
                        </AccordionTrigger>
                        <AccordionContent className='px-3 pb-2'>
                          <div className=''>
                            <PythonSyntaxHighlighter
                              code={method.body.join('\n')}
                              sectionId={`${cls.name}.${method.name}`}
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

              {currentFile.functions.map((func: any) => (
                <div key={func.id} className='mb-6'>
                  <Accordion
                    type='single'
                    collapsible
                    value={openItem}
                    onValueChange={handleAccordionChange}
                  >
                    <AccordionItem
                      value={`${func.name}`}
                      className='border-border'
                    >
                      <AccordionTrigger className='hover:bg-accent/50 px-3 py-2 rounded text-left font-mono'>
                        <PythonSyntaxHighlighter
                          code={func.signature}
                          sectionId={`${func.name}-signature`}
                          onLineSelect={handleLineSelect}
                          selectedLines={selectedLines}
                          showCheckboxes={false}
                        />
                      </AccordionTrigger>
                      <AccordionContent className='px-3 pb-2'>
                        <div className=''>
                          <PythonSyntaxHighlighter
                            code={func.body.join('\n')}
                            sectionId={`${func.name}`}
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
