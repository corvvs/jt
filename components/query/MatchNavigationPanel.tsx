import React from 'react';
import { FaChevronUp, FaChevronDown, FaStepBackward } from 'react-icons/fa';
import { InlineIcon } from '../lv1/InlineIcon';
import { useManipulation } from '@/states/manipulation';

interface MatchNavigationPanelProps {
  goToNextMatch: () => void;
  goToPreviousMatch: () => void;
  goToFirstMatch: () => void;
  matchedCount: number;
  currentMatchIndex: number;
  compact?: boolean;
}

export const MatchNavigationPanel: React.FC<MatchNavigationPanelProps> = ({
  goToNextMatch,
  goToPreviousMatch,
  goToFirstMatch,
  matchedCount,
  currentMatchIndex,
  compact = false,
}) => {
  const { filteringPreference } = useManipulation();

  // LightUpモードでない場合は表示しない
  if (filteringPreference.resultAppearance !== 'lightup' || matchedCount === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="match-navigation-compact">
        <div>
          <span className="match-counter-compact">
            {currentMatchIndex > 0 ? currentMatchIndex : '-'} / {matchedCount}
          </span>
          
          <div className="match-buttons-compact">
            <button
              onClick={goToFirstMatch}
              disabled={matchedCount === 0}
              title="最初のマッチした行に移動 (Ctrl+1)"
              className="match-nav-button-compact"
            >
              <InlineIcon i={<FaStepBackward />} />
            </button>
            
            <button
              onClick={goToPreviousMatch}
              disabled={matchedCount === 0}
              title="前のマッチした行に移動 (Shift+F3)"
              className="match-nav-button-compact"
            >
              <InlineIcon i={<FaChevronUp />} />
            </button>
            
            <button
              onClick={goToNextMatch}
              disabled={matchedCount === 0}
              title="次のマッチした行に移動 (F3)"
              className="match-nav-button-compact"
            >
              <InlineIcon i={<FaChevronDown />} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-navigation-panel">
      <div className="match-navigation-content">
        <div className="match-info">
          <span className="match-counter">
            {currentMatchIndex > 0 ? currentMatchIndex : '-'} / {matchedCount}
          </span>
        </div>
        
        <div className="match-buttons">
          <button
            onClick={goToFirstMatch}
            disabled={matchedCount === 0}
            title="最初のマッチした行に移動 (Ctrl+1)"
            className="match-nav-button"
          >
            <InlineIcon i={<FaStepBackward />} />
          </button>
          
          <button
            onClick={goToPreviousMatch}
            disabled={matchedCount === 0}
            title="前のマッチした行に移動 (Shift+F3 または Ctrl+Shift+G)"
            className="match-nav-button"
          >
            <InlineIcon i={<FaChevronUp />} />
          </button>
          
          <button
            onClick={goToNextMatch}
            disabled={matchedCount === 0}
            title="次のマッチした行に移動 (F3 または Ctrl+G)"
            className="match-nav-button"
          >
            <InlineIcon i={<FaChevronDown />} />
          </button>
        </div>
      </div>
    </div>
  );
};
