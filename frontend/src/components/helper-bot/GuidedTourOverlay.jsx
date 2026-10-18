import React from 'react';
import { usePageContext } from '../../context/PageContext';
import { Compass, ArrowRight, ArrowLeft, X, CheckCircle, Sparkles } from 'lucide-react';

export default function GuidedTourOverlay() {
  const {
    activeTour,
    tourStepIndex,
    nextTourStep,
    prevTourStep,
    endTour,
    highlightTooltip,
    clearHighlight
  } = usePageContext();

  if (!activeTour) {
    if (highlightTooltip) {
      return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-950/95 border border-violet-500/50 text-white shadow-xl text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Target: <strong className="text-violet-200">{highlightTooltip}</strong></span>
            <button
              onClick={clearHighlight}
              className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const currentStep = activeTour.steps[tourStepIndex];
  if (!currentStep) return null;

  const totalSteps = activeTour.steps.length;
  const isFirst = tourStepIndex === 0;
  const isLast = tourStepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none flex flex-col justify-end p-4 md:p-8 sm:items-center">
      {/* Semi-transparent protective backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={endTour}
      />

      {/* Floating Guided Tour Card */}
      <div 
        className="relative z-10 pointer-events-auto w-full max-w-lg bg-slate-900/95 text-white border border-violet-500/40 shadow-2xl rounded-2xl p-5 md:p-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-300"
        style={{
          boxShadow: '0 20px 50px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.2)'
        }}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-violet-600/30 text-violet-400 border border-violet-500/30">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                Guided Tour • {activeTour.title}
              </h4>
              <p className="text-sm font-bold text-slate-100">{currentStep.title}</p>
            </div>
          </div>
          <button
            onClick={endTour}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tour Body */}
        <div className="py-4 text-slate-300 text-sm leading-relaxed">
          <p>{currentStep.content}</p>
          {highlightTooltip && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-600/30 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target element highlighted on your screen!</span>
            </div>
          )}
        </div>

        {/* Step Progress & Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {activeTour.steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === tourStepIndex 
                    ? 'w-6 bg-gradient-to-r from-violet-500 to-indigo-500' 
                    : idx < tourStepIndex 
                      ? 'w-2 bg-violet-700' 
                      : 'w-2 bg-slate-700'
                }`}
              />
            ))}
            <span className="text-xs text-slate-400 ml-2 font-mono">
              {tourStepIndex + 1}/{totalSteps}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prevTourStep}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            )}
            <button
              onClick={nextTourStep}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition transform hover:-translate-y-0.5"
            >
              {isLast ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> Complete Tour
                </>
              ) : (
                <>
                  {currentStep.actionText || 'Next Step'} <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
