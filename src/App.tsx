/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDocxTemplate } from './hooks/useDocxTemplate';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { VariableEditor } from './components/VariableEditor';
import { DocumentPreview } from './components/DocumentPreview';
import { GenerationBanner } from './components/GenerationBanner';
import { VariableMetadataModal } from './components/VariableMetadataModal';
import { SampleTemplatesModal } from './components/SampleTemplatesModal';
import { JsonDataModal } from './components/JsonDataModal';
import { VariableGuideModal } from './components/VariableGuideModal';
import { generateSampleDocx } from './utils/docx/sampleGenerator';
import { TemplateVariable } from './types';

export default function App() {
  const {
    templateBuffer,
    fileName,
    documentXml,
    variables,
    variableValues,
    occurrences,
    validation,
    isAnalyzing,
    isGenerating,
    error,
    generatedDocx,
    outputFileName,
    loadTemplate,
    updateVariableValue,
    updateVariableMetadata,
    resetVariableValue,
    resetAllValues,
    applyJsonValues,
    generateDocument,
    downloadGeneratedDocx,
    clearTemplate,
  } = useDocxTemplate();

  const [activeMetadataVariable, setActiveMetadataVariable] =
    useState<TemplateVariable | null>(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Handle sample template selection
  const handleSelectSample = async (templateId: string) => {
    try {
      const sample = await generateSampleDocx(templateId);
      await loadTemplate(sample.buffer, sample.fileName);
    } catch (e) {
      console.error('Failed to generate sample template:', e);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Global Header */}
      <Header
        fileName={fileName}
        variableCount={variables.length}
        onOpenSampleModal={() => setIsSampleModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onResetTemplate={templateBuffer ? clearTemplate : undefined}
        isGenerating={isGenerating}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {!templateBuffer ? (
          // Screen 1: Upload Template or Pick Sample
          <div className="h-full overflow-y-auto">
            <FileUploader
              onFileSelected={(file) => loadTemplate(file)}
              onSelectSample={handleSelectSample}
              onOpenGuideModal={() => setIsGuideModalOpen(true)}
              isAnalyzing={isAnalyzing}
              error={error}
            />
          </div>
        ) : (
          // Screen 2: Two-Panel Template Editor & Real-Time Preview
          <div className="flex h-full flex-col">
            <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
              {/* Left Panel: Variable Editor (380px - 440px) */}
              <div className="w-full flex-shrink-0 border-b border-slate-200 md:w-96 lg:w-[420px] md:border-b-0">
                <VariableEditor
                  variables={variables}
                  values={variableValues}
                  validation={validation}
                  onUpdateValue={updateVariableValue}
                  onResetValue={resetVariableValue}
                  onResetAll={resetAllValues}
                  onOpenMetadataModal={(v) => setActiveMetadataVariable(v)}
                  onOpenJsonModal={() => setIsJsonModalOpen(true)}
                  fileName={fileName}
                />
              </div>

              {/* Right Panel: Document Preview */}
              <div className="flex-1 overflow-hidden">
                <DocumentPreview
                  documentXml={documentXml}
                  templateBuffer={templateBuffer}
                  fileName={fileName}
                  values={variableValues}
                  occurrences={occurrences}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            {/* Bottom Generation Banner & Download */}
            <GenerationBanner
              fileName={fileName}
              outputFileName={outputFileName}
              validation={validation}
              isGenerating={isGenerating}
              generatedDocx={generatedDocx}
              onGenerate={generateDocument}
              onDownload={downloadGeneratedDocx}
            />
          </div>
        )}
      </main>

      {/* Variable Metadata Customization Modal */}
      <VariableMetadataModal
        variable={activeMetadataVariable}
        isOpen={Boolean(activeMetadataVariable)}
        onClose={() => setActiveMetadataVariable(null)}
        onSave={updateVariableMetadata}
      />

      {/* Sample Templates Picker Modal */}
      <SampleTemplatesModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelect={handleSelectSample}
        isLoading={isAnalyzing}
      />

      {/* JSON Integration & Data Import/Export Modal */}
      <JsonDataModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        variables={variables}
        currentValues={variableValues}
        onApplyJsonValues={applyJsonValues}
        fileName={fileName}
      />

      {/* Variable Guide & Capabilities Modal */}
      <VariableGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onTrySample={handleSelectSample}
      />
    </div>
  );
}
